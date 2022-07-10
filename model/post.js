import mongoose from "mongoose";
const Schema = mongoose.Schema;

const postSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    createdAt: {type:Date, default:Date.now},
    title: String,
    description: String,
    imageSource: String,
    associateId: {type: mongoose.Schema.Types.ObjectId, ref: 'Account'},
    comments: [
        {
            createdAt: {type:Date, default:Date.now},
            comment: String,
            user: String,
            userId: mongoose.Schema.Types.ObjectId
        }
    ],
    likes: [
        {
            userId: mongoose.Schema.Types.ObjectId
        }
    ]
});

export default mongoose.model('Post', postSchema);