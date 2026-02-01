import express from "express";
import { USERS } from "../controllers/UserCTR";

// ROUTE:  localhost:9000/api/user
export const userRt: express.Router = express.Router();
    userRt.post("/user/register", USERS.Register);
    userRt.post("/user/login", USERS.Login);
    userRt.post("/user/logout", USERS.Logout);
    userRt.get("/user", USERS.FetchAll);
    userRt.get("/user/:user_id", USERS.GetOne);
    userRt.put("/user/:user_id", USERS.Update);
    userRt.delete("/user/:user_id", USERS.Delete);
    


