import express from "express";
import {
  createCategory,
  getCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "./controller/index.js";
import verifyToken from "../../middleware/verifyAuth.js";

const categoryRouter = express.Router();

categoryRouter.post("/create", createCategory); 
categoryRouter.get("/gets", getCategory);
categoryRouter.get("/getbyId/:id", getCategoryById);
categoryRouter.put("/update/:id", updateCategory);
categoryRouter.delete("/delete/:id", deleteCategory);

export default categoryRouter;
