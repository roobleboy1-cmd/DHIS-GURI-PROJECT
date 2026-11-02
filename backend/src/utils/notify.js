import { query } from '../config/database.js';

/**
 * Send an in-app notification to a specific user
 */
export const notifyUser = async ({ userId, title, message, type = 'info', referenceId = null, referenceType = null }) => {
  if (!userId) return null;
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type, is_read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
       RETURNING *`,
      [userId, title, message, type, referenceId, referenceType]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Error sending notification to user', userId, err);
    return null;
  }
};

/**
 * Send an in-app notification to all administrators
 */
export const notifyAdmins = async ({ title, message, type = 'info', referenceId = null, referenceType = null }) => {
  try {
    const admins = await query("SELECT id FROM users WHERE role = 'admin' AND is_active = true");
    const notifications = [];
    for (const admin of admins.rows) {
      const n = await notifyUser({
        userId: admin.id,
        title,
        message,
        type,
        referenceId,
        referenceType,
      });
      if (n) notifications.push(n);
    }
    return notifications;
  } catch (err) {
    console.error('Error sending notification to admins', err);
    return [];
  }
};

/**
 * Send an in-app notification to all users of a specific role
 */
export const notifyRole = async ({ role, title, message, type = 'info', referenceId = null, referenceType = null }) => {
  try {
    const users = await query("SELECT id FROM users WHERE role = $1 AND is_active = true", [role]);
    const notifications = [];
    for (const u of users.rows) {
      const n = await notifyUser({
        userId: u.id,
        title,
        message,
        type,
        referenceId,
        referenceType,
      });
      if (n) notifications.push(n);
    }
    return notifications;
  } catch (err) {
    console.error(`Error sending notification to role ${role}`, err);
    return [];
  }
};
