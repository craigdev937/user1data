import express from "express";
import bcrypt from "bcrypt";
import { dBase } from "../db/DataBase";
import { signToken } from "../middleware/Auth";
import { RegisterSchema, RegisterType, 
    LoginSchema, LoginType } from "../validation/Schema";

class UserClass {
    Register: express.Handler = async (req, res, next) => {
        try {
            const R = RegisterSchema.parse(req.body);
            const checkQRY = `SELECT * FROM users WHERE email = $1`;
            const IDValue = [R.email];
            const user = await dBase.query(checkQRY, IDValue);
            if (user.rows.length > 0) {
                return res.status(401).json("User already exists!");
            };
            const salt = await bcrypt.genSalt(10);
            const bcryptPA = await bcrypt.hash(R.password, salt);
            const QRY = `INSERT INTO users 
                (first, last, email, password)
                VALUES ($1, $2, $3, $4) RETURNING *`;
            const values = [R.first, R.last, R.email, bcryptPA];
            const newUser = await dBase.query(QRY, values);
            const jwtToken = signToken(newUser.rows[0].id);
            return res
                .status(res.statusCode)
                .json({
                    success: true,
                    message: "User is Registered!",
                    data: jwtToken
                })
        } catch (error) {
            res
                .status(res.statusCode)
                .json({
                    success: false,
                    message: "Error Registering User!",
                    error: error instanceof Error ?
                        error.message : "Unknown Error!"
                });
            return next(error);
        }
    };

    Login: express.Handler = async (req, res, next) => {
        try {
            const L = LoginSchema.parse(req.body);
            const loginQRY = `SELECT * FROM users WHERE email = $1`;
            const loginVAL = [L.email];
            const user = await dBase.query<LoginType>(loginQRY, loginVAL);
            if (user.rows.length === 0) {
                return res.status(401).json("Invalid Credentials");
            };
            const validPASS = await bcrypt.compare(
                L.password, user.rows[0].password
            );
            if (!validPASS) {
                return res.status(401).json("Invalid Credentials");
            };
            const jwtToken = signToken(user.rows[0].email);
            res.cookie("token", jwtToken, {
                httpOnly: true,
                secure: false,      // set to false if testing
                sameSite: "strict", // on localhost without HTTPS
                maxAge: 1000 * 60 * 60 * 24 // 1 day
            });
            return res
                .status(res.statusCode)
                .json({
                    success: true,
                    message: "User is now Logged in!",
                    data: jwtToken
                })
        } catch (error) {
            res
                .status(res.statusCode)
                .json({
                    success: false,
                    message: "Error Logging in the User!",
                    error: error instanceof Error ?
                        error.message : "Unknown Error!"
                });
            return next(error);
        }
    };

    Logout: express.Handler = async (req, res, next) => {
        try {
            res.clearCookie("token", {
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            });
            return res
                .status(res.statusCode)
                .json({
                    success: true,
                    message: "User has successfully logged out!"
                })
        } catch (error) {
            res
                .status(res.statusCode)
                .json({
                    success: false,
                    message: "Error Logging out the User!",
                    error: error instanceof Error ?
                        error.message : "Unknown Error!"
                });
            return next(error);
        }
    };

    FetchAll: express.Handler = async (req, res, next) => {
        try {
            const QRY = `SELECT * FROM users ORDER BY user_id ASC`;
            const users = await dBase.query<RegisterType[]>(QRY);
            return res
                .status(res.statusCode)
                .json({
                    success: true,
                    message: "All Registered Users!",
                    count: users.rows.length,
                    data: users.rows
                });
        } catch (error) {
            res
                .status(res.statusCode)
                .json({
                    success: false,
                    message: "Error Fetching all the Users!",
                    error: error instanceof Error ?
                        error.message : "Unknown Error!"
                });
            return next(error);
        }
    };

    GetOne: express.Handler = async (req, res, next) => {
        try {
            const { user_id } = req.params;
            const QRY = `SELECT * FROM users WHERE user_id = $1`;
            const values = [user_id];
            const user = await dBase.query<RegisterType>(QRY, values);
            return res
                .status(res.statusCode)
                .json(user.rows[0]);
        } catch (error) {
            res
                .status(res.statusCode)
                .json({
                    success: false,
                    message: "Error Fetching one user!",
                    error: error instanceof Error ?
                        error.message : "Unknown Error!"
                });
            return next(error);
        }
    };

    Update: express.Handler = async (req, res, next) => {
        try {
            const U = RegisterSchema.parse(req.body);
            const { user_id } = req.params;
            const QRY = `UPDATE users 
            SET first=$1, last=$2, email=$3, password=$4, 
            updated_at=CURRENT_TIMESTAMP
            WHERE user_id=$5 RETURNING *`;
            const values = [U.first, U.last, U.email, 
                U.password, user_id];
            const user = await dBase.query<RegisterType>(QRY, values);
            return res
                .status(res.statusCode)
                .json({
                    success: true,
                    message: "The User was Updated!",
                    data: user.rows[0]
                });
        } catch (error) {
            res
                .status(res.statusCode)
                .json({
                    success: false,
                    message: "Error updating this User!",
                    error: error instanceof Error ?
                        error.message : "Unknown Error!"
                });
            return next(error);
        }
    };

    Delete: express.Handler = async (req, res, next) => {
        try {
            const { user_id } = req.params;
            const QRY = "DELETE FROM users WHERE user_id=$1";
            const values = [user_id];
            const delUser = await dBase.query<RegisterType>(QRY, values);
            return res
                .status(res.statusCode)
                .json({
                    success: true,
                    message: "The User was Deleted!",
                    data: delUser
                })
        } catch (error) {
            res
                .status(res.statusCode)
                .json({
                    success: false,
                    message: "Error updating this User!",
                    error: error instanceof Error ?
                        error.message : "Unknown Error!"
                });
            return next(error);
        }
    };
};

export const USERS: UserClass = new UserClass();





