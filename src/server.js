import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import router from "./routers/AllRouters.js";

dotenv.config();

const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

const app = express();

app.use(express.json());

connectDB();

app.use("/api", router);

const startServer = () => {
  try {
    app.listen(port, () => {
      console.log(`Server is listening at http://${host}:${port}`);
    });
  } catch (err) {
    console.error("Failed to start the server:", err);
    process.exit(1);
  }
};

startServer();