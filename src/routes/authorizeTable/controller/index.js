import { pool } from "../../../config/database.js";

export const insertAuthorizeRecord = async (req, res) => {
    try {
        const { status = 'pending', ...restBody } = req.body;
        const keys = Object.keys(restBody);
        const values = Object.values(restBody);

        keys.push('status');
        values.push(status);

        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        const query = `
            INSERT INTO authorizeTable (${keys.join(', ')})
            VALUES (${placeholders})
            ON CONFLICT (userId, accountId) DO NOTHING
            RETURNING *;
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(200).json({ message: 'Record already exists, no new record created.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const DeAuthorizeRecord = async (req, res) => {
    try {
        const body = req.body;
        if (!body || Object.keys(body).length === 0) {
            return res.status(400).json({ error: 'No deletion criteria provided.' });
        }
        const keys = Object.keys(body);
        const values = Object.values(body);
        const conditions = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
        const query = `DELETE FROM authorizeTable WHERE ${conditions} RETURNING *;`;
        const { rows, rowCount } = await pool.query(query, values);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'No matching record found to delete.' });
        }
        res.status(200).json({ message: 'Authorization successfully removed.', id: rows[0].id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllInvitation = async (req, res) => {
    try {
        const accountId = req.params.id;
        if (!accountId) {
            return res.status(400).json({ error: 'Account ID is required.' });
        }

        const query = `
            SELECT id, userid,status,created_at FROM authorizeTable
            WHERE accountId = $1
            AND status = 'pending';
        `;
        
        const result = await pool.query(query, [accountId]);
        res.status(200).json(result.rows); // return all rows
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const updateStatus = async (req, res) => {
    try {
        const { userId, status, accountId } = req.body;

        // Validate inputs
        if (!accountId || !userId || !status) {
            return res.status(400).json({ error: 'Account ID, User ID, and status are required.' });
        }

        // Validate status value
        const allowedStatuses = ['approved', 'rejected'];
        if (!allowedStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({ error: 'Status must be either "approved" or "rejected".' });
        }

        // Update query
        const query = `
            UPDATE authorizeTable
            SET status = $1
            WHERE accountId = $2 AND userId = $3 AND status = 'pending'
            RETURNING id, userId, accountId, status, created_at;
        `;

        const result = await pool.query(query, [status.toLowerCase(), accountId, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'No pending authorization found for this user and account.' });
        }

        res.status(200).json({
            message: `Authorization status updated to "${status}".`,
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

