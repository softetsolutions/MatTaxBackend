import { pool } from "../../../config/database.js";

export const createAccountNo = async (req, res) => {
  const { userId, accountNo } = req.body;

  try {
    const response = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const user = response.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const query = `
        INSERT INTO accountNo (accountNo, user_id)
        VALUES ($1, $2)
        RETURNING *;
      `;
    const values = [accountNo, userId];

    const { rows } = await pool.query(query, values);
    res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAccountNo = async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM accountNo WHERE user_id = $1",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAccountNoById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM accountNo WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "accountNo not found" });
    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateAccountNo = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { accountNo } = req.body;

  const query = `
        UPDATE accountNo
        SET name = $1
        WHERE id = $2 AND user_id = $3 RETURNING *
    `;

  const values = [accountNo, id, userId];
  try {
    const { rows } = await pool.query(query, values);
    if (rows.length === 0)
      return res.status(404).json({ message: "accountNo not found" });
    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteAccountNo = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "DELETE FROM accountNo WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "accountNo not found" });
    res.status(204).send(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
