import mongoose from "mongoose";
const Schema = mongoose.Schema;

const accountSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    createdAt: {type:Date, default:Date.now},
    firstName: String,
    lastName: String,
    username: String,
    email: String,
    password: String,
    isApproved: {type:Boolean, default:true},
    avatar: String,
    point: {type:Number, default:0},
    notifications: [
        {
            createdAt: {type:Date, default:Date.now},
            userId: mongoose.Schema.Types.ObjectId,
            message: String,
            seen: {type:Boolean, default:false},
            referecedPostId: {type: mongoose.Schema.Types.ObjectId, ref: "Post"}
        }
    ],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }]
});

export default mongoose.model('Account', accountSchema);