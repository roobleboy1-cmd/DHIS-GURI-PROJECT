import { query } from '../config/database.js';
import { success, error as sendError, paginated } from '../utils/apiResponse.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;
    let whereClause = '';
    const params = [];
    const conditions = [];

    if (role) {
      params.push(role);
      conditions.push(`role = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(full_name ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const countResult = await query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT id, full_name, email, phone, role, avatar_url, is_active, created_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return paginated(res, result.rows, page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, full_name, email, phone, role, avatar_url, is_active, created_at, updated_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'User not found.', 404);
    }

    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { is_active } = req.body;

    const result = await query(
      `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, full_name, email, role, is_active`,
      [is_active, req.params.id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'User not found.', 404);
    }

    return success(res, result.rows[0], `User ${is_active ? 'activated' : 'deactivated'}.`);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const result = await query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id, full_name, email',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'User not found.', 404);
    }

    return success(res, result.rows[0], 'User deactivated.');
  } catch (err) {
    next(err);
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT role, COUNT(*)::int as count FROM users WHERE is_active = true GROUP BY role`
    );

    const total = await query('SELECT COUNT(*)::int as count FROM users');

    return success(res, { by_role: result.rows, total: total.rows[0].count });
  } catch (err) {
    next(err);
  }
};
