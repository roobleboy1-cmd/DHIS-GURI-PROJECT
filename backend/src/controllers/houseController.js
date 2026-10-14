import { query } from '../config/database.js';
import { success, error as sendError, paginated } from '../utils/apiResponse.js';

export const getAllHouses = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, bedrooms, location, min_price, max_price, status, search, featured } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (bedrooms) { params.push(bedrooms); conditions.push(`bedrooms = $${params.length}`); }
    if (location) { params.push(`%${location}%`); conditions.push(`location ILIKE $${params.length}`); }
    if (min_price) { params.push(min_price); conditions.push(`price >= $${params.length}`); }
    if (max_price) { params.push(max_price); conditions.push(`price <= $${params.length}`); }
    if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
    if (featured === 'true') { conditions.push(`featured = true`); }
    if (search) { params.push(`%${search}%`); conditions.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length})`); }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await query(`SELECT COUNT(*) FROM houses ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT h.*, u.full_name as created_by_name
       FROM houses h
       LEFT JOIN users u ON h.created_by = u.id
       ${whereClause}
       ORDER BY h.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return paginated(res, result.rows, page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const getHouseById = async (req, res, next) => {
  try {
    const house = await query(
      `SELECT h.*, u.full_name as created_by_name
       FROM houses h LEFT JOIN users u ON h.created_by = u.id
       WHERE h.id = $1`,
      [req.params.id]
    );

    if (house.rows.length === 0) {
      return sendError(res, 'House not found.', 404);
    }

    const designs = await query(
      'SELECT * FROM house_designs WHERE house_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );

    const data = { ...house.rows[0], designs: designs.rows };
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

export const createHouse = async (req, res, next) => {
  try {
    const { title, description, location, bedrooms, bathrooms, area_sqm, price, image_url, status, featured } = req.body;

    const result = await query(
      `INSERT INTO houses (title, description, location, bedrooms, bathrooms, area_sqm, price, image_url, status, featured, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [title, description, location, bedrooms || 0, bathrooms || 0, area_sqm || 0, price || 0, image_url, status || 'available', featured || false, req.user.id]
    );

    return success(res, result.rows[0], 'House created.', 201);
  } catch (err) {
    next(err);
  }
};

export const updateHouse = async (req, res, next) => {
  try {
    const { title, description, location, bedrooms, bathrooms, area_sqm, price, image_url, status, featured } = req.body;

    const result = await query(
      `UPDATE houses SET
       title = COALESCE($1, title), description = COALESCE($2, description),
       location = COALESCE($3, location), bedrooms = COALESCE($4, bedrooms),
       bathrooms = COALESCE($5, bathrooms), area_sqm = COALESCE($6, area_sqm),
       price = COALESCE($7, price), image_url = COALESCE($8, image_url),
       status = COALESCE($9, status), featured = COALESCE($10, featured),
       updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [title, description, location, bedrooms, bathrooms, area_sqm, price, image_url, status, featured, req.params.id]
    );

    if (result.rows.length === 0) return sendError(res, 'House not found.', 404);
    return success(res, result.rows[0], 'House updated.');
  } catch (err) {
    next(err);
  }
};

export const deleteHouse = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM houses WHERE id = $1 RETURNING id, title', [req.params.id]);
    if (result.rows.length === 0) return sendError(res, 'House not found.', 404);
    return success(res, result.rows[0], 'House deleted.');
  } catch (err) {
    next(err);
  }
};

export const getFeaturedHouses = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM houses WHERE featured = true AND status = 'available' ORDER BY created_at DESC LIMIT 6`
    );
    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
};
