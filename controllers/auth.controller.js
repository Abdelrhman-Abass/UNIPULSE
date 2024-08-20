import bcryptjs from "bcryptjs";
import prisma from "../lib/prisma.js";
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {

    const { email, username, password } = req.body

    try {
        // Check the validation of the query parameters
        if (!email || !password || !username) {
			throw new Error("All fields are required");
		}

        // Check if the user is already exists
        const userAlreadyExists =  await prisma.user.findUnique({
            where: { email },
        });
		console.log("userAlreadyExists", userAlreadyExists);

		if (userAlreadyExists) {
			return res.status(400).json({ success: false, message: "User already exists" });
		}


        // HASH THE PASSWORD AND MAKE A NEW VERIFICATION CODE
        const hashPassword = bcryptjs.hashSync(password, 12);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        // CREATE A NEW USER AND SAVE IT TO DB
        const newUser = await prisma.user.create({
            data: {
                username, email, password: hashPassword,
            }
        })

        console.log(newUser)
        res.status(201).json({ massage: "User created successfully" })

    } catch (error) {
        console.log(error.massage)

        res.status(500).json({ massage: `Failed to create user =>  ${error}` })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // CHECK IF THE USER EXISTS

        const user = await prisma.user.findUnique({
            where: {  email },
        });

        if (!user) return res.status(404).json({ message: "Invalid Credentials!" });

        // CHECK IF THE PASSWORD IS CORRECT

        const isPasswordValid = await bcryptjs.compare(password, user.password);

        if (!isPasswordValid)
            return res.status(401).json({ message: "Invalid Credentials!" });

        // GENERATE COOKIE TOKEN AND SEND TO THE USER

        // res.setHeader("Set-Cookie", "test=" + "myValue").json("success")
        const age = 1000 * 60 * 60 * 24;

        const token = jwt.sign(
            {
                id: user.id,
                isAdmin: false,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: age }
        );

        const { password: userPassword, ...userInfo } = user;

        res
            .cookie("access_token", token, {
                httpOnly: true,
                // secure:true,  // Production mode
                maxAge: age,
            })
            .status(200)
            .json(userInfo);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to login!" });
    }
};

export const logout = (req, res) => {
    res.clearCookie("access_token").status(200).json({ message: "Logout Successful" });
};