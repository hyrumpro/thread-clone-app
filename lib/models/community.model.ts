import mongoose, { Schema } from 'mongoose';


const CommunitySchema: Schema = new Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    bio: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread",
        }
    ],
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ]
});


const Community = mongoose.models.Community || mongoose.model('Community', CommunitySchema);


export default Community;