import express from "express";
import jwt from "jsonwebtoken";

export const signToken = (id: string) => 
    jwt.sign({ id }, process.env.JWT_SECRET!, 
        { expiresIn: "1d" }
    );

export const authToken: express.Handler = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET!);
        req.user = decoded;
        next();
    } catch (error) {
        res.sendStatus(403);
    }
};


