import bcryptjs from "bcryptjs";
import prisma from "../lib/prisma.js";
import jwt from 'jsonwebtoken'



export const getUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany()

        res.status(200).json(users)
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: "Failed to get users" });
    }
}


export const getUser = async (req, res, next) => {

    const {id} = req.params
    try {
        const user = await prisma.user.findUnique({
            where: { id },
        })

        res.status(200).json(user)
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: "Failed to get users" });
    }
}


export const updateUser = async (req, res) => {
    const {id} = req.params
    const tokenUserId = req.userId;
    const { password, avatar, ...inputs } = req.body;

    console.log(id)


    if (id !== tokenUserId) {
        return res.status(403).json({ message: "Not Authorized!" });
    }

    let updatedPassword = null;
    try {
        if (password) {
            updatedPassword = await bcryptjs.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...inputs,
                ...(updatedPassword && { password: updatedPassword }),
                ...(avatar && { avatar }),
            },
        });

        const { password: userPassword, ...rest } = updatedUser;

        res.status(200).json(rest);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to update users!" });
    }
};
