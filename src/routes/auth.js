const express=require('express');
const authRouter=express.Router();
const { validateSignupData } = require("../utils/validation");
const User = require('../models/user');
const bcrypt = require("bcrypt");


authRouter.post("/signup", async (req, res) => {
    // Validating the request body

    // Encrypting the password before saving
   const { firstname, lastname, email, password } = req.body;

    //  Validate user input using utility function
    const { isValid, errors } = validateSignupData({ firstname, email, password });

    if (!isValid) {
        return res.status(400).json({ errors });
    }

    try {
        //  Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered" });
        }

        //  Hash the password before saving (recommended)
        
        const hashedPassword = await bcrypt.hash(password, 10);

        //  Create and save new user
        const user = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword,
        });

        const savedUser= await user.save();
        const token=await savedUser.getJWT();
         res.cookie('token', token, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000)});
        res.status(201).json({ message: "User registered successfully",data: savedUser });

    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }  
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isMatch = await user.validatePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        //create a JWT token 
        const token = await user.getJWT();
        //add token to cookie and send it to the client
        console.log("Token generated:", token);
        res.cookie('token', token, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000)});
        console.log(user);
        res.status(200).json( user );


    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
authRouter.post("/logout", (req, res) => {
    // Clear the cookie by setting its expiration date to the now
    res.cookie('token', null, { expires: new Date(Date.now()) });
    res.status(200).json({ message: "Logout successful" });
});




module.exports=authRouter;