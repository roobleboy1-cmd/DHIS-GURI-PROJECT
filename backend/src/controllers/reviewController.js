import { query } from '../config/database.js';
import { success, error as sendError, paginated } from '../utils/apiResponse.js';

export const getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, project_id, reviewee_id } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (project_id) { params.push(project_id); conditions.push(`r.project_id = $${params.length}`); }
    if (reviewee_id) { params.push(reviewee_id); conditions.push(`r.reviewee_id = $${params.length}`); }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await query(`SELECT COUNT(*) FROM reviews r ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT r.*, reviewer.full_name as reviewer_name, reviewee.full_name as reviewee_name,
       p.title as project_title
       FROM reviews r
       JOIN users reviewer ON r.reviewer_id = reviewer.id
       JOIN users reviewee ON r.reviewee_id = reviewee.id
       JOIN projects p ON r.project_id = p.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return paginated(res, result.rows, page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { project_id, reviewee_id, rating, comment } = req.body;

    // Check project is completed
    const project = await query('SELECT status FROM projects WHERE id = $1', [project_id]);
    if (project.rows.length === 0) return sendError(res, 'Project not found.', 404);
    if (project.rows[0].status !== 'completed') {
      return sendError(res, 'Can only review completed projects.', 400);
    }

    const existing = await query(
      'SELECT id FROM reviews WHERE project_id = $1 AND reviewer_id = $2',
      [project_id, req.user.id]
    );
    if (existing.rows.length > 0) return sendError(res, 'You already reviewed this project.', 409);

    const result = await query(
      `INSERT INTO reviews (project_id, reviewer_id, reviewee_id, rating, comment)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [project_id, req.user.id, reviewee_id, rating, comment]
    );

    // Update engineer's average rating
    const avgResult = await query(
      `SELECT AVG(rating)::numeric(3,2) as avg_rating, COUNT(*)::int as total
       FROM reviews WHERE reviewee_id = $1`,
      [reviewee_id]
    );
    await query(
      'UPDATE engineer_profiles SET rating = $1, total_reviews = $2, updated_at = NOW() WHERE user_id = $3',
      [avgResult.rows[0].avg_rating, avgResult.rows[0].total, reviewee_id]
    );

    return success(res, result.rows[0], 'Review submitted.', 201);
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const existing = await query('SELECT * FROM reviews WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return sendError(res, 'Review not found.', 404);
    if (existing.rows[0].reviewer_id !== req.user.id) return sendError(res, 'Not authorized.', 403);

    const result = await query(
      `UPDATE reviews SET rating = COALESCE($1,rating), comment = COALESCE($2,comment), updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [rating, comment, req.params.id]
    );

    return success(res, result.rows[0], 'Review updated.');
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const existing = await query('SELECT * FROM reviews WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return sendError(res, 'Review not found.', 404);
    if (existing.rows[0].reviewer_id !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized.', 403);
    }

    await query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    return success(res, null, 'Review deleted.');
  } catch (err) {
    next(err);
  }
};

export const getEngineerReviews = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT r.*, reviewer.full_name as reviewer_name, p.title as project_title
       FROM reviews r
       JOIN users reviewer ON r.reviewer_id = reviewer.id
       JOIN projects p ON r.project_id = p.id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.engineerId]
    );
    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
};
