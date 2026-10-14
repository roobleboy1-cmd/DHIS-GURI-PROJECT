import { query } from '../config/database.js';
import { success } from '../utils/apiResponse.js';

export const getAdminDashboard = async (req, res, next) => {
  try {
    const users = await query(`SELECT role, COUNT(*)::int as count FROM users WHERE is_active = true GROUP BY role`);
    const totalUsers = await query('SELECT COUNT(*)::int as count FROM users');
    const houses = await query('SELECT COUNT(*)::int as count FROM houses');
    const projectsByStatus = await query(`SELECT status, COUNT(*)::int as count FROM projects GROUP BY status`);
    const totalProjects = await query('SELECT COUNT(*)::int as count FROM projects');
    const requestsByStatus = await query(`SELECT status, COUNT(*)::int as count FROM construction_requests GROUP BY status`);
    const totalRequests = await query('SELECT COUNT(*)::int as count FROM construction_requests');
    const paymentsSummary = await query(
      `SELECT status, COUNT(*)::int as count, COALESCE(SUM(amount),0)::numeric as total_amount FROM payments GROUP BY status`
    );
    const recentProjects = await query(
      `SELECT p.id, p.title, p.status, p.progress_percentage, p.created_at,
       c.full_name as client_name, eng.full_name as engineer_name
       FROM projects p
       LEFT JOIN users c ON p.client_id = c.id
       LEFT JOIN users eng ON p.engineer_id = eng.id
       ORDER BY p.created_at DESC LIMIT 5`
    );

    return success(res, {
      users: { total: totalUsers.rows[0].count, by_role: users.rows },
      houses: { total: houses.rows[0].count },
      projects: { total: totalProjects.rows[0].count, by_status: projectsByStatus.rows },
      requests: { total: totalRequests.rows[0].count, by_status: requestsByStatus.rows },
      payments: { by_status: paymentsSummary.rows },
      recent_projects: recentProjects.rows
    });
  } catch (err) {
    next(err);
  }
};

export const getEngineerDashboard = async (req, res, next) => {
  try {
    const projectsByStatus = await query(
      `SELECT status, COUNT(*)::int as count FROM projects WHERE engineer_id = $1 GROUP BY status`,
      [req.user.id]
    );
    const totalProjects = await query(
      'SELECT COUNT(*)::int as count FROM projects WHERE engineer_id = $1', [req.user.id]
    );
    const workers = await query(
      'SELECT COUNT(*)::int as count FROM worker_profiles WHERE engineer_id = $1', [req.user.id]
    );
    const pendingRequests = await query(
      `SELECT COUNT(*)::int as count FROM construction_requests WHERE engineer_id = $1 AND status = 'pending'`,
      [req.user.id]
    );
    const recentProgress = await query(
      `SELECT pp.*, p.title as project_title
       FROM project_progress pp JOIN projects p ON pp.project_id = p.id
       WHERE p.engineer_id = $1
       ORDER BY pp.created_at DESC LIMIT 5`,
      [req.user.id]
    );
    const recentProjects = await query(
      `SELECT id, title, status, progress_percentage, created_at
       FROM projects WHERE engineer_id = $1
       ORDER BY updated_at DESC LIMIT 5`,
      [req.user.id]
    );

    return success(res, {
      projects: { total: totalProjects.rows[0].count, by_status: projectsByStatus.rows },
      workers: { total: workers.rows[0].count },
      pending_requests: pendingRequests.rows[0].count,
      recent_progress: recentProgress.rows,
      recent_projects: recentProjects.rows
    });
  } catch (err) {
    next(err);
  }
};

export const getClientDashboard = async (req, res, next) => {
  try {
    const requestsByStatus = await query(
      `SELECT status, COUNT(*)::int as count FROM construction_requests WHERE client_id = $1 GROUP BY status`,
      [req.user.id]
    );
    const totalRequests = await query(
      'SELECT COUNT(*)::int as count FROM construction_requests WHERE client_id = $1', [req.user.id]
    );
    const projectsByStatus = await query(
      `SELECT status, COUNT(*)::int as count FROM projects WHERE client_id = $1 GROUP BY status`,
      [req.user.id]
    );
    const totalProjects = await query(
      'SELECT COUNT(*)::int as count FROM projects WHERE client_id = $1', [req.user.id]
    );
    const paymentsSummary = await query(
      `SELECT status, COUNT(*)::int as count, COALESCE(SUM(amount),0)::numeric as total_amount
       FROM payments WHERE client_id = $1 GROUP BY status`,
      [req.user.id]
    );
    const recentProjects = await query(
      `SELECT p.id, p.title, p.status, p.progress_percentage, p.updated_at,
       eng.full_name as engineer_name
       FROM projects p LEFT JOIN users eng ON p.engineer_id = eng.id
       WHERE p.client_id = $1
       ORDER BY p.updated_at DESC LIMIT 5`,
      [req.user.id]
    );

    return success(res, {
      requests: { total: totalRequests.rows[0].count, by_status: requestsByStatus.rows },
      projects: { total: totalProjects.rows[0].count, by_status: projectsByStatus.rows },
      payments: { by_status: paymentsSummary.rows },
      recent_projects: recentProjects.rows
    });
  } catch (err) {
    next(err);
  }
};

export const getWorkerDashboard = async (req, res, next) => {
  try {
    const assignments = await query(
      `SELECT COUNT(*)::int as count FROM project_workers WHERE worker_id = $1 AND status = 'active'`,
      [req.user.id]
    );
    const totalAssignments = await query(
      'SELECT COUNT(*)::int as count FROM project_workers WHERE worker_id = $1', [req.user.id]
    );
    const activeProjects = await query(
      `SELECT p.id, p.title, p.status, p.progress_percentage, pw.role as assignment_role
       FROM project_workers pw JOIN projects p ON pw.project_id = p.id
       WHERE pw.worker_id = $1 AND pw.status = 'active'
       ORDER BY pw.assigned_at DESC`,
      [req.user.id]
    );
    const recentProgress = await query(
      `SELECT pp.*, p.title as project_title
       FROM project_progress pp
       JOIN projects p ON pp.project_id = p.id
       JOIN project_workers pw ON pw.project_id = p.id
       WHERE pw.worker_id = $1
       ORDER BY pp.created_at DESC LIMIT 5`,
      [req.user.id]
    );
    const unreadNotifications = await query(
      'SELECT COUNT(*)::int as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );

    return success(res, {
      active_assignments: assignments.rows[0].count,
      total_assignments: totalAssignments.rows[0].count,
      active_projects: activeProjects.rows,
      recent_progress: recentProgress.rows,
      unread_notifications: unreadNotifications.rows[0].count
    });
  } catch (err) {
    next(err);
  }
};
