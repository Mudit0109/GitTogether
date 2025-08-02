const express = require('express');
const userRouter = express.Router();
const userAuth = require('../middlewares/auth');
const connectionRequest = require('../models/connectionRequest'); // Adjust the path as necessary
const User = require('../models/user'); // Adjust the path as necessary


//get all the pending connection request for current logged in user
userRouter.get('/requests/requests/received', userAuth, async (req, res) => {
        try{
            const user = req.user; // The user is already attached to the request object by the userAuth middleware
            const requests = await connectionRequest.find({ toUserId: user._id, status: 'interested' }).populate('fromUserId', ['firstname','photoUrl','age','gender','skills','about']); // Populate the fromUserId field with user details
            if (!requests || requests.length === 0) {
                return res.status(404).json({ message: "No pending requests found" });
            }
            res.status(200).json(requests);
        }
        catch(err){
            res.status(500).json({ error: "Internal server error" });
        }
});

userRouter.get('/user/connections', userAuth, async (req, res) => {
    try {
        const user = req.user;

        const connections = await connectionRequest.find({
            $or: [
                { fromUserId: user._id, status: 'accepted' },
                { toUserId: user._id, status: 'accepted' }
            ]
        }).populate('fromUserId', ['firstname','photoUrl','age','gender','skills','about'])
          .populate('toUserId', ['firstname','photoUrl','age','gender','skills','about']);

        if (!connections || connections.length === 0) {
            return res.status(404).json({ message: "No connections found" });
        }

        const data = connections.map((row) => {
            return row.fromUserId._id.toString() === user._id.toString()
                ? row.toUserId
                : row.fromUserId;
        });

        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.get('/feed',userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user; // The user is already attached to the request object by the userAuth middleware

        const page=parseInt(req.query.page) || 1;
        let limit=parseInt(req.query.limit) || 10;
        const skip=(page-1)*limit;
        limit=limit>50?50:limit;
        const connections = await connectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select('fromUserId toUserId status');

        const hideUsersFromFeed=new Set();

        connections.forEach(req => {
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        });
        const users=await User.find({
            $and: [
                    { _id: { $nin: Array.from(hideUsersFromFeed) } },
                    { _id: { $ne: loggedInUser._id } }
                ]
        }).select('firstname photoUrl age gender skills about').skip(skip).limit(limit);
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        res.send(users);
    } 
    catch(err){
        res.status(500).json({ error: err.message });
    }
})



module.exports = userRouter;
