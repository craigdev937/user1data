import "dotenv/config";
import express from "express";
import path from "path";
import favicon from "serve-favicon";
import helmet from "helmet";
import logger from "morgan";
import cookieParser from "cookie-parser";
import { ERR } from "./middleware/midError";
import { userRt } from "./routes/UserRT";

(async () => {
    const app: express.Application = express();
    app.use(favicon(path.join(__dirname, "../public", "favicon.ico")));
    app.use(helmet());

    // CORS Setup
    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        if (req.method === "OPTIONS") {
            res.header("Access-Control-Allow-Methods",
                "POST, GET, PUT, PATCH, DELETE");
            return res
                .status(res.statusCode)
                .json({ "status message": "OK" });
        };
        next();
    });

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(cookieParser());
    app.use(logger("dev"));
    app.use("/api", userRt);
    app.use(ERR.notFound);
    app.use(ERR.errHandler);
    const port = process.env.PORT;
    app.listen(port, () => {
        console.log(`Server 🌐: http://localhost:${port}`);
        console.log("Press CTRL + C to exit.");
    })
})();



