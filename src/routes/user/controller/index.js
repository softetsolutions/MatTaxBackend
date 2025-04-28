import { pool } from "../../../config/database.js";

export const getAllAccountant = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(userId, "userId in getAllAccountant");

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.fname,
        u.lname,
        u.email,
        u.address,
        CASE 
          WHEN a.userid IS NOT NULL THEN a.status
          ELSE 'unauthorized'
        END AS is_authorized
      FROM
        users u
      LEFT JOIN
        authorizetable a
        ON u.id = a.accountid AND a.userid = $1
      WHERE
        u.role = 'accountant';
    `,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const query = `SELECT * FROM users`;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const usersAuthAccountants = async (req, res) => {
  try {
    const query = `
      SELECT 
      u.id AS user_id,
      u.fname AS user_fname,
      u.lname AS user_lname,
      u.email AS user_email,
      u.address AS user_address,
      u.phone AS user_phone,
      u.role AS user_role,
      u.islocked AS locked_status,
      acc.id AS accountant_id,
      acc.fname AS accountant_fname,
      acc.lname AS accountant_lname,
      acc.email AS accountant_email,
      acc.phone AS accountant_phone
    FROM 
      users AS u
    LEFT JOIN authorizetable AS a ON a.userid = u.id
    LEFT JOIN users AS acc ON acc.id = a.accountid AND acc.role = 'accountant' AND a.status = 'approved'
    WHERE 
      u.role = 'user'
    `;
    const result = await pool.query(query);

    // Grouping data
    const usersMap = new Map();

    result.rows.forEach((row) => {
      if (!usersMap.has(row.user_id)) {
        usersMap.set(row.user_id, {
          user_id: row.user_id,
          user_fname: row.user_fname,
          user_lname: row.user_lname,
          user_email: row.user_email,
          user_address: row.user_address,
          locked_status: row.locked_status,
          user_phone: row.user_phone,
          authorize_status: row.authorize_status,
          accountants: [],
        });
      }

      if (row.accountant_id) {
        // Only if accountant exists
        usersMap.get(row.user_id).accountants.push({
          accountant_id: row.accountant_id,
          accountant_fname: row.accountant_fname,
          accountant_lname: row.accountant_lname,
          accountant_email: row.accountant_email,
          accountant_phone: row.accountant_phone,
        });
      }
    });

    res.status(200).json([...usersMap.values()]); // Convert map to array
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const AccountantsAuthUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        acc.id AS accountant_id,
        acc.fname AS accountant_fname,
        acc.lname AS accountant_lname,
        acc.email AS accountant_email,
        acc.address AS accountant_address,
        acc.phone AS accountant_phone,
        acc.role AS accountant_role,
        acc.islocked AS locked_status,
        u.id AS user_id,
        u.fname AS user_fname,
        u.lname AS user_lname,
        u.email AS user_email,
        u.phone AS user_phone
      FROM 
        users AS acc
      LEFT JOIN authorizetable AS a ON acc.id = a.accountid AND a.status = 'approved'
      LEFT JOIN users AS u ON u.id = a.userid AND u.role = 'user'
      WHERE acc.role = 'accountant'
    `;

    const result = await pool.query(query);

    // Group by accountant
    const accountantsMap = new Map();

    result.rows.forEach((row) => {
      if (!accountantsMap.has(row.accountant_id)) {
        accountantsMap.set(row.accountant_id, {
          accountant_id: row.accountant_id,
          accountant_fname: row.accountant_fname,
          accountant_lname: row.accountant_lname,
          accountant_email: row.accountant_email,
          locked_status: row.locked_status,
          accountant_address: row.accountant_address,
          accountant_phone: row.accountant_phone,
          authorize_status: row.authorize_status,
          users: [],
        });
      }

      if (row.user_id) {
        // Only if user exists
        accountantsMap.get(row.accountant_id).users.push({
          user_id: row.user_id,
          user_fname: row.user_fname,
          user_lname: row.user_lname,
          user_email: row.user_email,
          user_phone: row.user_phone,
        });
      }
    });

    res.status(200).json([...accountantsMap.values()]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getByIdUser = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = result.rows[0];
    user
      ? res.status(200).json(user)
      : res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const query = `UPDATE users SET ${Object.keys(req.body)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(", ")} WHERE id = $${Object.keys(req.body).length + 1} RETURNING *`;
    const updatedUser = await pool.query(query, [
      ...Object.values(req.body),
      id,
    ]);
    const data = updatedUser.rows[0];
    data
      ? res.status(200).json(data)
      : res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const query = `DELETE FROM users WHERE id = ${id} RETURNING *`;
    const result = await pool.query(query);
    const user = result.rows[0];
    user
      ? res.status(200).json({ message: "User deleted" })
      : res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
