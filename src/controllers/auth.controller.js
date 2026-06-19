import { User } from "../models/user.model.js";

import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asynchandlers.js";
import {ApiError} from "../utils/apierror.js";
import {emailverimailgencontent,forgotpasswordmailgencontent,sendEmail} from "../utils/mail.js";
import jwt from "jsonwebtoken"
import crypto from "crypto"


async function generateAccessAndRefreshtoken(UserId) {
    try {
        const user=await User.findOne(UserId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating token")
    }
}


async function registerUser(req,res) {
    const {email,username,password,role}=req.body

    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with name or email already exists",[])
    }

    //IF USER NOT EXISTS CREATE ONE
    const user=await User.create({
        email,
        password,
        username,
        isEmailVerified:false
    })
    const {unhashedtoken,hashedtoken,tokenexpiry}=user.generatetemptoken();

    console.log("Verification Token:", unhashedtoken);

    user.emailverificationToken=hashedtoken
    user.emailverificationExpiry=tokenexpiry

    await user.save({validateBeforeSave:false})

    await sendEmail({
        email:user?.email,
        subject:"please verify your email",
        mailgenContent:emailverimailgencontent(user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedtoken}`
        )
    })

    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken -emailverificationToken -emailverificationExpiry"
    )

    if(!createdUser){
        throw new ApiError(500,"something went wrong while creating user")
    }

    return res.status(201).
    json(new ApiResponse(200,{user:createdUser},
        "user registered successfully"
    ))
}


const login =asyncHandler(async(req,res)=>{
    const{email,password,username}=req.body

    if(!username || !email){
        throw new ApiError(400,"USERNAME OR EMAIL IS REQUIRED");
        
    }
    const user=await User.findOne({email});
    if(!user){
        throw new ApiError(400,"USER DOESNT EXIST");
    }

    const ispasswordvalid=await user.isPasswordCorrect(password)
    if(!ispasswordvalid){
        throw new ApiError(400,"INVALID CREDENTIALS");
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshtoken(user._id)

    const loggedinUser= await User.findById(user._id).select(
        "-password -refreshToken -emailverificationToken -emailverificationExpiry"
    )

    const options={
        httpOnly:true,
        secure: true
    }

    return res.status(200).
    cookie("accessToken",accessToken,options).
    cookie("refreshToken",refreshToken,options).
    json(
        new ApiResponse(200,
            {
                user:loggedinUser,
                accessToken,
                refreshToken
            },"USER LOGGED IN SUCCESSFULLY")
    )
})


const logoutUser=asyncHandler(async(req,res)=>{
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:""
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(201)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"USER LOGGED OUT")
    )
})

const getcurrUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,
        req.user,
        "CURRENT USER FETCHED SUCCESSFULLY"
    ))
})


const verifyEmail=asyncHandler(async(req,res)=>{
    const {verificationToken}=req.params

    if(!verificationToken){
        throw new ApiError(400,"EMAIL VERIFICATION TOKEN IS MISSING");
        
    }

    let hashedtoken=crypto.createHash("sha256")
    .update(verificationToken)
    .digest("hex")

    const user=await User.findOne({
        emailverificationToken:hashedtoken,
        emailverificationExpiry:{$gt:Date.now()}
        })
        if(!user){
            throw new ApiError(400," TOKEN IS expired")
        }

        user.emailverificationToken=undefined;
        user.emailverificationExpiry=undefined

        user.isEmailVerified=true
        await user.save({validateBeforeSave:false})

        return res.status(200).json(new ApiResponse(200,
        {isEmailVerified:true},
        "EMAIL IS VERIFIED"
    ))
})


const resendEmailVerification=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(404,"USR DOESNT EXIST");
        
    }
    if(user.isEmailVerified){
        throw new ApiError(409,"EMAIL ALREADY VERIFIED");
        
    }
    const {unhashedtoken,hashedtoken,tokenexpiry}=user.generatetemptoken();

    user.emailverificationToken=hashedtoken
    user.emailverificationExpiry=tokenexpiry

    await user.save({validateBeforeSave:false})

    await sendEmail({
        email:user?.email,
        subject:"please verify your email",
        mailgenContent:emailverimailgencontent(user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedtoken}`
        )
    })
    return res.status(200).json(new ApiResponse(200,
        {},
        "MAIL HAS BEEN SENDED TO YOUR MAILID"))

})


const refreshaccesstoken=asyncHandler(async(req,res)=>{
    const incomingrefresh = req.cookies.refreshToken||req.body.refreshToken

    if(!incomingrefresh){
        throw new ApiError(401,"UNauthorized access");
        
    }

    try {
        const decodedrefreshypken = jwt.verify(incomingrefresh,process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedrefreshypken?._id)

        if(!user){
        throw new ApiError(401,"INVALID REFRESH TOKEN");
    }
    if(incomingrefresh!== user?.refreshToken){
        throw new ApiError(401,"refresh token expired");
    }
    const options={
        httpOnly:true,
        secure:true
    }

    const{accessToken,refreshToken:newRT} = await generateAccessAndRefreshtoken(user._id)
    user.refreshToken= newRT
    await user.save()

    return res.status(200).cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRT,options)
    .json(new ApiResponse(200,{accessToken,refreshToken:newRT},
        "access token refreshed"))


    } catch (error) {
    console.log(error);
    return res.status(400).json({
        message: error.message,
        stack: error.stack
    });
}

})
const forgotPassword=asyncHandler(async(req,res)=>{
    const {email}=req.body

    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(404,"USER NOT FOUND");
    }

    const {unhashedtoken,hashedtoken,tokenexpiry} = user.generatetemptoken()
    user.forgotPasswordToken=hashedtoken
    user.forgotPasswordExpiry=tokenexpiry

    await user.save({validateBeforeSave:false})
    await sendEmail({
        email:user?.email,
        subject:"Password reset req ",
        mailgenContent:forgotpasswordmailgencontent(user.username,
            `${process.env.FORGOT_PASSWORD_RESET_URL}/${unhashedtoken}`
        )
    })

    return res.status(200).json(new ApiResponse(200,
        {},
        "PASSWORD RESET MAIL HAS BEEN SENT"))
})
const resetforgotPassword=asyncHandler(async(req,res)=>{
    const {resetToken}=req.params
    const {newpass}=req.body

    let hashedtoken=crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

    const user =await User.findOne({
        forgotPasswordToken:hashedtoken,
        forgotPasswordExpiry : {$gt:Date.now()}
    })

    if(!user){
        throw new ApiError(489,"Token is invalid");
    }

    user.forgotPasswordExpiry=undefined
    user.forgotPasswordToken=undefined

    user.password=newpass

    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,
        {},
        "PASSWORD RESET success"))

})



const changecurrPassword=asyncHandler(async(req,res)=>{
    const {oldpass,newpass}=req.body

    const user = await User.findById(req.user?._id)

    const ispassValid = await user.isPasswordCorrect(oldpass)
    if(!ispassValid){throw new ApiError(400,"invalid old pass");
    }

    user.password=newpass
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,
        {},
        "PASSWORD changed success"))
})


export {registerUser,login,logoutUser,getcurrUser,
    verifyEmail,resendEmailVerification,
    refreshaccesstoken,resetforgotPassword,
    forgotPassword,changecurrPassword}
