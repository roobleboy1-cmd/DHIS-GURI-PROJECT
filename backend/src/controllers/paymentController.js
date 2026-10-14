import { query } from '../config/database.js';
import { success, error as sendError, paginated } from '../utils/apiResponse.js';

export const getProjectPayments = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT py.*, c.full_name as client_name
       FROM payments py JOIN users c ON py.client_id = c.id
       WHERE py.project_id = $1
       ORDER BY py.created_at DESC`,
      [req.params.projectId]
    );
    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

export const getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (status) { params.push(status); conditions.push(`py.status = $${params.length}`); }
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await query(`SELECT COUNT(*) FROM payments py ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT py.*, c.full_name as client_name, p.title as project_title
       FROM payments py
       JOIN users c ON py.client_id = c.id
       JOIN projects p ON py.project_id = p.id
       ${whereClause}
       ORDER BY py.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return paginated(res, result.rows, page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const getMyPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const countResult = await query(
      'SELECT COUNT(*) FROM payments WHERE client_id = $1', [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT py.*, p.title as project_title
       FROM payments py JOIN projects p ON py.project_id = p.id
       WHERE py.client_id = $1
       ORDER BY py.created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    return paginated(res, result.rows, page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const createPayment = async (req, res, next) => {
  try {
    const { project_id, client_id, amount, payment_method, description, reference_number } = req.body;

    const result = await query(
      `INSERT INTO payments (project_id, client_id, amount, payment_method, description, reference_number, gateway_configured)
       VALUES ($1,$2,$3,$4,$5,$6,false) RETURNING *`,
      [project_id, client_id, amount, payment_method || 'manual', description, reference_number]
    );

    return success(res, result.rows[0], 'Payment recorded. Note: Payment gateway is not configured — this is a manual record.', 201);
  } catch (err) {
    next(err);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let paidAt = null;
    if (status === 'completed') paidAt = new Date();

    const result = await query(
      `UPDATE payments SET status = $1, paid_at = COALESCE($2, paid_at), updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, paidAt, req.params.id]
    );

    if (result.rows.length === 0) return sendError(res, 'Payment not found.', 404);
    return success(res, result.rows[0], 'Payment status updated.');
  } catch (err) {
    next(err);
  }
};
