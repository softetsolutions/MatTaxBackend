import { pool } from "../../../config/database.js";

export const createVendor = async (req, res, next) => {
    const { name, address, email1, email2, phone1, phone2 } = req.body;
    const query = `INSERT INTO vendors (name, address, email1, email2, phone1, phone2)
                   VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [name, address, email1, email2, phone1, phone2];
    try {
        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]);
    } catch (error) {
        next(error);
    }
};

export const getVendors = async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM vendors');
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

export const getVendorById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM vendors WHERE vendorid = $1', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Vendor not found' });
        res.json(rows[0]);
    } catch (error) {
        next(error);
    }
};

export const updateVendor = async (req, res, next) => {
    const { id } = req.params;
    const { name, address, email1, email2, phone1, phone2 } = req.body;
    const query = `UPDATE vendors SET
                     name = $1, address = $2, email1 = $3,
                     email2 = $4, phone1 = $5, phone2 = $6
                   WHERE vendorid = $7 RETURNING *`;
    const values = [name, address, email1, email2, phone1, phone2, id];
    try {
        const { rows } = await pool.query(query, values);
        if (rows.length === 0) return res.status(404).json({ message: 'Vendor not found' });
        res.json(rows[0]);
    } catch (error) {
        next(error);
    }
};

export const deleteVendor = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM vendors WHERE vendorid = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Vendor not found' });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};