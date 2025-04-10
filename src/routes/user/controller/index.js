import { pool } from '../../../config/database.js';

 export const getAllAccountant = async (req, res) => {
  try {
    const result = await pool.query(`SELECT id,fname,lname,created_at FROM users WHERE role = $1`, [ 'accountant']);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

  export const getAllUser = async (req, res) => {
    try {
      const query = `SELECT * FROM users`;
      const result = await pool.query(query);
      res.status(200).json(result.rows);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  export const getByIdUser = async (req, res) => {
    try {
      const id = req.params.id;
      const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
      const user = result.rows[0];
      user ? res.status(200).json(user) : res.status(404).json({ message: "User not found" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  export const updateUser = async (req, res) => {
    try {
      const id = req.params.id;
      const query = `UPDATE users SET ${Object.keys(req.body).map((key, i) => `${key} = $${i + 1}`).join(', ')} WHERE id = $${Object.keys(req.body).length + 1} RETURNING *`;
      const updatedUser = await pool.query(query, [...Object.values(req.body), id]);
      const data = updatedUser.rows[0];
      data ? res.status(200).json(data) : res.status(404).json({ message: "User not found" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  export const deleteUser = async (req, res) => {
    try {
      const id = req.params.id;
      const query = `DELETE FROM users WHERE id = ${id} RETURNING *`;
      const result = await pool.query(query);
      const user = result.rows[0];
      user ? res.status(200).json({ message: "User deleted" }) : res.status(404).json({ message: "User not found" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }