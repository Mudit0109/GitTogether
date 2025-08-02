const userAuth=async (req, res, next) => {
    //read the token from cookies
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    const jwt = require('jsonwebtoken');
    const User = require('../models/user'); // Adjust the path as necessary
    try {
        const isTokenValid =await jwt.verify(token, process.env.JWT_SECRET);
        const user=await User.findById(isTokenValid._id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        req.user = user; // Attach user to request object
        console.log("User authenticated:", user);
        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Invalid token:", error);
        return res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = userAuth;
