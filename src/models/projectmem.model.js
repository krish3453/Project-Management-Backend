import mongoose from "mongoose";

import { AvailiableUserRoles, UserRolesEnum } from "../utils/constant.js";

const projectmemSchema = new mongoose.Schema({
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project",
        required:true,
    },
    role: {
        type: String,
        enum: AvailiableUserRoles,
        default: UserRolesEnum.MEMBER,
        required: true,
    }
}, { timestamps: true });

export const ProjectMem = mongoose.model('ProjectMem', projectmemSchema);