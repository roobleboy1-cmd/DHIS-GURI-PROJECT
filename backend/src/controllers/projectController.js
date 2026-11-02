import { query } from '../config/database.js';
import { success, error as sendError, paginated } from '../utils/apiResponse.js';
import { notifyUser, notifyAdmins } from '../utils/notify.js';

export const getAllProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    // Role-based filtering
    if (req.user.role === 'engineer') {
      params.push(req.user.id);
      conditions.push(`p.engineer_id = $${params.length}`);
    } else if (req.user.role === 'client') {
      params.push(req.user.id);
      conditions.push(`p.client_id = $${params.length}`);
    } else if (req.user.role === 'worker') {
      params.push(req.user.id);
      conditions.push(`p.id IN (SELECT project_id FROM project_workers WHERE worker_id = $${params.length} AND status = 'active')`);
    }

    if (status) {
      params.push(status);
      conditions.push(`p.status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.title ILIKE $${params.length} OR p.location ILIKE $${params.length})`);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await query(`SELECT COUNT(*) FROM projects p ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT p.*, c.full_name as client_name, c.email as client_email, c.phone as client_phone,
              eng.full_name as engineer_name, eng.email as engineer_email, eng.phone as engineer_phone
       FROM projects p
       LEFT JOIN users c ON p.client_id = c.id
       LEFT JOIN users eng ON p.engineer_id = eng.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return paginated(res, result.rows, page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await query(
      `SELECT p.*, c.full_name as client_name, c.email as client_email, c.phone as client_phone, c.avatar_url as client_avatar,
       eng.full_name as engineer_name, eng.email as engineer_email, eng.phone as engineer_phone, eng.avatar_url as engineer_avatar
       FROM projects p
       LEFT JOIN users c ON p.client_id = c.id
       LEFT JOIN users eng ON p.engineer_id = eng.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (project.rows.length === 0) return sendError(res, 'Project not found.', 404);

    const p = project.rows[0];
    if (req.user.role === 'client' && p.client_id !== req.user.id) return sendError(res, 'Not authorized.', 403);
    if (req.user.role === 'engineer' && p.engineer_id !== req.user.id) return sendError(res, 'Not authorized.', 403);

    const workers = await query(
      `SELECT pw.*, u.full_name as worker_name, u.avatar_url as worker_avatar, u.phone as worker_phone, wp.skill
       FROM project_workers pw
       JOIN users u ON pw.worker_id = u.id
       LEFT JOIN worker_profiles wp ON pw.worker_id = wp.user_id
       WHERE pw.project_id = $1`,
      [req.params.id]
    );

    const progress = await query(
      `SELECT pp.*, u.full_name as updated_by_name
       FROM project_progress pp JOIN users u ON pp.updated_by = u.id
       WHERE pp.project_id = $1 ORDER BY pp.created_at DESC`,
      [req.params.id]
    );

    const payments = await query(
      `SELECT py.*, c.full_name as client_name
       FROM payments py JOIN users c ON py.client_id = c.id
       WHERE py.project_id = $1 ORDER BY py.created_at DESC`,
      [req.params.id]
    );

    return success(res, {
      ...p,
      workers: workers.rows,
      recent_progress: progress.rows,
      payments: payments.rows
    });
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { request_id, engineer_id, client_id, title, description, location, budget, start_date, estimated_end_date } = req.body;

    const result = await query(
      `INSERT INTO projects (request_id, engineer_id, client_id, title, description, location, budget, start_date, estimated_end_date, status, progress_percentage)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, 'in_progress', 0) RETURNING *`,
      [request_id || null, engineer_id, client_id, title, description, location, budget || 0, start_date || 'CURRENT_DATE', estimated_end_date || null]
    );

    const newProject = result.rows[0];

    if (request_id) {
      await query("UPDATE construction_requests SET status = 'approved', updated_at = NOW() WHERE id = $1", [request_id]);
    }

    // Fetch names for notification
    const cRes = await query('SELECT full_name FROM users WHERE id = $1', [client_id]);
    const engRes = await query('SELECT full_name FROM users WHERE id = $1', [engineer_id]);
    const clientName = cRes.rows[0]?.full_name || 'Client';
    const engineerName = engRes.rows[0]?.full_name || 'Engineer';

    // Notify Client
    await notifyUser({
      userId: client_id,
      title: 'Howsha Dhismaha Gurigaaga Waa La Bilaabay! 🚀',
      message: `Mashruuca dhismaha "${title}" ayaa si toos ah u bilaabmay! Injineerka kormeeraya waa ${engineerName}. Hadda toos ugala soco boggaaga mashaariicda.`,
      type: 'project',
      referenceId: newProject.id,
      referenceType: 'project'
    });

    // Notify Engineer
    await notifyUser({
      userId: engineer_id,
      title: 'Mashruuc Cusub oo Bilaabmay 🏗️',
      message: `Waxaa laguu magacaabay Injineerka masuulka ka ah mashruuca "${title}" ee macmiilka ${clientName}.`,
      type: 'project',
      referenceId: newProject.id,
      referenceType: 'project'
    });

    return success(res, newProject, 'Project created.', 201);
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { title, description, location, budget, start_date, estimated_end_date } = req.body;

    const result = await query(
      `UPDATE projects SET
       title = COALESCE($1,title), description = COALESCE($2,description),
       location = COALESCE($3,location), budget = COALESCE($4,budget),
       start_date = COALESCE($5,start_date), estimated_end_date = COALESCE($6,estimated_end_date),
       updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [title, description, location, budget, start_date, estimated_end_date, req.params.id]
    );

    if (result.rows.length === 0) return sendError(res, 'Project not found.', 404);
    return success(res, result.rows[0], 'Project updated.');
  } catch (err) {
    next(err);
  }
};

export const updateProjectStatus = async (req, res, next) => {
  try {
    const { status, progress_percentage } = req.body;
    const projectId = req.params.id;

    let extraFields = '';
    const params = [status, projectId];

    const isCompleted = status === 'completed' || Number(progress_percentage) >= 100;
    if (isCompleted) {
      extraFields = ', actual_end_date = NOW(), progress_percentage = 100';
    } else if (progress_percentage !== undefined) {
      params.splice(1, 0, progress_percentage);
      extraFields = `, progress_percentage = $2`;
      params[params.length - 1] = projectId;
    }

    const result = await query(
      `UPDATE projects SET status = $1${extraFields}, updated_at = NOW()
       WHERE id = $${params.length} RETURNING *`,
      params
    );

    if (result.rows.length === 0) return sendError(res, 'Project not found.', 404);
    const updated = result.rows[0];

    // Notification on project completion
    if (isCompleted) {
      await notifyUser({
        userId: updated.client_id,
        title: 'Dhismihii Gurigaaga Waa La Dhameystiray! 🏆',
        message: `Hambalyo! Dhismaha mashruuca "${updated.title}" si rasmi ah ayaa loo dhameystiray. Fadlan eeg faahfaahinta goobta oo samee lacag-bixinta kama dambaysta ah.`,
        type: 'project',
        referenceId: updated.id,
        referenceType: 'project'
      });

      await notifyAdmins({
        title: 'Mashruuc Dhameystirmay 🏆',
        message: `Mashruuca "${updated.title}" ayaa loo calaamadeeyay Dhameystiran.`,
        type: 'project',
        referenceId: updated.id,
        referenceType: 'project'
      });
    }

    return success(res, updated, 'Project status updated.');
  } catch (err) {
    next(err);
  }
};

export const assignWorker = async (req, res, next) => {
  try {
    const { worker_id, role } = req.body;

    const existing = await query(
      'SELECT id FROM project_workers WHERE project_id = $1 AND worker_id = $2',
      [req.params.id, worker_id]
    );
    if (existing.rows.length > 0) return sendError(res, 'Worker already assigned.', 409);

    const result = await query(
      `INSERT INTO project_workers (project_id, worker_id, role) VALUES ($1,$2,$3) RETURNING *`,
      [req.params.id, worker_id, role || 'worker']
    );

    // Notify worker
    const projRes = await query('SELECT title FROM projects WHERE id = $1', [req.params.id]);
    await notifyUser({
      userId: worker_id,
      title: 'Waxaa Laguu Xilsaaray Goob Dhisme 🔨',
      message: `Waxaa lagugu daray kooxda dhismaha ee mashruuca "${projRes.rows[0]?.title}" sida ${role || 'Field Specialist'}.`,
      type: 'project',
      referenceId: Number(req.params.id),
      referenceType: 'project'
    });

    return success(res, result.rows[0], 'Worker assigned.', 201);
  } catch (err) {
    next(err);
  }
};

export const removeWorker = async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE project_workers SET status = 'removed', removed_at = NOW()
       WHERE project_id = $1 AND worker_id = $2 RETURNING *`,
      [req.params.id, req.params.workerId]
    );
    if (result.rows.length === 0) return sendError(res, 'Assignment not found.', 404);
    return success(res, result.rows[0], 'Worker removed.');
  } catch (err) {
    next(err);
  }
};
