import { pool } from "../../../config/database.js";
import { sendMail } from "../../../middleware/sendMail.js";

export const insertAuthorizeRecord = async (req, res) => {
    try {
        let { status, ...restBody } = req.body;
        const keys = Object.keys(restBody);
        const values = Object.values(restBody);

        if (status && ['approved', 'rejected'].includes(status.toLowerCase())) {
            return res.status(400).json({ message: 'Status cannot be approved or rejected at creation.' });
        }

        let userStatus;

        // Check if authorization record exists for user
        const checkUserQuery = 'SELECT status FROM authorizeTable WHERE userId = $1 AND accountId = $2';
        const userResult = await pool.query(checkUserQuery, [restBody.userId, restBody.accountId]);

        // Insert new record if not found
        if (userResult.rowCount === 0) {
            userStatus = 'pending';
            const insertInitialQuery = `
                INSERT INTO authorizeTable (userId, accountId, status)
                VALUES ($1, $2, $3)
                RETURNING *;
            `;
            const newUser = await pool.query(insertInitialQuery, [restBody.userId, restBody.accountId, userStatus]);

            const accountantResult = await pool.query("SELECT email FROM users WHERE id = $1", [restBody.accountId]);
            const accountantEmail = accountantResult.rows[0]?.email;

            if (accountantEmail) {
                const mailStatus = sendMail(accountantEmail);
                console.log("Mail Status:", mailStatus);
            }

            return res.status(200).json({
                message: 'New record inserted successfully.',
                data: newUser.rows[0],
            });
        }

        // Existing record found
        userStatus = userResult.rows[0].status;

        if (userStatus?.toLowerCase() === 'approved') {
            return res.status(200).json({ message: 'User already approved' });
        }

        // Set default status
        if (!status || userStatus?.toLowerCase() === 'rejected') {
            status = 'pending';
        }

        // Prepare values and placeholders for UPSERT
        keys.push('status');
        values.push(status);

        const upsertQuery = `
            update authorizetable SET status = $1 WHERE userid = $2 AND accountid = $3
        `;
        const result = await pool.query(upsertQuery, [status, restBody.userId, restBody.accountId ]);
        console.log("Result:", result);
        const accountantResult = await pool.query("SELECT email FROM users WHERE id = $1", [restBody.accountId]);
        const accountantEmail = accountantResult.rows[0]?.email;

        if (accountantEmail) {
            const mailStatus = sendMail(accountantEmail);
            console.log("Mail Status:", mailStatus);
        }

        res.status(200).json({
            message: result.rowCount > 0
                ? 'Record udpated .'
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

