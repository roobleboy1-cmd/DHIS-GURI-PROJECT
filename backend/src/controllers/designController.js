import { query } from '../config/database.js';
import { success, error as sendError, paginated } from '../utils/apiResponse.js';

export const getDesigns = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, house_id, design_type, search } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (house_id) { params.push(house_id); conditions.push(`d.house_id = $${params.length}`); }
    if (design_type) { params.push(design_type); conditions.push(`d.design_type = $${params.length}`); }
    if (search) { params.push(`%${search}%`); conditions.push(`(d.title ILIKE $${params.length} OR d.description ILIKE $${params.length})`); }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await query(`SELECT COUNT(*) FROM house_designs d ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT d.*, h.title as house_title
       FROM house_designs d
       LEFT JOIN houses h ON d.house_id = h.id
       ${whereClause}
       ORDER BY d.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return paginated(res, result.rows, page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const getDesignById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT d.*, h.title as house_title, h.location as house_location
       FROM house_designs d
       LEFT JOIN houses h ON d.house_id = h.id
       WHERE d.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return sendError(res, 'Design not found.', 404);
    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const createDesign = async (req, res, next) => {
  try {
    const { house_id, title, description, design_type, image_url, file_url, estimated_cost } = req.body;

    const result = await query(
      `INSERT INTO house_designs (house_id, title, description, design_type, image_url, file_url, estimated_cost, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [house_id, title, description, design_type, image_url, file_url, estimated_cost || 0, req.user.id]
    );

    return success(res, result.rows[0], 'Design created.', 201);
  } catch (err) {
    next(err);
  }
};

export const updateDesign = async (req, res, next) => {
  try {
    const { title, description, design_type, image_url, file_url, estimated_cost } = req.body;

    const result = await query(
      `UPDATE house_designs SET
       title = COALESCE($1,title), description = COALESCE($2,description),
       design_type = COALESCE($3,design_type), image_url = COALESCE($4,image_url),
       file_url = COALESCE($5,file_url), estimated_cost = COALESCE($6,estimated_cost),
       updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [title, description, design_type, image_url, file_url, estimated_cost, req.params.id]
    );

    if (result.rows.length === 0) return sendError(res, 'Design not found.', 404);
    return success(res, result.rows[0], 'Design updated.');
  } catch (err) {
    next(err);
  }
};

export const deleteDesign = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM house_designs WHERE id = $1 RETURNING id, title', [req.params.id]);
    if (result.rows.length === 0) return sendError(res, 'Design not found.', 404);
    return success(res, result.rows[0], 'Design deleted.');
  } catch (err) {
    next(err);
  }
};
