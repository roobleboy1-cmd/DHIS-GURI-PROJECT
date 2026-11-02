import { query } from '../config/database.js';
import { success, error as sendError, paginated } from '../utils/apiResponse.js';
import { notifyUser, notifyAdmins } from '../utils/notify.js';

export const getProjectPayments = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT py.*, c.full_name as client_name
       FROM payments py JOIN users c ON py.client_id = c.id
       WHERE py.project_id = $1
       ORDER BY py.created_at DESC`,
      [req.params.projectId]
    );
    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

export const getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`py.status = $${params.length}`);
    }
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await query(`SELECT COUNT(*) FROM payments py ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT py.*, c.full_name as client_name, c.email as client_email, p.title as project_title,
              eng.full_name as engineer_name
       FROM payments py
       JOIN users c ON py.client_id = c.id
       JOIN projects p ON py.project_id = p.id
       LEFT JOIN users eng ON p.engineer_id = eng.id
       ${whereClause}
       ORDER BY py.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return paginated(res, result.rows, page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const getMyPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const countResult = await query(
      'SELECT COUNT(*) FROM payments WHERE client_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT py.*, p.title as project_title, p.status as project_status, eng.full_name as engineer_name
       FROM payments py
       JOIN projects p ON py.project_id = p.id
       LEFT JOIN users eng ON p.engineer_id = eng.id
       WHERE py.client_id = $1
       ORDER BY py.created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    return paginated(res, result.rows, page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const createPayment = async (req, res, next) => {
  try {
    const { project_id, amount, payment_method, description, reference_number } = req.body;
    let clientId = req.body.client_id;

    // If client is paying, client_id is the authenticated user
    if (req.user.role === 'client') {
      clientId = req.user.id;
    }

    if (!project_id) return sendError(res, 'Project ID is required.', 400);
    if (!amount || Number(amount) <= 0) return sendError(res, 'Valid payment amount is required.', 400);

    // Verify project exists
    const projRes = await query(
      `SELECT p.*, c.full_name as client_name, eng.full_name as engineer_name
       FROM projects p
       JOIN users c ON p.client_id = c.id
       LEFT JOIN users eng ON p.engineer_id = eng.id
       WHERE p.id = $1`,
      [project_id]
    );

    if (projRes.rows.length === 0) return sendError(res, 'Project not found.', 404);
    const proj = projRes.rows[0];

    // Verify client permission if role is client
    if (req.user.role === 'client' && proj.client_id !== req.user.id) {
      return sendError(res, 'Not authorized to submit payment for this project.', 403);
    }

    const effectiveClientId = clientId || proj.client_id;
    const paymentStatus = req.user.role === 'admin' ? 'completed' : 'pending';
    const paidAt = paymentStatus === 'completed' ? new Date() : null;

    const result = await query(
      `INSERT INTO payments (project_id, client_id, amount, payment_method, description, reference_number, status, paid_at, gateway_configured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false) RETURNING *`,
      [
        project_id,
        effectiveClientId,
        amount,
        payment_method || 'EVC Plus / Mobile Money',
        description || `Lacag-bixinta mashruuca ${proj.title}`,
        reference_number || `TX-${Date.now().toString().slice(-6)}`,
        paymentStatus,
        paidAt
      ]
    );

    const payment = result.rows[0];

    // Notify Admins
    await notifyAdmins({
      title: 'Lacag-bixin Cusub oo la Xareeyay 💳',
      message: `Macmiilka ${proj.client_name} ayaa xareeyay lacag $${amount} mashruuca "${proj.title}" (Habka: ${payment.payment_method}, Tixraaca: ${payment.reference_number}).`,
      type: 'payment',
      referenceId: payment.id,
      referenceType: 'payment'
    });

    // Notify Engineer
    if (proj.engineer_id) {
      await notifyUser({
        userId: proj.engineer_id,
        title: 'Lacag-bixin Mashruuc 💳',
        message: `Macmiilka ${proj.client_name} ayaa xareeyay lacag-bixin $${amount} oo ku saabsan mashruucaaga "${proj.title}".`,
        type: 'payment',
        referenceId: payment.id,
        referenceType: 'payment'
      });
    }

    // Notify Client
    await notifyUser({
      userId: effectiveClientId,
      title: 'Xaqiijinta Xaraynta Lacag-bixinta 💳',
      message: `Lacag-bixintaadii $${amount} ee mashruuca "${proj.title}" si guul leh ayaa loo diiwaangeliyay (Tixraaca: ${payment.reference_number}). Waxaa dib u eegaya maamulka.`,
      type: 'payment',
      referenceId: payment.id,
      referenceType: 'payment'
    });

    return success(res, payment, 'Payment recorded successfully.', 201);
  } catch (err) {
    next(err);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let paidAt = null;
    if (status === 'completed') paidAt = new Date();

    const result = await query(
      `UPDATE payments SET status = $1, paid_at = COALESCE($2, paid_at)
       WHERE id = $3 RETURNING *`,
      [status, paidAt, req.params.id]
    );

    if (result.rows.length === 0) return sendError(res, 'Payment not found.', 404);
    const updated = result.rows[0];

    // Fetch project title and client
    const projRes = await query('SELECT title FROM projects WHERE id = $1', [updated.project_id]);
    const projectTitle = projRes.rows[0]?.title || 'Mashruuca';

    if (status === 'completed') {
      await notifyUser({
        userId: updated.client_id,
        title: 'Lacag-bixintaada Waa La Ansixiyay ✅',
        message: `Lacag-bixintii $${updated.amount} ee mashruuca "${projectTitle}" waa la xaqiijiyay oo la ansixiyay. Waad ku mahadsan tahay wadashaqeynta.`,
        type: 'payment',
        referenceId: updated.id,
        referenceType: 'payment'
      });
    }

    return success(res, updated, 'Payment status updated.');
  } catch (err) {
    next(err);
  }
};
