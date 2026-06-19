import { User } from "../models/user.model.js";
import { Project } from "../models/PROJECT.MODEL.js";
import { ProjectMem } from "../models/projectmem.model.js";
import{Task} from "../models/task.model.js"
import {Subtask} from "../models/subtask.model.js"
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asynchandlers.js";
import {ApiError} from "../utils/apierror.js";
import mongoose from "mongoose";
import{ AvailiableUserRoles} from "../utils/constant.js"
import{upload} from "../utils/multer.js"


const getTasks=asyncHandler(async(req,res)=>{
    const {projectId}=req.params
    const project = await Project.findById(projectId)
    if(!project){
        throw new ApiError(404,"Project not found")
    }

    const tasks = await Task.find({project:new mongoose.Types.ObjectId(projectId)})
    .populate("assignedTo","avatar username fullname")

    res.status(200).json(new ApiResponse(true, "Tasks fetched successfully", tasks))
})

const getTaskbyId=asyncHandler(async(req,res)=>{
    const{taskId}=req.params
    const task = await Task.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"assignedTo",
                foreignField:"_id",
                as:"assignedTo",
                pipeline:[
                {
                    _id:1,
                    username:1,
                    fullname:1,
                    avatar:1,
                }]
            }
        },
        {
            $lookup:{
                from:"subtasks",
                localField:"_id",
                foreignField:"task",
                as:"subtasks",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"createdBy",
                            foreignField:"_id",
                            as:"createdBy",
                            pipeline:[
                                {
                                    $project:{
                                        _id:1,
                                        username:1,
                                        fullname:1,
                                        avatar:1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            createdBy:{$arrayElemAt:["$createdBy",0]}
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                assignedTo:{$arrayElemAt:["$assignedTo",0]}
            }
        }
    ])

    if(!task){
        throw new ApiError(404,"Task not found")
    }

    res.status(200).json(new ApiResponse(true, "Task fetched successfully", task))
})

const createTask=asyncHandler(async(req,res)=>{
    const {title,description,assignedTo,status}=req.body
    const {projectId}=req.params

   const project = await Project.findById(projectId)
   if(!project){
    throw new ApiError(404,"Project not found")
   }

   const files = req.files || [];
   const attachedFiles = files.map(file => {
    return {
        url: `${process.env.SERVER_URL}/images/${file.originalname}`,
        mimetype: file.mimetype,
    };
});

    const task = await Task.create({
        title,
        description,
        project:new mongoose.Types.ObjectId(projectId),
        assignedTo : assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined,
        assignedBy:new mongoose.Types.ObjectId(req.user._id),
        status,
        attachedFiles
    })
    res.status(201).json(new ApiResponse(true, "Task created successfully", task))
})

const UpdateTask=asyncHandler(async(req,res)=>{})

const deleteTask=asyncHandler(async(req,res)=>{})

const createSubtask=asyncHandler(async(req,res)=>{})

const updateSubtask=asyncHandler(async(req,res)=>{})

const deleteSubtask=asyncHandler(async(req,res)=>{})

export {getTasks,
    getTaskbyId,
    createTask,
    UpdateTask,
    deleteTask,
    createSubtask,
    updateSubtask,
    deleteSubtask}