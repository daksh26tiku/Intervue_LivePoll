import mongoose, { Schema, Document } from 'mongoose';

export interface IPollDocument extends Document {
    question: string;
    options: { text: string; votes: number; isCorrect: boolean }[];
    timerDuration: number;
    startedAt: Date;
    isActive: boolean;
    voters: { tabId: string; optionIndex: number }[];
    createdAt: Date;
    updatedAt: Date;
}

const PollSchema = new Schema<IPollDocument>(
    {
        question: { type: String, required: true },
        options: [
            {
                text: { type: String, required: true },
                votes: { type: Number, default: 0 },
                isCorrect: { type: Boolean, default: false },
            },
        ],
        timerDuration: { type: Number, required: true, max: 60 },
        startedAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
        voters: [
            {
                tabId: { type: String, required: true },
                optionIndex: { type: Number, required: true },
            },
        ],
    },
    { timestamps: true }
);

export const Poll = mongoose.model<IPollDocument>('Poll', PollSchema);
