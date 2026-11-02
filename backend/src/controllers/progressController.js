import { query } from '../config/database.js';
import { success, error as sendError } from '../utils/apiResponse.js';
import { notifyUser, notifyAdmins } from '../utils/notify.js';

export const getProjectProgress = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT pp.*, u.full_name as updated_by_name
       FROM project_progress pp JOIN users u ON pp.updated_by = u.id
       WHERE pp.project_id = $1
       ORDER BY pp.created_at DESC`,
      [req.params.projectId]
    );
    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

export const addProgress = async (req, res, next) => {
  try {
    const { title, description, progress_percentage, image_url } = req.body;
    const projectId = req.params.projectId;

    const result = await query(
      `INSERT INTO project_progress (project_id, updated_by, title, description, progress_percentage, image_url)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [projectId, req.user.id, title, description, progress_percentage || 0, image_url]
    );

    // Fetch project details for client notification
    const projRes = await query(
      `SELECT p.*, c.full_name as client_name, eng.full_name as engineer_name
       FROM projects p
       JOIN users c ON p.client_id = c.id
       LEFT JOIN users eng ON p.engineer_id = eng.id
       WHERE p.id = $1`,
      [projectId]
    );
    const proj = projRes.rows[0];

    if (progress_percentage !== undefined && proj) {
      const pct = Math.min(100, Math.max(0, Number(progress_percentage)));
      const isCompleted = pct >= 100;
      const statusUpdate = isCompleted ? 'completed' : (proj.status === 'planning' ? 'in_progress' : proj.status);

      await query(
        `UPDATE projects
         SET progress_percentage = $1,
             status = $2,
             actual_end_date = CASE WHEN $3 THEN CURRENT_DATE ELSE actual_end_date END,
             updated_at = NOW()
         WHERE id = $4`,
        [pct, statusUpdate, isCompleted, projectId]
      );

      // Automated client notifications
      if (isCompleted) {
        await notifyUser({
          userId: proj.client_id,
          title: 'Dhismihii Gurigaaga Waa La Dhameystiray! 🏆',
          message: `Hambalyo! Dhismaha mashruucaaga "${proj.title}" wuxuu gaaray 100% waana la dhameystiray! Fadlan eeg sawirrada goobta oo samee lacag-bixinta kama dambaysta ah.`,
          type: 'project',
          referenceId: Number(projectId),
          referenceType: 'project'
        });

        await notifyAdmins({
          title: 'Mashruuc Dhameystirmay 🏆',
          message: `Mashruuca "${proj.title}" ee uu gacanta ku hayay Injineer ${proj.engineer_name || 'Engineer'} wuxuu gaaray 100% waxaana loo calaamadeeyay Dhameystiran.`,
          type: 'project',
          referenceId: Number(projectId),
          referenceType: 'project'
        });
      } else {
        await notifyUser({
          userId: proj.client_id,
          title: `Horumar Cusub: ${pct}% Goobta Dhismaha 🏗️`,
          message: `Dhismaha gurigaaga "${proj.title}" waxaa lagu daray heer cusub: "${title}" (${pct}% ayaa la dhameeyay).`,
          type: 'progress',
          referenceId: Number(projectId),
          referenceType: 'project'
        });
      }
    }

    return success(res, result.rows[0], 'Progress recorded and client notified.', 201);
  } catch (err) {
    next(err);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const { title, description, progress_percentage, image_url } = req.body;

    const existing = await query('SELECT * FROM project_progress WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return sendError(res, 'Progress entry not found.', 404);
    if (existing.rows[0].updated_by !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized.', 403);
    }

    const result = await query(
      `UPDATE project_progress SET
       title = COALESCE($1,title), description = COALESCE($2,description),
       progress_percentage = COALESCE($3,progress_percentage), image_url = COALESCE($4,image_url)
       WHERE id = $5 RETURNING *`,
      [title, description, progress_percentage, image_url, req.params.id]
    );

    const projectId = existing.rows[0].project_id;
    if (progress_percentage !== undefined) {
      const pct = Math.min(100, Math.max(0, Number(progress_percentage)));
      const isCompleted = pct >= 100;

      await query(
        `UPDATE projects
         SET progress_percentage = $1,
             status = CASE WHEN $2 THEN 'completed' ELSE status END,
             actual_end_date = CASE WHEN $2 THEN CURRENT_DATE ELSE actual_end_date END,
             updated_at = NOW()
         WHERE id = $3`,
        [pct, isCompleted, projectId]
      );
    }

    return success(res, result.rows[0], 'Progress updated.');
  } catch (err) {
    next(err);
  }
};

export const deleteProgress = async (req, res, next) => {
  try {
    const existing = await query('SELECT * FROM project_progress WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return sendError(res, 'Progress entry not found.', 404);
    if (existing.rows[0].updated_by !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized.', 403);
    }

    await query('DELETE FROM project_progress WHERE id = $1', [req.params.id]);
    return success(res, null, 'Progress deleted.');
  } catch (err) {
    next(err);
  }
};
