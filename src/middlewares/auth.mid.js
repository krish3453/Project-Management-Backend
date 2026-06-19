import {User}from "../models/user.model.js";
import {ApiError} from "../utils/apierror.js"
import {asyncHandler} from "../utils/asynchandlers.js"
import jwt from "jsonwebtoken";
import {ProjectMem} from "../models/projectmem.model.js"
import mongoose from "mongoose"


export const verifyjwt = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    console.log("Cookies:", req.cookies);
    console.log("Authorization:", req.header("Authorization"));
    console.log("Token:", token);

    if(!token){
        throw new ApiError(401,"Unauthorized request");
        
    }

    try {
        const decodedtoken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedtoken?._id)
        .select("-password -refreshToken -emailverificationToken -emailverificationExpiry")

        if(!user){
        throw new ApiError(401,"INVALID ACCESS TOKEN");
        }
req.user=user
next()

    } catch (error) {
        throw new ApiError(401,"INVALID ACCESS TOKEN");
    }
})


export const validateProjectPermission = (roles = []) => asyncHandler(async (req, res, next) => {
        const {projectId} = req.params
        if(!projectId){
            throw new ApiError(400,"ProjectId is required")
        }

        const project = await ProjectMem.findOne({
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(req.user._id)
        })
        if(!project){
            throw new ApiError(403,"You are not a member of this project")
        }
        const givenRoles = project?.role

        req.user.role=givenRoles
        if(!roles.includes(givenRoles)){
            throw new ApiError(403,"You are not authorized to perform this action")
        }
        next()
    }
)
