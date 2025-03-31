import userRepositry from "../repositery/userRepositery.js";
import EctDct from '../config/managePassword.js';

const { createUser, getUsers, getUserById, updateUser, deleteUser } = userRepositry;
const {encrypt} = EctDct;

class UserController {
  async createUser(req, res) {
    try {
      req.body.password = await encrypt(req.body.password,process.env.KEY);
      const user = await createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllUser(req, res) {
    try {
      res.status(200).json(await getUsers());
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getByIdUser(req, res) {
    try {
      const user = await getUserById(req.params.id);
      user ? res.status(200).json(user) : res.status(404).json({ message: "User not found" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const user = await updateUser(req.params.id, req.body);
      user ? res.status(200).json(user) : res.status(404).json({ message: "User not found" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const user = await deleteUser(req.params.id);
      user ? res.status(200).json({ message: "User deleted" }) : res.status(404).json({ message: "User not found" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new UserController();