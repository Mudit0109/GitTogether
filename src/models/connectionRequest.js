const  mongoose  = require("mongoose");

 

const connectionRequestSchema = new mongoose.Schema({
     fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        required: true,
     },
     toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        required: true,
     },
     status: {
        type: String,
        enum:{ values:["ignored","interested", "accepted", "rejected"],
            message: '{VALUE} is not a valid status'
        },
        default: "ignored",
        required: true
     }
     
},{timestamps: true});

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
// connectionRequestSchema.pre('save', function(next) {
//     if(this.fromUserId.equals(this.toUserId)) {
//         throw new Error("You cannot send a request to yourself");
//     }
//     next();
// });

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);
module.exports = ConnectionRequest;