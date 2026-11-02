import { query } from '../config/database.js';
import { success, error as sendError, paginated } from '../utils/apiResponse.js';
import { notifyUser, notifyAdmins } from '../utils/notify.js';

export const createRequest = async (req, res, next) => {
  try {
    const { house_id, engineer_id, description, budget, location } = req.body;

    const result = await query(
      `INSERT INTO construction_requests (client_id, house_id, engineer_id, description, budget, location, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
      [req.user.id, house_id || null, engineer_id || null, description, budget || null, location]
    );

    const newRequest = result.rows[0];

    // Fetch client and house information for rich notifications
    const clientRes = await query('SELECT full_name FROM users WHERE id = $1', [req.user.id]);
    const clientName = clientRes.rows[0]?.full_name || 'Macmiil';

    let houseTitle = '';
    if (house_id) {
      const houseRes = await query('SELECT title FROM houses WHERE id = $1', [house_id]);
      houseTitle = houseRes.rows[0]?.title || '';
    }

    const itemLabel = houseTitle ? `ee naqshadda "${houseTitle}"` : '';

    // 1. Notify the assigned Engineer (if selected by client)
    if (engineer_id) {
      await notifyUser({
        userId: Number(engineer_id),
        title: 'Codsi Dhismaha Cusub 👷',
        message: `Macmiilka ${clientName} ayaa kuu soo xushay dhismaha mashruuc cusub ${itemLabel} ee ${location || 'goobta dhismaha'}. Fadlan dib u eeg oo aqbal howsha.`,
        type: 'request',
        referenceId: newRequest.id,
        referenceType: 'request'
      });
    }

    // 2. Notify all Admins
    await notifyAdmins({
      title: 'Codsi Dhisme oo Cusub 📋',
      message: `Macmiilka ${clientName} ayaa soo gudbiyay codsi dhisme cusub ${itemLabel} ee ${location || 'Mogadishu'}.`,
      type: 'request',
      referenceId: newRequest.id,
      referenceType: 'request'
    });

    return success(res, newRequest, 'Construction request submitted successfully.', 201);
  } catch (err) {
    next(err);
  }
};

export const getMyRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const params = [req.user.id];
    let statusFilter = '';

    if (status) {
      params.push(status);
      statusFilter = ` AND cr.status = $${params.length}`;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM construction_requests cr WHERE cr.client_id = $1${statusFilter}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT cr.*, h.title as house_title, h.image_url as house_image,
              eng.full_name as engineer_name, eng.email as engineer_email, eng.phone as engineer_phone,
              p.id as project_id, p.status as project_status, p.progress_percentage
       FROM construction_requests cr
       LEFT JOIN houses h ON cr.house_id = h.id
       LEFT JOIN users eng ON cr.engineer_id = eng.id
       LEFT JOIN projects p ON cr.id = p.request_id
       WHERE cr.client_id = $1${statusFilter}
       ORDER BY cr.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return paginated(res, result.rows, page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const getAllRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    // Role-based visibility:
    // If engineer, show requests specifically assigned to them OR unassigned pending ones
    if (req.user.role === 'engineer') {
      params.push(req.user.id);
      conditions.push(`(cr.engineer_id = $${params.length} OR cr.engineer_id IS NULL)`);
    }

    if (status) {
      params.push(status);
      conditions.push(`cr.status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(c.full_name ILIKE $${params.length} OR cr.description ILIKE $${params.length} OR cr.location ILIKE $${params.length})`);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM construction_requests cr
       LEFT JOIN users c ON cr.client_id = c.id
       ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT cr.*, c.full_name as client_name, c.email as client_email, c.phone as client_phone,
              h.title as house_title, h.image_url as house_image,
              eng.full_name as engineer_name, eng.email as engineer_email, eng.phone as engineer_phone,
              p.id as project_id, p.status as project_status, p.progress_percentage
       FROM construction_requests cr
       LEFT JOIN users c ON cr.client_id = c.id
       LEFT JOIN houses h ON cr.house_id = h.id
       LEFT JOIN users eng ON cr.engineer_id = eng.id
       LEFT JOIN projects p ON cr.id = p.request_id
       ${whereClause}
       ORDER BY cr.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return paginated(res, result.rows, page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const getRequestById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT cr.*, c.full_name as client_name, c.email as client_email, c.phone as client_phone,
              h.title as house_title, h.image_url as house_image, h.price as house_price,
              eng.full_name as engineer_name, eng.email as engineer_email, eng.phone as engineer_phone,
              p.id as project_id, p.status as project_status, p.progress_percentage
       FROM construction_requests cr
       LEFT JOIN users c ON cr.client_id = c.id
       LEFT JOIN houses h ON cr.house_id = h.id
       LEFT JOIN users eng ON cr.engineer_id = eng.id
       LEFT JOIN projects p ON cr.id = p.request_id
       WHERE cr.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) return sendError(res, 'Request not found.', 404);

    const request = result.rows[0];
    if (req.user.role === 'client' && request.client_id !== req.user.id) {
      return sendError(res, 'Not authorized.', 403);
    }

    return success(res, request);
  } catch (err) {
    next(err);
  }
};

export const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, admin_notes, engineer_id } = req.body;
    const requestId = req.params.id;

    // Fetch existing request
    const existingReq = await query(
      `SELECT cr.*, c.full_name as client_name, h.title as house_title
       FROM construction_requests cr
       JOIN users c ON cr.client_id = c.id
       LEFT JOIN houses h ON cr.house_id = h.id
       WHERE cr.id = $1`,
      [requestId]
    );

    if (existingReq.rows.length === 0) return sendError(res, 'Request not found.', 404);
    const cr = existingReq.rows[0];

    // If an engineer is approving, ensure engineer is assigned to it or assign req.user.id
    let assignedEngId = cr.engineer_id;
    if (req.user.role === 'engineer') {
      if (!assignedEngId) {
        assignedEngId = req.user.id;
      } else if (assignedEngId !== req.user.id) {
        return sendError(res, 'You are not the designated engineer for this proposal.', 403);
      }
    } else if (engineer_id) {
      assignedEngId = Number(engineer_id);
    }

    const updated = await query(
      `UPDATE construction_requests
       SET status = $1,
           admin_notes = COALESCE($2, admin_notes),
           engineer_id = COALESCE($3, engineer_id),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, admin_notes, assignedEngId, requestId]
    );

    const updatedRequest = updated.rows[0];

    // Get Engineer name
    let engineerName = 'Injineerka Masuulka ah';
    if (assignedEngId) {
      const engRes = await query('SELECT full_name FROM users WHERE id = $1', [assignedEngId]);
      if (engRes.rows.length > 0) engineerName = engRes.rows[0].full_name;
    }

    // AUTOMATIC PROJECT CREATION & WORK COMMENCEMENT ON APPROVAL
    if (status === 'approved') {
      // Check if project already exists for this request
      const existingProject = await query('SELECT id FROM projects WHERE request_id = $1', [requestId]);

      let projectId;
      const projectTitle = cr.house_title || `Dhismaha Guriga - ${cr.location || 'Mogadishu'}`;

      if (existingProject.rows.length === 0) {
        // Fallback engineer if not set: default to first active engineer or req.user.id
        let effectiveEngId = assignedEngId;
        if (!effectiveEngId) {
          const fallbackEng = await query("SELECT id FROM users WHERE role = 'engineer' AND is_active = true LIMIT 1");
          effectiveEngId = fallbackEng.rows[0]?.id || req.user.id;
        }

        const newProject = await query(
          `INSERT INTO projects (
            request_id, engineer_id, client_id, title, description, location,
            budget, status, progress_percentage, start_date
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'in_progress', 0, CURRENT_DATE)
          RETURNING *`,
          [
            requestId,
            effectiveEngId,
            cr.client_id,
            projectTitle,
            cr.description || `Dhismaha guriga ee ${cr.location || 'Mogadishu'}`,
            cr.location || 'Mogadishu',
            cr.budget || 0
          ]
        );
        projectId = newProject.rows[0].id;
      } else {
        projectId = existingProject.rows[0].id;
        await query(
          "UPDATE projects SET status = 'in_progress', updated_at = NOW() WHERE id = $1",
          [projectId]
        );
      }

      // Notify the Client: Work has started!
      await notifyUser({
        userId: cr.client_id,
        title: 'Howsha Dhismaha Gurigaaga Waa La Bilaabay! 🚀',
        message: `Codsigaagii dhismaha ee "${projectTitle}" waa la aqbalay! Injineer ${engineerName} ayaa howsha si toos ah u bilaabay. Hadda toos ugala soco boggaaga mashaariicda.`,
        type: 'project',
        referenceId: projectId,
        referenceType: 'project'
      });

      // Notify the Engineer
      if (assignedEngId) {
        await notifyUser({
          userId: assignedEngId,
          title: 'Mashruuc Dhismaha Cusub oo Bilaabmay 🏗️',
          message: `Mashruuca "${projectTitle}" ee macmiilka ${cr.client_name} ayaa si toos ah u bilaabmay. Waxaad hadda bilaabi kartaa qorsheynta iyo howsha goobta.`,
          type: 'project',
          referenceId: projectId,
          referenceType: 'project'
        });
      }

      // Notify Admins
      await notifyAdmins({
        title: 'Mashruuc Cusub ayaa Bilaabmay 🚀',
        message: `Mashruuca "${projectTitle}" (Macmiilka: ${cr.client_name}, Injineerka: ${engineerName}) ayaa si toos ah loo bilaabay.`,
        type: 'project',
        referenceId: projectId,
        referenceType: 'project'
      });
    } else if (status === 'rejected') {
      await notifyUser({
        userId: cr.client_id,
        title: 'Codsiga Dhismaha ⚠️',
        message: `Codsigaagii dhismaha ee ku saabsanaa ${cr.location || 'mashruuca'} lama aqbalin xilligan. Faahfaahin: ${admin_notes || 'Fadlan la xiriir maamulka.'}`,
        type: 'request',
        referenceId: requestId,
        referenceType: 'request'
      });
    }

    return success(res, updatedRequest, 'Request status updated and project workflow synchronized.');
  } catch (err) {
    next(err);
  }
};

export const assignEngineer = async (req, res, next) => {
  try {
    const { engineer_id } = req.body;

    const eng = await query("SELECT id, full_name FROM users WHERE id = $1 AND role = 'engineer'", [engineer_id]);
    if (eng.rows.length === 0) return sendError(res, 'Engineer not found.', 404);

    const result = await query(
      `UPDATE construction_requests SET engineer_id = $1, status = 'reviewed', updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [engineer_id, req.params.id]
    );

    if (result.rows.length === 0) return sendError(res, 'Request not found.', 404);

    const updated = result.rows[0];

    // Notify the assigned engineer
    await notifyUser({
      userId: Number(engineer_id),
      title: 'Lagugu Xilsaaray Codsi Dhisme 👷',
      message: `Maamulka ayaa kugu xilsaaray dib u eegista iyo fulinta codsiga dhismaha #${updated.id}. Fadlan dib u eeg oo aqbal howsha.`,
      type: 'request',
      referenceId: updated.id,
      referenceType: 'request'
    });

    // Notify the client that their engineer has been designated
    await notifyUser({
      userId: updated.client_id,
      title: 'Injineer ayaa Laguu Xilsaaray 👷',
      message: `Codsigaaga dhismaha #${updated.id} waxaa loo xilsaaray Injineer ${eng.rows[0].full_name}. Wuxuu dib u eegayaa faahfaahinta dhismaha.`,
      type: 'request',
      referenceId: updated.id,
      referenceType: 'request'
    });

    return success(res, updated, 'Engineer assigned and parties notified.');
  } catch (err) {
    next(err);
  }
};
