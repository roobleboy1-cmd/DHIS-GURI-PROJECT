import { query } from '../config/database.js';
import { success, error as sendError, paginated } from '../utils/apiResponse.js';

export const createRequest = async (req, res, next) => {
  try {
    const { house_id, engineer_id, description, budget, location } = req.body;

    const result = await query(
      `INSERT INTO construction_requests (client_id, house_id, engineer_id, description, budget, location)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, house_id || null, engineer_id || null, description, budget || null, location]
    );

    return success(res, result.rows[0], 'Construction request submitted.', 201);
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
      `SELECT COUNT(*) FROM construction_requests cr WHERE cr.client_id = $1${statusFilter}`, params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT cr.*, h.title as house_title, eng.full_name as engineer_name
       FROM construction_requests cr
       LEFT JOIN houses h ON cr.house_id = h.id
       LEFT JOIN users eng ON cr.engineer_id = eng.id
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

    if (status) { params.push(status); conditions.push(`cr.status = $${params.length}`); }
    if (search) { params.push(`%${search}%`); conditions.push(`(c.full_name ILIKE $${params.length} OR cr.description ILIKE $${params.length})`); }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM construction_requests cr LEFT JOIN users c ON cr.client_id = c.id ${whereClause}`, params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT cr.*, c.full_name as client_name, c.email as client_email,
       h.title as house_title, eng.full_name as engineer_name
       FROM construction_requests cr
       LEFT JOIN users c ON cr.client_id = c.id
       LEFT JOIN houses h ON cr.house_id = h.id
       LEFT JOIN users eng ON cr.engineer_id = eng.id
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
       h.title as house_title, eng.full_name as engineer_name
       FROM construction_requests cr
       LEFT JOIN users c ON cr.client_id = c.id
       LEFT JOIN houses h ON cr.house_id = h.id
       LEFT JOIN users eng ON cr.engineer_id = eng.id
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
    const { status, admin_notes } = req.body;

    const result = await query(
      `UPDATE construction_requests SET status = $1, admin_notes = COALESCE($2, admin_notes), updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, admin_notes, req.params.id]
    );

    if (result.rows.length === 0) return sendError(res, 'Request not found.', 404);
    return success(res, result.rows[0], 'Request status updated.');
  } catch (err) {
    next(err);
  }
};

export const assignEngineer = async (req, res, next) => {
  try {
    const { engineer_id } = req.body;

    const eng = await query("SELECT id FROM users WHERE id = $1 AND role = 'engineer'", [engineer_id]);
    if (eng.rows.length === 0) return sendError(res, 'Engineer not found.', 404);

    const result = await query(
      `UPDATE construction_requests SET engineer_id = $1, status = 'reviewed', updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [engineer_id, req.params.id]
    );

    if (result.rows.length === 0) return sendError(res, 'Request not found.', 404);
    return success(res, result.rows[0], 'Engineer assigned.');
  } catch (err) {
    next(err);
  }
};
