import { User } from "../models/user.model.js";
import { Project } from "../models/PROJECT.MODEL.js";
import { ProjectMem } from "../models/projectmem.model.js";

import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asynchandlers.js";
import {ApiError} from "../utils/apierror.js";
import mongoose from "mongoose";


const getproject=asyncHandler(async(req,res)=>{
    const project = await ProjectMem.aggregate([
        {
            $match :{
                user: new mongoose.Types.ObjectId(req.user._id),
            },

        },
        {
            $lookup :{
                from : "project",
                localField: "project",
                foreignField: "_id",
                as:"project",
                pipeline:[{
                    $lookup:{
                        from:"projectmem",
                        localField:"_id",
                        foreignField:"project",
                        as:"projectmem",
                    }
            },
            {
                $addFields:{
                    members:{$size:"$projectmem"}
                }
            }
        ]
            }
        },
        {
            $unwind:"$project"
        },
        {
            $project:{
                project:{
                _id:1,
                name:1,
                decription:1,
                createdat:1,
                createdby:1,
                members:1,
                role:1
                },
                role:1,
                _id:0
            }
        }   
    ]);

    return res.status(200).json(new ApiResponse(200,project,"Project fetched successfully"))
})


const getprojectbyId=asyncHandler(async(req,res)=>{
    const {projectId}=req.params;

    const project = await Project.findById(projectId);

    if(!project){
        throw new ApiError(404,"Project not found")
    }

    return res.status(200).json(new ApiResponse(200,project,"Project fetched successfully"))
})


const createProject=asyncHandler(async(req,res)=>{
    const{name,decription}=req.body;

    const project = await Project.create({
        name,
        decription,
        createdby:new mongoose.Types.ObjectId(req.user._id)
    })

    await ProjectMem.create({
        project:new mongoose.Types.ObjectId(project._id),
        userid:new mongoose.Types.ObjectId(req.user._id),
        role:UserRolesEnum.ADMIN
    }) 

    return res.status(201).json(new ApiResponse(201,project,"Project created successfully"))
})



const UpdateProject=asyncHandler(async(req,res)=>{
    const {name,decription}=req.body;

    const {projectId}=req.params;

    const project = await Project.findByIdAndUpdate(projectId,{
        name,
        decription
    },{new:true})

    if(!project){
        throw new ApiError(404,"Project not found")
    }

    return res.status(200).json(new ApiResponse(200,project,"Project updated successfully"))
})


const deleteProject=asyncHandler(async(req,res)=>{
    const {projectId}= req.params
    
    const project = await Project.findByIdAndDelete(projectId)

    if(!project){
        throw new ApiError(404,"Project not found")
    }

    return res.status(200).json(new ApiResponse(200,project,"Project deleted successfully"))
})


const addmembertoproject=asyncHandler(async(req,res)=>{
    const {email,role}=req.body;
    const {projectId}=req.params;
    const user = await User.findOne({email:email});

    if(!user){
        throw new ApiError(404,"User not found")
    }

    await ProjectMem.findByIdAndUpdate({
        user:new mongoose.Types.ObjectId(user._id),
        project:new mongoose.Types.ObjectId(projectId)
    },{
        user:new mongoose.Types.ObjectId(user._id),
        project:new mongoose.Types.ObjectId(projectId),
        role:role
    },{upsert:true,new:true})

    return res.status(200).json(new ApiResponse(200,{},"Member added to project successfully"))


})


const getprojectmembers=asyncHandler(async(req,res)=>{
    const {projectId}=req.params;
    const project = await Project.findById(projectId);

    if(!project){
        throw new ApiError(404,"Project not found")
    }
    const projectmembers = await ProjectMem.aggregate([
        {
            $match:{
                project:new mongoose.Types.ObjectId(projectId)
            },
        },
        {
            $lookup:{
                from:"users",
                localField:"user",
                foreignField:"_id",
                as:"user",
                pipeline:[{
                    $project:{
                        _id:1,
                        username:1,
                        fullname:1,
                        avatar:1,
                    }
                }]
            }

        },
        {
            $addFields:{
                user:{$arrayElemAt:["$user",0]}
            }
        },
        {
            $project:{
                project:1,
                user:1,
                role:1,
                createdat:1,
                updatedat:1,
                _id:0
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200,projectmembers,"Project members fetched successfully"))
})


const updatememberinproject=asyncHandler(async(req,res)=>{
    const {role}=req.body;
    const {projectId,userId}=req.params;
    
    if(!AvailableUserRoles.includes(role)){
        throw new ApiError(400,"Invalid role")
    }

    let projectmember = await ProjectMem.findOne({
        project:new mongoose.Types.ObjectId(projectId),
        user:new mongoose.Types.ObjectId(userId)
    })

    if(!projectmember){
        throw new ApiError(404,"Project member not found")
    }

    const updatedprojectmember = await ProjectMem.findByIdAndUpdate(
        projectmember._id,
        { role },
        { new: true }
    )

    return res.status(200).json(new ApiResponse(200,updatedprojectmember,"Project member updated successfully"))
})


const removememberfromproject=asyncHandler(async(req,res)=>{
    const {projectId,userId}=req.params;

    let projectmember = await ProjectMem.findOne({
        project:new mongoose.Types.ObjectId(projectId),
        user:new mongoose.Types.ObjectId(userId)
    })

    if(!projectmember){
        throw new ApiError(404,"Project member not found")
    }

    await ProjectMem.findByIdAndDelete(projectmember._id)

    return res.status(200).json(new ApiResponse(200,null,"Project member removed successfully"))
})



export {getproject,
    getprojectbyId,
    createProject,
    UpdateProject,
    deleteProject,
    addmembertoproject,
    getprojectmembers,
    updatememberinproject,
    removememberfromproject
}