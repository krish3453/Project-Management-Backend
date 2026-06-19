import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";
import crypto from "crypto"

const userschema=new mongoose.Schema({
    avatar:{
        type:{
            url:String,
            localPath:String,
        },
        default:{
            url:'https://placehold.co/200x200',
            localPath:"",
        }
    },

    username :{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },

    email :{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    fullName:{
        type: String,
        trim: true,
    },

    password :{
        type: String,
        required:[true,"Password is required"],
    },

    isEmailVerified:{
        type: Boolean,
        default: false,
    },

    refreshToken:{
        type: String,
    },

    forgotPasswordToken:{
        type: String,
    },

    forgotPasswordExpiry:{
        type: Date,
    },

    emailverificationToken:{
        type: String,
    },

    emailverificationExpiry:{
        type: Date,
    },
},{
    timestamps: true,
})


//HASHING
userschema.pre("save",async function() { //schema hooks(prehook)
    if(!this.isModified("password"))return;//if we are not changing the password this runs
    this.password=await bcrypt.hash(this.password,10)//is password field get cahnged this runs
    
})

userschema.methods.isPasswordCorrect=async function(password){ //schema methods
    return await bcrypt.compare(password,this.password);
}

//GENERATE ACCESS TOKEN
userschema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
)
}

//GENERATE REFRESHTOKEN
userschema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
)
}

//TEMPORARYTOKEN
userschema.methods.generatetemptoken=function(){
    const unhashedtoken=crypto.randomBytes(20).toString("hex")
    const hashedtoken=crypto.createHash("sha256")
    .update(unhashedtoken).digest("hex")
    
    const tokenexpiry=Date.now()+(20*60*1000)
    return{unhashedtoken,hashedtoken,tokenexpiry}
}
export const User = mongoose.model("User",userschema)

