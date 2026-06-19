import mongoose from "mongoose";

import {AvailiableTaskStatus,TaskStatusEnum} from "../utils/constant.js";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
        enum: AvailiableTaskStatus,
        default: TaskStatusEnum.TODO,
        required: true,
    },
    attachments: {
        type: [{
            url: String,
            mimetype: String,
            filename: String,
            size: Number,
        }],
        default: [],
    }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);