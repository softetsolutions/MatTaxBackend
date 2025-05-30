import { pool } from "../../../config/database.js";
import { parse } from "csv-parse";
import fs from "fs";

const changesMap = ["amount", "category", "isdeleted", "type"];
export const createTransaction = async (req, res) => {
  try {
    const { userId, accountId } = req.query;
    let { vendorId } = req.body;

    const allowedFields = [
      "amount",
      "type",
      "vendorId",
      "date",
      "description",
      "category",
      "desc1",
      "desc2",
      "desc3",
      "isDeleted",
      "userId",
      "accountNo",
      "vat_gst_amount",
      "vat_gst_percentage",
    ];

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (vendorId === "") {
      return res
        .status(400)
        .json({ error: "vendorId or vendor name is required" });
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

    // Handle vendor: create if name is given
    if (vendorId && isNaN(Number(vendorId))) {
      const isVendor = await pool.query(
        "SELECT * FROM vendors WHERE name = $1 AND user_id = $2",
        [vendorId, userId]
      );
      if (isVendor.rows.length > 0) {
        vendorId = isVendor.rows[0].id;
      } else {
        const insertVendorQuery = `
          INSERT INTO vendors (user_id, name)
          VALUES ($1, $2)
          RETURNING *;
        `;
        const vendorResult = await pool.query(insertVendorQuery, [
          userId,
          vendorId,
        ]);
        vendorId = vendorResult.rows[0].id;
      }
    }

    // Apply vendorId to body and recalculate keys/values
    req.body.vendorId = vendorId;
    req.body.userId = userId;

    const keys = Object.keys(req.body).filter((key) =>
      allowedFields.includes(key)
    );
    const values = keys.map((key) => req.body[key]);

    const query = `INSERT INTO transaction (${keys.join(", ")})
      VALUES (${keys.map((_, i) => `$${i + 1}`).join(", ")})
      RETURNING *`;

    const result = await pool.query(query, values);

    // Optional: save receipt
    if (req.file) {
      const { path: filepath, filename } = req.file;
      const receiptQuery = `INSERT INTO receipt (filepath, filename, transactionId) VALUES ($1, $2, $3)`;
      await pool.query(receiptQuery, [filepath, filename, result.rows[0].id]);
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Transaction creation error:", error);
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
        return res.status(403).json({
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
      return res.status(404).json({
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
      return res.status(404).json({
        error: "Transaction not found or does not belong to the user",
      });
    }

    if (accountId) {
      const authorizationResult = await pool.query(
        `SELECT * FROM authorizetable WHERE userId = $1 AND accountId = $2`,
        [userId, accountId]
      );
      if (authorizationResult.rows.length === 0) {
        return res.status(403).json({
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
        return res.status(403).json({
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
      return res.status(404).json({
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
    const { userId, accountId, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

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
        return res.status(403).json({
          error: "Accountant is not authorized to get deleted transactions",
        });
      }
    }

    const dataQuery = `
      SELECT * FROM transaction 
      WHERE isdeleted = true AND userId = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const countQuery = `
      SELECT COUNT(*) FROM transaction 
      WHERE isdeleted = true AND userId = $1
    `;

    const dataResult = await pool.query(dataQuery, [userId, limitNumber, offset]);
    const countResult = await pool.query(countQuery, [userId]);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limitNumber);

    return res.status(200).json({
      page: pageNumber,
      limit: limitNumber,
      totalItems,
      totalPages,
      transactions: dataResult.rows,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const getAllTransactionOfUser = async (req, res) => {
  
  try{
     const { userId, accountId, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    if (!userId && !accountId) {
      return res
        .status(400)
        .json({ error: "Either userId or accountId must be provided" });
    }

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
        return res.status(403).json({
          error: `Accountant is not authorized to access this account`,
        });
      }
    }

    const dataQuery = `
      SELECT t.*, v.name as vendorName 
      FROM transaction as t 
      LEFT JOIN vendors as v ON t.vendorid = v.id 
      WHERE t.isdeleted = false AND t.userid = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const countQuery = `
      SELECT COUNT(*) 
      FROM transaction 
      WHERE isdeleted = false AND userid = $1
    `;

    const dataResult = await pool.query(dataQuery, [userId, limitNumber, offset]);
    const countResult = await pool.query(countQuery, [userId]);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limitNumber);

    return res.status(200).json({
      page: pageNumber,
      limit: limitNumber,
      totalItems,
      totalPages,
      transactions: dataResult.rows,
    });
  }
  catch (error) {
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
        return res.status(403).json({
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
    const { userId, accountId, transactionId, page = 1, limit = 10  } = req.query;
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
          return res.status(403).json({
            error: `Accountant is not authorized to access this account`,
          });
        }
      }
      
    const offset = (page - 1) * limit;

      // Total count
      const countResult = await pool.query(
        "SELECT COUNT(*) FROM transactionlog WHERE transactionid = $1",
        [transactionId]
      );
      const totalItems = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalItems / limit);

      // Paginated query
      const query = `
        SELECT t.*, u.fname, u.lname
        FROM transactionlog AS t
        LEFT JOIN users AS u ON t.updatedbyuserid = u.id
        WHERE t.transactionid = $1
        ORDER BY t.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      const result = await pool.query(query, [transactionId, limit, offset]);

      
      const logs = result.rows.map((log) => {
        return {
          changes: Object.keys(log).reduce((acc, key) => {
            if (log[key] && changesMap.includes(key)) {
              acc.push({
                field_changed: key,
                new_value: log[key],
              });
            }
            return acc;
          }, []),
          edited_by: `${log.fname} ${log.lname}`,
          timestamp: log.created_at,
        };
      });

      return res.status(200).json({
        page: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages,
        logs,
      });
    } else {
      return res.status(400).json({ error: "Either userId or accountId must be provided" });
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const importTransactionCSV = async (req, res, next) => {
  const userId = req.user.id;

  if (!req.file || req.file.mimetype !== "text/csv" || !req.body.mapping) {
    return res.status(400).json({ error: "CSV file and mapping are required" });
  }

  let mapping;
  try {
    mapping = JSON.parse(req.body.mapping);
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON in mapping" });
  }

  const isValidMapping =
    (!!mapping.moneyIn && !!mapping.moneyOut && !!mapping.created_at) ||
    (!!mapping.moneyInAndMoneyOut && !!mapping.created_at);

  if (!isValidMapping) {
    return res
      .status(400)
      .json({ error: "Missing required fields in mapping" });
  }

  const results = [];
  let isFirstRow = true;
  const formatDate = (dateStr) => {
    // Assuming format is DD/MM/YYYY or D/M/YYYY
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    const isoStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const localDate = new Date(`${isoStr}T00:00:00`); // Ensure local time, not UTC
    return localDate;
  };

  try {
    const parser = fs
      .createReadStream(req.file.path)
      .pipe(parse({ skip_empty_lines: true, relax_column_count: true }));

    for await (const row of parser) {
      // Skip header row if it contains column names
      if (isFirstRow && row.every((col) => isNaN(Number(col)))) {
        isFirstRow = false;
        continue;
      }
      const moneyInRaw = mapping.moneyIn ? row[mapping.moneyIn] : null;
      const moneyOutRaw = mapping.moneyOut ? row[mapping.moneyOut] : null;
      const moneyInAndMoneyOutRaw = mapping.moneyInAndMoneyOut
        ? row[mapping.moneyInAndMoneyOut]
        : null;
      const moneyInAndMoneyOut = moneyInAndMoneyOutRaw
        ? parseFloat(moneyInAndMoneyOutRaw.replace(/,/g, ""))
        : 0;
      const moneyIn = moneyInRaw ? parseFloat(moneyInRaw.replace(/,/g, "")) : 0;
      const moneyOut = moneyOutRaw
        ? parseFloat(moneyOutRaw.replace(/,/g, ""))
        : 0;

      let amount = 0;
      let type = "";

      if (!isNaN(moneyIn) && moneyIn !== 0) {
        amount = Math.abs(moneyIn);
        type = "moneyIn";
      } else if (!isNaN(moneyOut) && moneyOut !== 0) {
        amount = Math.abs(moneyOut);
        type = "moneyOut";
      } else if (!isNaN(moneyInAndMoneyOut) && moneyInAndMoneyOut !== 0) {
        amount = Math.abs(moneyInAndMoneyOut);
        type = moneyInAndMoneyOut > 0 ? "moneyIn" : "moneyOut";
      }

      results.push({
        amount,
        created_at: formatDate(row[mapping.created_at]),
        desc3: row[mapping.transactionDetail],
        desc1: row[mapping.desc1],
        desc2: row[mapping.desc2],
        balance: row[mapping.balance],
        type,
        userId: row[mapping.userId] || userId,
      });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const row of results) {
        const {
          amount,
          created_at,
          type,
          userId,
          desc3,
          desc1,
          desc2,
          balance,
        } = row;

        await client.query(
          `INSERT INTO transaction (amount, created_at, type, userId, desc3, desc1, desc2, balance, isDeleted, category, vendorId)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            amount,
            created_at,
            type,
            parseInt(userId),
            desc3,
            desc1,
            desc2,
            balance,
            false,
            "extra",
            1,
          ]
        );
      }

      await client.query("COMMIT");
      try {
        await fs.promises.unlink(req.file.path);
      } catch (err) {
        console.error("Error deleting CSV file:", err.message);
      }

      return res.status(201).json({ message: "CSV imported successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      return res.status(500).json({ error: `Database error: ${err.message}` });
    } finally {
      client.release();
      await fs.promises.unlink(req.file.path);
    }
  } catch (err) {
    return res.status(500).json({ error: `Unexpected error: ${err.message}` });
  }
};
