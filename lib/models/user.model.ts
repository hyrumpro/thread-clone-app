import mongoose, { Document, Schema, Types } from 'mongoose';

interface IUser extends Document {
    id: string;
    username: string;
    name: string;
    image?: string;
    bio?: string;
    threads: Types.ObjectId[];
    onboarded: boolean;
    communities: Types.ObjectId[];
}

const UserSchema: Schema = new Schema<IUser>({
    id: {
      type: String,
      required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
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
    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread",
        }
    ],
    onboarded: {
        type: Boolean,
        default: false,
    },
    communities: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Community",
        }
    ]
});


const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);


export default UserModel;