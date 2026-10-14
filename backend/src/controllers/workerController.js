import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { success, error as sendError, paginated } from '../utils/apiResponse.js';

export const getWorkers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, engineer_id, skill, availability } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (engineer_id) { params.push(engineer_id); conditions.push(`wp.engineer_id = $${params.length}`); }
    if (skill) { params.push(`%${skill}%`); conditions.push(`wp.skill ILIKE $${params.length}`); }
    if (availability) { params.push(availability); conditions.push(`wp.availability_status = $${params.length}`); }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await query(`SELECT COUNT(*) FROM worker_profiles wp ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT wp.*, u.full_name, u.email, u.phone, u.avatar_url,
       eng.full_name as engineer_name
       FROM worker_profiles wp
       JOIN users u ON wp.user_id = u.id
       LEFT JOIN users eng ON wp.engineer_id = eng.id
       ${whereClause}
       ORDER BY wp.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return paginated(res, result.rows, page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const getWorkerById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT wp.*, u.full_name, u.email, u.phone, u.avatar_url
       FROM worker_profiles wp JOIN users u ON wp.user_id = u.id
       WHERE wp.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return sendError(res, 'Worker not found.', 404);
    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const registerWorker = async (req, res, next) => {
  try {
    const { full_name, email, phone, password, skill, experience_years, daily_rate } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return sendError(res, 'Email already exists.', 409);

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password || 'Worker@123', salt);

    const userResult = await query(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES ($1,$2,$3,$4,'worker') RETURNING id, full_name, email, phone, role`,
      [full_name, email, phone, password_hash]
    );

    const user = userResult.rows[0];

    const wpResult = await query(
      `INSERT INTO worker_profiles (user_id, engineer_id, skill, experience_years, daily_rate)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [user.id, req.user.id, skill, experience_years || 0, daily_rate || 0]
    );

    return success(res, { user, profile: wpResult.rows[0] }, 'Worker registered.', 201);
  } catch (err) {
    next(err);
  }
};

export const updateWorker = async (req, res, next) => {
  try {
    const { skill, experience_years, daily_rate } = req.body;

    const wp = await query('SELECT * FROM worker_profiles WHERE id = $1', [req.params.id]);
    if (wp.rows.length === 0) return sendError(res, 'Worker not found.', 404);
    if (wp.rows[0].engineer_id !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to update this worker.', 403);
    }

    const result = await query(
      `UPDATE worker_profiles SET
       skill = COALESCE($1, skill), experience_years = COALESCE($2, experience_years),
       daily_rate = COALESCE($3, daily_rate), updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [skill, experience_years, daily_rate, req.params.id]
    );

    return success(res, result.rows[0], 'Worker updated.');
  } catch (err) {
    next(err);
  }
};

export const updateAvailability = async (req, res, next) => {
  try {
    const { availability_status } = req.body;
    const result = await query(
      `UPDATE worker_profiles SET availability_status = $1, updated_at = NOW()
       WHERE user_id = $2 RETURNING *`,
      [availability_status, req.user.id]
    );
    if (result.rows.length === 0) return sendError(res, 'Worker profile not found.', 404);
    return success(res, result.rows[0], 'Availability updated.');
  } catch (err) {
    next(err);
  }
};

export const getMyWorkers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const countResult = await query(
      'SELECT COUNT(*) FROM worker_profiles WHERE engineer_id = $1', [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT wp.*, u.full_name, u.email, u.phone, u.avatar_url
       FROM worker_profiles wp JOIN users u ON wp.user_id = u.id
       WHERE wp.engineer_id = $1
       ORDER BY wp.created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    return paginated(res, result.rows, page, limit, total);
  } catch (err) {
    next(err);
  }
};
