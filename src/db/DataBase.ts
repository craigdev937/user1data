import { Pool } from "pg";
const connectionString = process.env.DATABASE_URL;

export const dBase: Pool = new Pool({
    connectionString: `${connectionString}`
});


