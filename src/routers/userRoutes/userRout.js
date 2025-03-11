import express from "express";
import { signupController } from "../../controllers/UserController/signupController.js";

const Userrouter = express.Router();

Userrouter.post("/signup", signupController);

export default Userrouter;