import express from "express";
import { USERS } from "../controllers/UserCTR";

// ROUTE:  localhost:9000/api/user
export const userRt: express.Router = express.Router();
    userRt.post("/user/register", USERS.Register);
    userRt.post("/user/login", USERS.Login);
    userRt.get("/user", USERS.FetchAll);
    


