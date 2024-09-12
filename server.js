import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from './routes/auth.route.js'
import usersRoute from './routes/users.route.js'
import teacherRoute from './routes/teacher.route.js'
import studentRoute from './routes/student.route.js'
import adminRoute from './routes/admin.route.js'
import courseRoute from './routes/course.route.js'



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({origin:process.env.CLIENT_URL , credentials:true}))
app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies


app.use("/api/auth",authRoute)
app.use("/api/users",usersRoute)
app.use("/api/teacher",teacherRoute)
app.use("/api/student",studentRoute)
app.use("/api/admin",adminRoute)
app.use("/api/course",courseRoute)


app.listen(PORT, () => {

	console.log("Server is running on port: ", PORT);
});