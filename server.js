import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({origin:process.env.CLIENT_URL , credentials:true}))
app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies



app.listen(PORT, () => {

	console.log("Server is running on port: ", PORT);
});