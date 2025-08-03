import { model, Schema } from 'mongoose';
import { TUser } from './user.interface';

const userSchema = new Schema<TUser>(
    {
        id: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        needsPasswordChange: {
            type: Boolean,
            default: true,
        },
        role: {
            type: String,
            enum: ['student', 'faculty', 'admin'],
        },

        status: {
            type: String,
            enum: ['in-progress', 'blocked'],
            default: 'in-progress',
        },
    },
    {
        timestamps: true, // for the createdAt and Updated At
    },
);

export const User = model<TUser>('User', userSchema);
