import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { env } from '../config/env.js';
import { success, error as sendError } from '../utils/apiResponse.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

export const register = async (req, res, next) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    const allowedRoles = ['client', 'engineer'];
    const userRole = allowedRoles.includes(role) ? role : 'client';

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return sendError(res, 'A user with this email already exists.', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await query(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, phone, role, is_active, created_at`,
      [full_name, email, phone || null, password_hash, userRole]
    );

    const user = result.rows[0];

    if (userRole === 'engineer') {
      await query(
        'INSERT INTO engineer_profiles (user_id) VALUES ($1)',
        [user.id]
      );
    }

    const token = generateToken(user);

    return success(res, { user, token }, 'Registration successful.', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT id, full_name, email, phone, password_hash, role, avatar_url, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return sendError(res, 'Your account has been deactivated. Contact the administrator.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const token = generateToken(user);

    const { password_hash, ...userWithoutPassword } = user;

    return success(res, { user: userWithoutPassword, token }, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, full_name, email, phone, role, avatar_url, is_active, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'User not found.', 404);
    }

    let profileData = result.rows[0];

    if (profileData.role === 'engineer') {
      const ep = await query('SELECT * FROM engineer_profiles WHERE user_id = $1', [req.user.id]);
      if (ep.rows.length > 0) {
        profileData.engineer_profile = ep.rows[0];
      }
    }

    if (profileData.role === 'worker') {
      const wp = await query('SELECT * FROM worker_profiles WHERE user_id = $1', [req.user.id]);
      if (wp.rows.length > 0) {
        profileData.worker_profile = wp.rows[0];
      }
    }

    return success(res, profileData, 'Profile retrieved.');
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, avatar_url } = req.body;

    const result = await query(
      `UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone),
       avatar_url = COALESCE($3, avatar_url), updated_at = NOW()
       WHERE id = $4
       RETURNING id, full_name, email, phone, role, avatar_url, updated_at`,
      [full_name, phone, avatar_url, req.user.id]
    );

    return success(res, result.rows[0], 'Profile updated.');
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);

    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [password_hash, req.user.id]);

    return success(res, null, 'Password changed successfully.');
  } catch (err) {
    next(err);
  }
};
