import bcryptjs from "bcryptjs";
import prisma from "../lib/prisma.js";
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
    const { email, username, password, role, officialId, department } = req.body;

    try {
        // Validate request parameters
        if (!email || !password || !username || !role || !officialId) {
            throw new Error("All fields are required");
        }

        // Check if the user already exists
        const userAlreadyExists = await prisma.user.findUnique({
            where: { email },
        });

        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash the password and generate a verification code
        const hashPassword = bcryptjs.hashSync(password, 12);
        const VerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const VerificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // OTP valid for 30 minutes

        // Create the user and related role-specific data in one transaction
        const newT = await prisma.user.create({
            data:{
                username,
                email,
                password: hashPassword,
                VerificationCode,
                VerificationCodeExpires,
                officialId,
                isVerified: false,
                role,
            }
        })

        const newUser = await prisma.teacher.create({
            data: {
                userId: newT.id,
                department

            },
        });

        // Respond with the created user
        res.status(201).json({ success: true, user: newUser });

    } catch (error) {
        console.error("Error creating user:", error.message);
        res.status(500).json({ message: `Failed to create user: ${error.message}` });
    }
};

export const getTeacher = async (req, res, next) => {
    try {
        const teachers = await prisma.teacher.findMany()

        res.status(200).json(teachers)
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: "Failed to get users" });
    }
}