import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/user.js';

export const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) return res.status(404).json({ message: "User doesn't exist." });

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials." });

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, "SECRET_TEST_STRING", { expiresIn: "1h" });
        res.status(200).json({ profile: existingUser, token });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong." })
    }
};


export const signup = async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exist." });

        if (password !== confirmPassword) return res.status(400).json({ message: "password don't match" });

        const hashedPassword = await bcrypt.hash(password, 12);
        const profile = await User.create({ email, password: hashedPassword, name: `${firstName} ${lastName}` })

        const token = jwt.sign({ email: profile.email, id: profile._id }, "SECRET_TEST_STRING", { expiresIn: "1h" });
        res.status(200).json({ profile, token });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong." })
    }
};