import { query } from '../config/database.js';
import { success, error as sendError } from '../utils/apiResponse.js';

export const getProjectDocuments = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    let whereExtra = '';

    // Workers and clients can only see public documents
    if (req.user.role === 'worker' || req.user.role === 'client') {
      whereExtra = ' AND (pd.is_public = true)';
    }

    const result = await query(
      `SELECT pd.*, u.full_name as uploaded_by_name
       FROM project_documents pd JOIN users u ON pd.uploaded_by = u.id
       WHERE pd.project_id = $1${whereExtra}
       ORDER BY pd.created_at DESC`,
      [projectId]
    );

    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

export const addDocument = async (req, res, next) => {
  try {
    const { title, document_type, file_url, description, is_public } = req.body;

    const result = await query(
      `INSERT INTO project_documents (project_id, uploaded_by, title, document_type, file_url, description, is_public)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.params.projectId, req.user.id, title, document_type, file_url, description, is_public || false]
    );

    return success(res, result.rows[0], 'Document added.', 201);
  } catch (err) {
    next(err);
  }
};

export const updateDocument = async (req, res, next) => {
  try {
    const { title, document_type, file_url, description, is_public } = req.body;

    const result = await query(
      `UPDATE project_documents SET
       title = COALESCE($1,title), document_type = COALESCE($2,document_type),
       file_url = COALESCE($3,file_url), description = COALESCE($4,description),
       is_public = COALESCE($5,is_public)
       WHERE id = $6 RETURNING *`,
      [title, document_type, file_url, description, is_public, req.params.id]
    );

    if (result.rows.length === 0) return sendError(res, 'Document not found.', 404);
    return success(res, result.rows[0], 'Document updated.');
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM project_documents WHERE id = $1 RETURNING id, title', [req.params.id]);
    if (result.rows.length === 0) return sendError(res, 'Document not found.', 404);
    return success(res, result.rows[0], 'Document deleted.');
  } catch (err) {
    next(err);
  }
};
