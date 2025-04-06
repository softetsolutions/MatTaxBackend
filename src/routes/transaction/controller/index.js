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
}

export default new transactionController();