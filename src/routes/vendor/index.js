import express from "express";
import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
} from "./controller/index.js";

const vendorRouter = express.Router();

vendorRouter.post("/create", createVendor);
vendorRouter.get("/gets", getVendors);
vendorRouter.get("/getbyId/:id", getVendorById);
vendorRouter.put("/update/:id", updateVendor);
vendorRouter.delete("/delete/:id", deleteVendor);

export default vendorRouter;
