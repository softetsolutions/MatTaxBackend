import { pool } from "../../../config/database.js";

export const createVendor = async (req, res, next) => {
  const { userId, name, address, email1, email2, phone1, phone2 } = req.body;

  try {
    const response = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const user = response.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const query = `
        INSERT INTO vendors (name, address, email1, email2, phone1, phone2, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
    const values = [name, address, email1, email2, phone1, phone2, userId];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const getVendors = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM vendors WHERE user_id = $1",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const getVendorById = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM vendors WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Vendor not found" });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateVendor = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name, address, email1, email2, phone1, phone2 } = req.body;

  const query = `
        UPDATE vendors
        SET name = $1, address = $2, email1 = $3, email2 = $4, phone1 = $5, phone2 = $6
        WHERE id = $7 AND user_id = $8 RETURNING *
    `;

  const values = [name, address, email1, email2, phone1, phone2, id, userId];
  try {
    const { rows } = await pool.query(query, values);
    if (rows.length === 0)
      return res.status(404).json({ message: "Vendor not found" });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteVendor = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "DELETE FROM vendors WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Vendor not found" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
