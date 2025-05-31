import { pool } from "../../../config/database.js";
import { approveMail } from "../../../middleware/sendMail.js";

export const insertAuthorizeRecord = async (req, res) => {
    try {
        const { status, accountId } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized access. Please log in again.' });
        }

        const userId = req.user.id;
        const userRes = await pool.query(
            'SELECT fname, lname, email, role FROM users WHERE id = $1',
            [userId]
        );
        const user = userRes.rows[0];
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        if (status && ['approved', 'rejected'].includes(status.toLowerCase())) {
            return res.status(400).json({ message: 'Status cannot be approved or rejected at creation.' });
        }

        const checkUserQuery = 'SELECT status FROM authorizeTable WHERE userId = $1 AND accountId = $2';
        const authResult = await pool.query(checkUserQuery, [userId, accountId]);
        if (authResult.rowCount === 0) {
            const userStatus = 'pending';
            const insertQuery = `
                INSERT INTO authorizeTable (userId, accountId, status)
                VALUES ($1, $2, $3)
                RETURNING *;
            `;
            const insertResult = await pool.query(insertQuery, [userId, accountId, userStatus]);

            const accountantResult = await pool.query(
                'SELECT email FROM users WHERE id = $1',
                [accountId]
            );
            const accountant = accountantResult.rows[0];

            if (accountant?.email) {
                const mailStatus = await approveMail(accountant.email, user);
                if (mailStatus?.error) {
                    console.error('Mail sending failed:', mailStatus.error);
                    return res.status(500).json({ error: 'Failed to send approval email.' });
                }
                console.log('Mail sent:', mailStatus);
            }

            return res.status(200).json({
                message: 'New record inserted successfully.',
                data: insertResult.rows[0],
            });
        }

        const currentStatus = authResult.rows[0].status?.toLowerCase();

        if (currentStatus === 'approved') {
            return res.status(200).json({ message: 'User already approved.' });
        }

        const updatedStatus = (!status || currentStatus === 'rejected') ? 'pending' : status.toLowerCase();

        const updateQuery = `
            UPDATE authorizeTable
            SET status = $1
            WHERE userId = $2 AND accountId = $3
            RETURNING *;
        `;
        const updateResult = await pool.query(updateQuery, [updatedStatus, userId, accountId]);

        const accountantResult = await pool.query(
            'SELECT email FROM users WHERE id = $1',
            [accountId]
        );
        const accountant = accountantResult.rows[0];

        if (accountant) {
            const mailStatus = await approveMail(accountant.email, user);
            console.log('Mail Status:', mailStatus);
        }

        return res.status(200).json({
            message: updateResult.rowCount > 0 ? 'Record updated successfully.' : 'No changes made.',
            data: updateResult.rows[0] || null,
        });

    } catch (error) {
        console.error('Insert Authorize Error:', error);
        return res.status(500).json({ error: error.message });
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
            SELECT a.userid,u.fname,u.lname,u.phone,u.email,u.city,a.created_at 
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

