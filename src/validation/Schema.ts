import { z } from "zod";

export const RegisterSchema = z.object({
    first: z.string().min(2).max(120, {
        message: "First name must be 120 or less!"
    }),
    last: z.string().min(2).max(120, {
        message: "Last name must be 120 or less!"
    }),
    email: z.email({ pattern: z.regexes.html5Email })
        .min(1, { message: "Email is required!" }),        
    password: z.string()
        .min(6, { message: "Must be at least 6 characters." })
});

export const LoginSchema = z.object({
    email: z.email({ pattern: z.regexes.html5Email })
        .min(1, { message: "Email is required!" }),        
    password: z.string()
        .min(6, { message: "Must be at least 6 characters." })
});



export const ProdSchema = z.object({
    name: z.string().min(1, "Name is required!"),
    description: z.string().min(1, "Description is required!"),
    // "coerce" converts string to a number.
    price: z.coerce.number().positive(),
    image: z.string(),
    cloudinary_id: z.string()
});

export const OrderSchema = z.object({
    product_id: z.number(),
    quantity: z.number().positive
});

// Zod Types also used for Models.
export type RegisterType = z.infer<typeof RegisterSchema>;
export type LoginType = z.infer<typeof LoginSchema>;
export type ProdType = z.infer<typeof ProdSchema>;
export type OrderType = z.infer<typeof OrderSchema>;



