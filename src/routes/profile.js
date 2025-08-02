const express = require('express');
const userAuth = require('../middlewares/auth'); // Adjust the path as necessary
const { validateEditProfileData } = require("../utils/validation"); // Assuming you have a validation function for profile data
const bcrypt = require('bcrypt'); // Assuming you are using bcrypt for password hashing
const profileRouter = express.Router();
const { validateEditPassword } = require("../utils/validation"); // Assuming you have a validation function for password

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    // Logic to get user profile information
    try {
        const user = req.user; // The user is already attached to the request object by the userAuth middleware

        // Here you would typically fetch the user from the database using the token or session
        res.status(200).json(user || { message: "User not found" });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    // Logic to update user profile information
    try {
        const { isValid, errors } = validateEditProfileData(req.body);
        if (!isValid) {
            return res.status(400).json({ errors });
        }

        const user = req.user; // The user is already attached to the request object by the userAuth middleware
        // Here you would typically update the user in the database
        Object.keys(req.body).forEach(key => {
            user[key] = req.body[key];
        });
        await user.save();
        res.status(200).json({ message: `${user.firstname}, your profile is updated successfully`, user });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
profileRouter.patch("/profile/edit/password", userAuth, async (req, res) => {
    // Logic to update user password
    try {
        const { password } = req.body;
        const { isValid, errors } = validateEditPassword({ password });
        if (!isValid) {
            return res.status(400).json({ errors });
        }
        const user = req.user; // The user is already attached to the request object by the userAuth middleware
        user.password = await bcrypt.hash(password, 10);
        await user.save();
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating user password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
module.exports = profileRouter;
