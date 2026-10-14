import { query } from '../config/database.js';
import { success, error as sendError, paginated } from '../utils/apiResponse.js';

export const getAllEngineers = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, specialization, search } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = ["u.role = 'engineer'", "u.is_active = true"];

    if (specialization) { params.push(specialization); conditions.push(`ep.specialization = $${params.length}`); }
    if (search) { params.push(`%${search}%`); conditions.push(`(u.full_name ILIKE $${params.length} OR ep.company_name ILIKE $${params.length})`); }

    const whereClause = 'WHERE ' + conditions.join(' AND ');

    const countResult = await query(
      `SELECT COUNT(*) FROM users u LEFT JOIN engineer_profiles ep ON u.id = ep.user_id ${whereClause}`, params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.avatar_url,
       ep.license_number, ep.specialization, ep.experience_years, ep.bio,
       ep.company_name, ep.rating, ep.total_reviews, ep.is_verified
       FROM users u
       LEFT JOIN engineer_profiles ep ON u.id = ep.user_id
       ${whereClause}
       ORDER BY ep.rating DESC NULLS LAST
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return paginated(res, result.rows, page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const getEngineerById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.avatar_url, u.created_at,
       ep.license_number, ep.specialization, ep.experience_years, ep.bio,
       ep.company_name, ep.rating, ep.total_reviews, ep.is_verified
       FROM users u
       LEFT JOIN engineer_profiles ep ON u.id = ep.user_id
       WHERE u.id = $1 AND u.role = 'engineer'`,
      [req.params.id]
    );

    if (result.rows.length === 0) return sendError(res, 'Engineer not found.', 404);

    const projects = await query(
      `SELECT COUNT(*)::int as total_projects FROM projects WHERE engineer_id = $1`,
      [req.params.id]
    );

    const reviews = await query(
      `SELECT r.*, u.full_name as reviewer_name
       FROM reviews r JOIN users u ON r.reviewer_id = u.id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC LIMIT 10`,
      [req.params.id]
    );

    const data = {
      ...result.rows[0],
      total_projects: projects.rows[0].total_projects,
      reviews: reviews.rows
    };

    return success(res, data);
  } catch (err) {
    next(err);
  }
};

export const updateEngineerProfile = async (req, res, next) => {
  try {
    const { license_number, specialization, experience_years, bio, company_name } = req.body;

    const result = await query(
      `UPDATE engineer_profiles SET
       license_number = COALESCE($1, license_number),
       specialization = COALESCE($2, specialization),
       experience_years = COALESCE($3, experience_years),
       bio = COALESCE($4, bio),
       company_name = COALESCE($5, company_name),
       updated_at = NOW()
       WHERE user_id = $6 RETURNING *`,
      [license_number, specialization, experience_years, bio, company_name, req.user.id]
    );

    if (result.rows.length === 0) return sendError(res, 'Engineer profile not found.', 404);
    return success(res, result.rows[0], 'Profile updated.');
  } catch (err) {
    next(err);
  }
};

export const verifyEngineer = async (req, res, next) => {
  try {
    const { is_verified } = req.body;
    const result = await query(
      'UPDATE engineer_profiles SET is_verified = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
      [is_verified, req.params.id]
    );
    if (result.rows.length === 0) return sendError(res, 'Engineer not found.', 404);
    return success(res, result.rows[0], `Engineer ${is_verified ? 'verified' : 'unverified'}.`);
  } catch (err) {
    next(err);
  }
};
