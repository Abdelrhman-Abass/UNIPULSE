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
            console.log(userAlreadyExists)
			return res.status(400).json({ success: false, message: "User already exists" });
		}


        // HASH THE PASSWORD AND MAKE A NEW VERIFICATION CODE
        const hashPassword = bcryptjs.hashSync(password, 12);
        const VerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const VerificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // OTP valid for 30 minutes

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashPassword,
                VerificationCode,
                VerificationCodeExpires,
                isVerified:false,
            }
        });
        // await sendEmailVerificationCode(email , VerificationCode.)

        console.log("New User ID  :  " + newUser.id)
        res.status(201).json( newUser)

    } catch (error) {
        console.log(error.massage)

        res.status(500).json({ massage: `Failed to create user =>  ${error.massage}` })
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


export const verifyCode = async (req, res) => {
    const { email } = req.params;
    const { verificationCode } = req.body;

    console.log(email, typeof(verificationCode))

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        
        console.log(user)
        if (!user || user.isVerified) {
            return res.status(400).json({ message: "Invalid request." });
        }

        if (user.verificationCodeExpires < new Date()) {
            return res.status(400).json({ message: "expired verificationCode." });
        }

        if (user.VerificationCode != verificationCode ) {
            return res.status(400).json({ message: "Invalid verificationCode." });
        }

        await prisma.user.update({
            where: { email },
            data: {
                isVerified: true,
                VerificationCode: null, // Clear verificationCode after verificationCode
                VerificationCodeExpires: null,
            }
        });

        res.status(200).json({ message: "Account verified successfully." });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: `Failed to verify OTP => ${error.message}` });
    }
};


export const updateVerificationCode = async (req, res) => {
    const { email } = req.body;

    try {
        // CHECK IF THE USER EXISTS
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified." });
        }

        // CREATE A NEW VERIFICATION CODE
        const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const newVerificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // OTP valid for 30 minutes

        // UPDATE THE USER RECORD WITH THE NEW VERIFICATION CODE
        await prisma.user.update({
            where: { email },
            data: {
                VerificationCode: newVerificationCode,
                VerificationCodeExpires: newVerificationCodeExpires,
            },
        });

        // await sendEmailVerificationCode(email , VerificationCode.)

        res.status(200).json({ message: "New verification code has been sent." });

    } catch (error) {
        console.error("Error remaking verification code:", error);
        res.status(500).json({ message: `Failed to remake verification code: ${error.message}` });
    }
};

export const logout = (req, res) => {
    res.clearCookie("access_token").status(200).json({ message: "Logout Successful" });
};



export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // CHECK IF THE USER EXISTS
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // GENERATE A JWT RESET TOKEN
        const resetToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // CREATE A RESET PASSWORD URL
        const resetUrl = `http://localhost:3000/api/auth/reset-password/${resetToken}`;

        // Optionally, send the reset URL via email
        // await sendResetTokenEmail(email, resetUrl);
        console.log(resetUrl)
        res.status(200).json(resetUrl)

        // res.status(200).json({ message: "Password reset link has been sent to your email." } , resetUrl);

    } catch (error) {
        console.error("Error generating password reset token:", error);
        res.status(500).json({ message: `Failed to generate password reset token: ${error.message}` });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params; // Token from the reset link
    const { password } = req.body;

    console.log(token , password)

    try {
        // VERIFY THE TOKEN
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // UPDATE USER PASSWORD
        const hashPassword = bcryptjs.hashSync(password, 12);

        await prisma.user.update({
            where: { id: decoded.id },
            data: { password: hashPassword },
        });
        console.log(hashPassword)

        res.status(200).json({ message: "Password reset successfully." });

    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: `Failed to reset password: ${error.message}` });
    }
};


