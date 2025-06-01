import { pool } from "../../../config/database.js";

export const createCategory = async (req, res) => {
  const { userId, name } = req.body;

  try {
    const response = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const user = response.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const categoryNameResponse = await pool.query(
      "SELECT * FROM category WHERE user_id = $1 and name = $2",
      [userId, name]
    );

    const categoryNameAlreadyPresent = categoryNameResponse.rows[0];

    if (!categoryNameAlreadyPresent) {
      const query = `
        INSERT INTO category (name, user_id)
        VALUES ($1, $2 )
        RETURNING *;
      `;
      const values = [name, userId];
      const { rows } = await pool.query(query, values);
      res.status(200).json(rows[0]);
    } else {
      res.status(200).json({  message: "category already exist" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getCategory = async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM category WHERE user_id = $1",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM category WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "category not found" });
    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name } = req.body;

  const query = `
        UPDATE category
        SET name = $1
        WHERE id = $2 AND user_id = $3 RETURNING *
    `;

  const values = [name, id, userId];
  try {
    const { rows } = await pool.query(query, values);
    if (rows.length === 0)
      return res.status(404).json({ message: "category not found" });
    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "DELETE FROM category WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "category not found" });
    res.status(204).send(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
