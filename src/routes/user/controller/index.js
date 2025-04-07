import EctDct from '../../../config/managePassword.js';
import { pool } from '../../../config/database.js';

const { encrypt } = EctDct;

 export const getAllAccountant = async (req, res) => {
  console.log("Fetching all accountants...");
  // console.log("Request body:", req.body);
  try {
    // const query = `SELECT * FROM users WHERE role = $1` [ 'accountant'];
    const result = await pool.query(`SELECT * FROM users WHERE role = $1`, [ 'accountant']);
    console.log(result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

  export const createUser = async (req, res)=> {
    try {
      req.body.password = await encrypt(req.body.password, process.env.KEY);
      const query = `INSERT INTO users (${Object.keys(req.body).join(', ')}) VALUES (${Object.keys(req.body).map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *;`;
      const result = await pool.query(query, Object.values(req.body));
      res.status(201).json(result.rows[0]);
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