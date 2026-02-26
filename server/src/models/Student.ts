import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentDocument extends Document {
    name: string;
    tabId: string;
    socketId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const StudentSchema = new Schema<IStudentDocument>(
    {
        name: { type: String, required: true },
        tabId: { type: String, required: true, unique: true },
        socketId: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Student = mongoose.model<IStudentDocument>('Student', StudentSchema);
