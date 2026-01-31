import express from "express";
import bcrypt from "bcrypt";
import { dBase } from "../db/DataBase";
import { signToken } from "../middleware/Auth";
import { UserSchema, UserType } from "../validation/Schema";

class UserClass {
    Register: express.Handler = async (req, res, next) => {
        try {
            const U = UserSchema.parse(req.body);
            const checkIdQRY = `SELECT * FROM users WHERE email = $1`;
            const IDValue = [U.email];
            const user = await dBase.query(checkIdQRY, IDValue);
            if (user.rows.length > 0) {
                return res.status(401).json("User already exists!");
            };
            const salt = await bcrypt.genSalt(10);
            const bcryptPA = await bcrypt.hash(U.password, salt);
            const QRY = `INSERT INTO users 
                (first, last, email, password)
                VALUES ($1, $2, $3, $4) RETURNING *`;
            const values = [U.first, U.last, U.email, bcryptPA];
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

    FetchAll: express.Handler = async (req, res, next) => {
        try {
            const QRY = `SELECT * FROM users ORDER BY user_id ASC`;
            const users = await dBase.query<UserType[]>(QRY);
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

    Login: express.Handler = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const loginQRY = `SELECT * FROM users WHERE email = $1`;
            const loginVAL = [email];
            const user = await dBase.query(loginQRY, loginVAL);
            if (user.rows.length === 0) {
                return res.status(401).json("Invalid Credentials");
            };
            const validPASS = await bcrypt.compare(
                password, user.rows[0].user_password
            );
            if (!validPASS) {
                return res.status(401).json("Invalid Credentials");
            };
            const jwtToken = signToken(user.rows[0].user_id);
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
};

export const USERS: UserClass = new UserClass();





