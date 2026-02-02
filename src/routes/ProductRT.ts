import express from "express";
import { PROD } from "../controllers/ProductCTR";

export const prodRt: express.Router = express.Router();
    prodRt.post("/prod", PROD.Create);
    prodRt.get("/prod", PROD.FetchAll);



