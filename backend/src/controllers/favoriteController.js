import { query } from '../config/database.js';
import { success, error as sendError } from '../utils/apiResponse.js';

export const getMyFavorites = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT f.id as favorite_id, f.created_at as favorited_at, h.*
       FROM favorites f JOIN houses h ON f.house_id = h.id
       WHERE f.user_id = $1 ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    const { house_id } = req.body;

    const house = await query('SELECT id FROM houses WHERE id = $1', [house_id]);
    if (house.rows.length === 0) return sendError(res, 'House not found.', 404);

    const existing = await query(
      'SELECT id FROM favorites WHERE user_id = $1 AND house_id = $2',
      [req.user.id, house_id]
    );
    if (existing.rows.length > 0) return sendError(res, 'Already in favorites.', 409);

    const result = await query(
      'INSERT INTO favorites (user_id, house_id) VALUES ($1,$2) RETURNING *',
      [req.user.id, house_id]
    );

    return success(res, result.rows[0], 'Added to favorites.', 201);
  } catch (err) {
    next(err);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM favorites WHERE user_id = $1 AND house_id = $2 RETURNING id',
      [req.user.id, req.params.houseId]
    );
    if (result.rows.length === 0) return sendError(res, 'Favorite not found.', 404);
    return success(res, null, 'Removed from favorites.');
  } catch (err) {
    next(err);
  }
};

export const checkFavorite = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id FROM favorites WHERE user_id = $1 AND house_id = $2',
      [req.user.id, req.params.houseId]
    );
    return success(res, { isFavorited: result.rows.length > 0 });
  } catch (err) {
    next(err);
  }
};
