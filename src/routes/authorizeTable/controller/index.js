import { pool } from "../../../config/database.js";
import { sendMail } from "../../../middleware/sendMail.js";

export const insertAuthorizeRecord = async (req, res) => {
    try {
        let { status, ...restBody } = req.body;
        const keys = Object.keys(restBody);
        const values = Object.values(restBody);

        if (status && ['approved', 'rejected'].includes(status.toLowerCase())) {
            return res.status(400).json({ message: 'Status cannot be approved or rejected.' });
        }

        let userStatus;

        const checkUser = 'SELECT status FROM users WHERE id = $1';
        let userResult = await pool.query(checkUser, [restBody.userId]);

        if (userResult.rowCount === 0) {
            const createUserQuery = 'INSERT INTO users (id, status) VALUES ($1, $2) RETURNING status';
            const newUser = await pool.query(createUserQuery, [restBody.userId, 'pending']);
            userStatus = newUser.rows[0].status;
        } else {
            userStatus = userResult.rows[0].status;
        }

        if (userStatus?.toLowerCase() === 'approved') {
            return res.status(200).json({ message: 'User already approved' });
        }

        if (!status || userStatus?.toLowerCase() === 'rejected') {
            status = 'pending';
        }

        keys.push('status');
        values.push(status);

        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const updates = keys.map(key => `${key} = EXCLUDED.${key}`).join(', ');

        const query = `
            INSERT INTO authorizeTable (${keys.join(', ')})
            VALUES (${placeholders})
            ON CONFLICT (userId, accountId) DO UPDATE SET ${updates}
            RETURNING *;
        `;

        const result = await pool.query(query, values);
        const accountantResult = await pool.query("SELECT email FROM user WHERE userid = $1", [restBody.accountId]);
        const accountantEmail = accountantResult.rows[0]?.email || null;
        const mailStatus = sendMail(accountantEmail);
        console.log("Mail Status:", mailStatus);
        res.status(200).json({
            message: result.rows.length
                ? 'Record inserted or updated successfully.'
                : 'No changes made.',
            data: result.rows[0] || null
        });

    } catch (error) {
        console.error('Insert Authorize Error:', error);
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
export const getAllAuthorizeUser = async (req, res) => {
    try {
        const accountId = req.params.id;
        if (!accountId) {
            return res.status(400).json({ error: 'Account ID is required.' });
        }

        const query = `
            SELECT a.userid,u.fname,u.lname,u.phone,u.email,u.address,a.created_at 
            FROM authorizeTable a LEFT JOIN users u ON a.userid = u.id
            WHERE accountId = $1
            AND status = 'approved';
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

