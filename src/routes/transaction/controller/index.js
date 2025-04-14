import { pool } from "../../../config/database.js";

const changesMap = ["amount", "category", "isdeleted", "type"];

export const createTransaction = async (req, res) => {
  try {
    const { userId, accountId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (accountId) {
      const authorizationResult = await pool.query(
        "SELECT * FROM authorizetable WHERE userId = $1 AND accountId = $2",
        [userId, accountId]
      );
      if (authorizationResult.rows.length === 0) {
        return res.status(403).json({
          error:
            "Accountant is not authorized to create this transaction for the user",
        });
      }
    }

    const query = `INSERT INTO transaction (${Object.keys(req.body).join(
      ", "
    )}) VALUES (${Object.keys(req.body)
      .map((_, i) => `$${i + 1}`)
      .join(", ")}) RETURNING *;`;
    const result = await pool.query(query, Object.values(req.body));
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { userId, accountId, transactionId } = req.query; //try in body

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (accountId) {
      const authorizationResult = await pool.query(
        "SELECT * FROM authorizeTable WHERE userId = $1 AND accountId = $2",
        [userId, accountId]
      );
      if (authorizationResult.rows.length === 0) {
        return res
          .status(403)
          .json({
            error: "Accountant is not authorized to delete this transaction",
          });
      }
    }

    if (!transactionId) {
      return res.status(400).json({ error: "transactionId is required" });
    }

    const transactionResult = await pool.query(
      "SELECT * FROM transaction WHERE id = $1 AND userId = $2",
      [transactionId, userId]
    );
    if (transactionResult.rows.length === 0) {
      return res
        .status(404)
        .json({
          error: "Transaction not found or does not belong to the user",
        });
    }

    const query =
      "UPDATE transaction SET isDeleted = true WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [transactionId]);
    console.log(result);
    if (result.rowCount > 0) {
      return res
        .status(200)
        .json({ message: "Transaction deleted successfully" });
    } else {
      return res.status(404).json({ message: "Transaction not found" });
    }
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const restoreTransaction = async (req, res) => {
  try {
    const { userId, accountId } = req.query;
    const { transactionId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const userResult = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      userId,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!transactionId) {
      return res.status(400).json({ error: "transactionId is required" });
    }
    const transactionResult = await pool.query(
      `SELECT * FROM transaction WHERE id = $1 AND userId = $2`,
      [transactionId, userId]
    );
    if (transactionResult.rows.length === 0) {
      return res
        .status(404)
        .json({
          error: "Transaction not found or does not belong to the user",
        });
    }

    if (accountId) {
      const authorizationResult = await pool.query(
        `SELECT * FROM authorizetable WHERE userId = $1 AND accountId = $2`,
        [userId, accountId]
      );
      if (authorizationResult.rows.length === 0) {
        return res
          .status(403)
          .json({
            error: "Accountant is not authorized to restore this transaction",
          });
      }
    }

    const query = `UPDATE transaction SET isDeleted = false WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [transactionId]);
    if (result.rowCount > 0) {
      return res
        .status(200)
        .json({ message: "Transaction restored successfully" });
    } else {
      return res.status(404).json({ message: "Transaction not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteTransactionPermanently = async (req, res) => {
  try {
    const { userId, accountId } = req.query;
    const { transactionId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const userResult = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      userId,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (accountId) {
      const authorizationResult = await pool.query(
        `SELECT * FROM authorizetable WHERE userId = $1 AND accountId = $2`,
        [userId, accountId]
      );
      if (authorizationResult.rows.length === 0) {
        return res
          .status(403)
          .json({
            error: "Accountant is not authorized to delete this transaction",
          });
      }
    }

    if (!transactionId) {
      return res.status(400).json({ error: "transactionId is required" });
    }
    const transactionResult = await pool.query(
      `SELECT * FROM transaction WHERE id = $1 AND userId = $2 AND isDeleted = true`,
      [transactionId, userId]
    );
    if (transactionResult.rows.length === 0) {
      return res
        .status(404)
        .json({
          error: "Transaction not found or does not belong to the user",
        });
    }

    const query = `DELETE FROM transaction WHERE id = $1`;
    const result = await pool.query(query, [transactionId]);
    if (result.rowCount > 0) {
      return res
        .status(200)
        .json({ message: "Transaction deleted permanently" });
    } else {
      return res.status(404).json({ message: "Transaction not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getDeletedTransaction = async (req, res) => {
  try {
    const { userId, accountId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const userResult = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      userId,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (accountId) {
      const authorizationResult = await pool.query(
        `SELECT * FROM authorizetable WHERE userId = $1 AND accountId = $2`,
        [userId, accountId]
      );
      if (authorizationResult.rows.length === 0) {
        return res
          .status(403)
          .json({
            error: "Accountant is not authorized to get deleted transactions",
          });
      }
    }

    const query = `SELECT * FROM transaction WHERE isdeleted = true AND userId = $1`;
    const result = await pool.query(query, [userId]);
    if (result.rowCount > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ message: "No deleted transactions found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllTransactionOfUser = async (req, res) => {
  try {
    const { userId, accountId } = req.query;
    if (!userId && !accountId) {
      return res
        .status(400)
        .json({ error: "Either userId or accountId must be provided" });
    }
    if (userId) {
      const userResult = await pool.query(`SELECT * FROM users WHERE id = $1`, [
        userId,
      ]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      if (accountId) {
        const authorizationResult = await pool.query(
          `SELECT * FROM authorizetable WHERE userId = $1 AND accountid = $2`,
          [userId, accountId]
        );
        if (authorizationResult.rows.length === 0) {
          return res
            .status(403)
            .json({
              error: `Accountant is not authorized to access this account`,
            });
        }
        console.log(
          `Accountant with accountId ${accountId} is authorized for user ${userId}`
        );
      }
      const query =
        "SELECT * FROM transaction WHERE isDeleted = false AND userId = $1";
      const result = await pool.query(query, [userId]);
      return res.status(200).json(result.rows);
    } else {
      return res
        .status(400)
        .json({ error: "Either userId or accountId must be provided" });
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getTransactionByTransactionId = async (req, res) => {
  try {
    const transactionId = req.body.transactionId;
    const result = await pool.query("SELECT * FROM transaction where id = $1", [
      transactionId,
    ]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { userId, accountId } = req.query;
    const { transactionId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const transactionResult = await pool.query(
      "SELECT * FROM transaction WHERE id = $1",
      [transactionId]
    );
    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const transaction = transactionResult.rows[0];

    if (transaction.userid !== parseInt(userId)) {
      return res
        .status(403)
        .json({ error: "This transaction does not belong to the user" });
    }

    if (accountId) {
      const authorizationResult = await pool.query(
        "SELECT * FROM authorizeTable WHERE userId = $1 AND accountId = $2",
        [userId, accountId]
      );
      if (authorizationResult.rows.length === 0) {
        return res
          .status(403)
          .json({
            error: "Accountant is not authorized to update this transaction",
          });
      }
    }

    const result = await pool.query(
      "CALL update_transaction_with_log($1, $2, $3, $4, $5)",
      [
        req.body.transactionId,
        req.body.newAmount,
        req.body.newCategory,
        req.body.newType,
        req.body.updatedByUserId,
      ]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Transaction not found or unable to update" });
    }

    res.status(200).json({ message: "Transaction updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// export const createTransactionLog = async (req, res) => {
//     try {
//         const body = req.body;
//         const query = `INSERT INTO transactionLog (${Object.keys(body).join(', ')}) VALUES (${Object.keys(body).map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *;`;
//         const result = await pool.query(query, Object.values(body))
//         const transaction = result.rows[0];
//         if (!transaction) {
//             return res.status(404).json({ message: "Transaction not found" });
//         }
//         res.status(200).json(transaction);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }

export const getTransactionLogByTransactionId = async (req, res) => {
  try {
    const { userId, accountId, transactionId } = req.query;
    if (!userId && !accountId) {
      return res
        .status(400)
        .json({ error: "Either userId or accountId must be provided" });
    }
    if (userId) {
      const userResult = await pool.query(`SELECT * FROM users WHERE id = $1`, [
        userId,
      ]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      if (accountId) {
        const authorizationResult = await pool.query(
          `SELECT * FROM authorizetable WHERE userId = $1 AND accountid = $2`,
          [userId, accountId]
        );
        if (authorizationResult.rows.length === 0) {
          return res
            .status(403)
            .json({
              error: `Accountant is not authorized to access this account`,
            });
        }
        console.log(
          `Accountant with accountId ${accountId} is authorized for user ${userId}`
        );
      }
      const query = "SELECT * FROM transactionLog WHERE transactionid = $1";
      const result = await pool.query(query, [transactionId]);
      const newResult = result.rows.map((log) => {
        return {
          changes: Object.keys(log).reduce((acc, logDetail) => {
            if (log[logDetail] && changesMap.includes(logDetail)) {
              acc.push({
                field_changed: logDetail,
                new_value: log[logDetail],
              });
            }
            return acc;
          }, []),
          edited_by: log.updatedbyuserid,
          timestamp: log.created_at,
        };
      });
      console.log("newResult", JSON.stringify(newResult));
      return res.status(200).json(result.rows);
    } else {
      return res
        .status(400)
        .json({ error: "Either userId or accountId must be provided" });
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: error.message });
  }
};
