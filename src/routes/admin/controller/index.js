import { pool } from "../../../config/database.js";

export const accountIsLock = async (req, res) => {
    try {
        const { isLock, userId, id } = req.body;
        if(!id) {
            return res.status(400).json({ message: 'admin id is required.' });
        }
        const query = `SELECT id FROM users WHERE id = $1 AND role = 'admin'`;
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'admin not found with this id.' });
        }
        if (!userId) {
            return res.status(400).json({ message: 'userId an are required.' });
        }

        const checkQuery = 'SELECT * FROM users WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [userId]);

        if (checkResult.rowCount === 0) {
            return res.status(404).json({ message: 'User record not found.' });
        }

        const updateQuery = `
            UPDATE users
            SET islocked = $1
            WHERE id = $2
            RETURNING *;
        `;
        await pool.query(updateQuery, [isLock, userId]);

        return res.status(200).json({
            message: `User has been successfully ${isLock === 'locked' ? 'locked' : 'unlocked'}.`,
        });

    } catch (error) {
        console.error('Account Lock Error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};