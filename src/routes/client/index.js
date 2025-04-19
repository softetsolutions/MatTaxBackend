import express from "express";
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} from "./controller/index.js";

const clientRouter = express.Router();

clientRouter.post("/create", createClient);
clientRouter.get("/gets", getClients);
clientRouter.get("/getbyId/:id", getClientById);
clientRouter.put("/update/:id", updateClient);
clientRouter.delete("/delete/:id", deleteClient);

export default clientRouter;
