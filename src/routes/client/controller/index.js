import { pool } from "../../../config/database.js";

export const createClient = async (req, res, next) => {
    const { uid, name, address, email1, email2, phone1, phone2 } = req.body;
    const query = `INSERT INTO clients (uid, name, address, email1, email2, phone1, phone2)
                   VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const values = [uid, name, address, email1, email2, phone1, phone2];
    try {
        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]);
    } catch (error) {
        next(error);
    }
};

export const getClients = async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM clients');
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

export const getClientById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM clients WHERE clientid = $1', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Client not found' });
        res.json(rows[0]);
    } catch (error) {
        next(error);
    }
};

export const updateClient = async (req, res, next) => {
    const { id } = req.params;
    const { uid, name, address, email1, email2, phone1, phone2 } = req.body;
    const query = `UPDATE clients SET
                     uid = $1, name = $2, address = $3,
                     email1 = $4, email2 = $5, phone1 = $6, phone2 = $7
                   WHERE clientid = $8 RETURNING *`;
    const values = [uid, name, address, email1, email2, phone1, phone2, id];
    try {
        const { rows } = await pool.query(query, values);
        if (rows.length === 0) return res.status(404).json({ message: 'Client not found' });
        res.json(rows[0]);
    } catch (error) {
        next(error);
    }
};

export const deleteClient = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM clients WHERE clientid = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Client not found' });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};