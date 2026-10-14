import { query } from '../config/database.js';
import { success, error as sendError } from '../utils/apiResponse.js';

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

    if (progress_percentage !== undefined) {
      await query(
        'UPDATE projects SET progress_percentage = $1, updated_at = NOW() WHERE id = $2',
        [progress_percentage, projectId]
      );
    }

    return success(res, result.rows[0], 'Progress added.', 201);
  } catch (err) {
    next(err);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const { title, description, progress_percentage, image_url } = req.body;

    const existing = await query('SELECT * FROM project_progress WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return sendError(res, 'Progress entry not found.', 404);
    if (existing.rows[0].updated_by !== req.user.id) return sendError(res, 'Not authorized.', 403);

    const result = await query(
      `UPDATE project_progress SET
       title = COALESCE($1,title), description = COALESCE($2,description),
       progress_percentage = COALESCE($3,progress_percentage), image_url = COALESCE($4,image_url)
       WHERE id = $5 RETURNING *`,
      [title, description, progress_percentage, image_url, req.params.id]
    );

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
