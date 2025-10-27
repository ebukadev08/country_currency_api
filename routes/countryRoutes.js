import express from "express";
import {
  refreshCountries,
  getCountries,
  getCountry,
  deleteCountry,
  getStatus,
  getSummaryImage,
} from "../controllers/countryController.js";

const router = express.Router();

router.post("/countries/refresh", refreshCountries);
router.get("/countries", getCountries);
router.get("/countries/:name", getCountry);
router.delete("/countries/:name", deleteCountry);
router.get("/status", getStatus);
router.get("/countries/image", getSummaryImage);

export default router;
