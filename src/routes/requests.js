const express = require('express');
const userAuth = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const  User=require('../models/user');

const requestsRouter = express.Router();

requestsRouter.get("/requests", userAuth, async (req, res) => {
    // Logic to get user requests
    try {
        const user = req.user;
        const requests = await Request.find({ userId: user._id });
        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching user requests:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
requestsRouter.post("/requests/send/:status/:toUserId", userAuth, async (req, res) => {
    // Logic to create a new connection request
    try {
        const { status, toUserId } = req.params;
        const user = req.user;
        if (!toUserId) {
            return res.status(400).json({ error: "To User ID is required" });
        }
        if (status && !["ignored", "interested"].includes(status)) {
            return res.status(400).json({ error: "Invalid status type: " + status });
        }
        if( user._id.toString() === toUserId) {
            return res.status(400).json({ error: "You cannot send a request to yourself" });
        }
        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ error: "User does not exist" });
        }
        // Check if a request already exists
        const existingRequest = await ConnectionRequest.findOne({
            $or: [{ fromUserId: user._id, toUserId }, { fromUserId: toUserId, toUserId: user._id }],
        });
        if (existingRequest) {
            return res.status(400).json({ error: "A request already exists with this status" });
        }
        const newRequest = new ConnectionRequest({
            fromUserId: user._id,
            toUserId,
            status,
        });

        await newRequest.save();
        if (status === "interested") {
            res.status(201).json({ message: user.firstname + " is interested in " + toUser.firstname, request: newRequest });
        } else {
            res.status(201).json({ message: user.firstname + " is not interested in " + toUser.firstname, request: newRequest });
        }
    } catch (error) {
        console.error("Error creating connection request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
requestsRouter.post("/requests/review/:status/:requestId", userAuth, async (req, res) => {
    // Logic to review a connection request
    try {
        const { requestId, status } = req.params;
        const user = req.user;

        if (!requestId || !status) {
            return res.status(400).json({ error: "Request ID and status are required" });
        }
        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status type: " + status });
        }

        const request = await ConnectionRequest.findOne({ _id: requestId, toUserId: user._id, status: "interested" });
        if (!request) {
            return res.status(404).json({ error: "Connection request not found" });
        }
        request.status = status;
        await request.save();
        res.status(200).json({ message: `Request ${status} successfully`, request });
    } catch (error) {
        console.error("Error reviewing connection request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = requestsRouter;
