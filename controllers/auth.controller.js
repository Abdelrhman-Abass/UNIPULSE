import bcryptjs from "bcryptjs";
import prisma from "../lib/prisma.js";
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {

    const { email, username, password } = req.body

    try {
        // HASH THE PASSWORD
        const hashPassword = await bcryptjs.hash(password, 10);

        // CREATE A NEW USER AND SAVE IT TO DB
        const newUser = await prisma.user.create({
            data: {
                username, email, password: hashPassword,
            }
        })


        res.status(201).json({ massage: "User created successfully" })

    } catch (error) {
        console.log(error.massage)

        res.status(500).json({ massage: `Failed to create user =>  ${error}` })
    }
}

export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // CHECK IF THE USER EXISTS

        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) return res.status(400).json({ message: "Invalid Credentials!" });

        // CHECK IF THE PASSWORD IS CORRECT

        const isPasswordValid = await bcryptjs.compare(password, user.password);

        if (!isPasswordValid)
            return res.status(400).json({ message: "Invalid Credentials!" });

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
            .cookie("token", token, {
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
    res.clearCookie("token").status(200).json({ message: "Logout Successful" });
};