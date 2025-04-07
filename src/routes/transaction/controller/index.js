import {pool} from "../../../config/database.js";

class transactionController {
    async createTransaction(req, res) {
        try {
            const query = `INSERT INTO transaction (${Object.keys(req.body).join(', ')}) VALUES (${Object.keys(req.body).map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *;`;
            const result = await pool.query(query, Object.values(req.body));
            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAllTransactionOfUser(req, res) {
        try {
            const userId = req.params.id;
            const result = await pool.query("SELECT * FROM transaction where userId = $1", [userId]);
            res.status(200).json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getTransactionByTransactionId(req, res) {
        try {
            const transactionId = req.body.transactionId;
            const result = await pool.query("SELECT * FROM transaction where id = $1", [transactionId]);
            res.status(200).json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateTransaction(req, res) {
        try {
            const result = await pool.query("CALL update_transaction_with_log($1, $2, $3, $4, $5)", [
                req.body.transactionId,
                req.body.newAmount,
                req.body.newCategory,
                req.body.newType,
                req.body.updatedByUserId
            ]);
            res.status(200).json({ message: "Transaction updated successfully" });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async createTransactionLog(req,res) {
        try {
            const body = req.body;
            const query = `INSERT INTO transactionLog (${Object.keys(body).join(', ')}) VALUES (${Object.keys(body).map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *;`;
            const result = await pool.query(query, Object.values(body))
            const transaction =  result.rows[0];
            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found" });
            }
            res.status(201).json(transaction);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteTransaction(req, res) {
        const { id } = req.params;
        const query = `UPDATE transaction SET isdeleted = true WHERE id  = $1 RETURNING *`;
        try{
            const result = await pool.query(query, [id]);
            if(result.rowCount > 0){
                res.status(200).json({ message: "Transaction deleted successfully" });
            }else{
                res.status(404).json({ message: "Transaction not found" });
            }
        }catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getDeletedTransaction(req, res) {
        const query = `SELECT * FROM transaction WHERE isdeleted = true`;
        try{
            const result = await pool.query(query);
            if(result.rowCount > 0){
                res.status(200).json(result.rows);
            }else{
                res.status(404).json({ message: "No deleted transactions found" });
            }
        }catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getAllTransactions(req, res) {
        try {
            const { userId, accountantId } = req.query;
            if (userId) {
                const userResult = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);
                if (userResult.rows.length === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }
                if (accountantId) {
                    const authorizationResult = await pool.query(`
                        SELECT * FROM accountant_user_permissions 
                        WHERE accountantId = $1 AND userId = $2
                    `, [accountantId, userId]);
    
                    if (authorizationResult.rows.length === 0) {
                        return res.status(403).json({ error: 'Accountant is not authorized for this user' });
                    }
                }
                const query = `
                    SELECT * FROM transaction
                    WHERE isDeleted = false AND userId = $1
                `;
                const result = await pool.query(query, [userId]);
                return res.status(200).json(result.rows);
            } else {
                const query = `SELECT * FROM transaction WHERE isDeleted = false`;
                const result = await pool.query(query);
                return res.status(200).json(result.rows);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return res.status(500).json({ error: error.message });
        }
    }
}

export default new transactionController();