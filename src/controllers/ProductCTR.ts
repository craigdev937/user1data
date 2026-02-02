import express from "express";
import { v2 as CLOUD, UploadApiResponse } from "cloudinary";
import { dBase } from "../db/DataBase";
import { ProdSchema, ProdType } from "../validation/Schema";

// Helper function to handle Cloudinary stream upload.
const streamUpload = (fileBuffer: Buffer) => {
    return new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = CLOUD
            .uploader
            .upload_stream((error, result) => {
                if (result) resolve(result);
                else reject(error);
            });
        stream.end(fileBuffer);
    })
};

class ProdClass {
    Create: express.Handler = async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400)
                    .json({ 
                        success: false, 
                        message: "No image uploaded" 
                    })
            };
            const cloudRes = await streamUpload(req.file.buffer);
            const P = ProdSchema.parse({
                ...req.body,
                image: cloudRes.secure_url,
                cloudinary_id: cloudRes.public_id
            });
            const QRY = `INSERT INTO products 
            (name, description, price, image, cloudinary_id) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`;
            const values = [P.name, P.description, P.price, 
                P.image, P.cloudinary_id];
            const newProd = await dBase.query<ProdType>(QRY, values);
            return res
                .status(res.statusCode)
                .json({
                    success: true,
                    message: "The Product was Created!",
                    data: newProd.rows[0]
                })
        } catch (error) {
            res
                .status(res.statusCode)
                .json({
                    success: false,
                    message: "Error creating the Product!",
                    error: error instanceof Error ?
                        error.message : "Unknown Error!"
                });
            return next(error);
        }
    };

    FetchAll: express.Handler = async (req, res, next) => {
        try {
            const QRY = "SELECT * FROM ORDER BY prod_id ASC";
            const products = await dBase.query<ProdType[]>(QRY);
            return res
                .status(res.statusCode)
                .json({
                    success: true,
                    message: "All Products!",
                    count: products.rows.length,
                    data: products.rows
                });
        } catch (error) {
            res
                .status(res.statusCode)
                .json({
                    success: false,
                    message: "Error Fetching all the Products!",
                    error: error instanceof Error ?
                        error.message : "Unknown Error!"
                });
            return next(error);            
        }
    };
};

export const PROD: ProdClass = new ProdClass();



