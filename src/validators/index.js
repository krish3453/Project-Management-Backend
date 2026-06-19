import { body } from "express-validator";
import {AvailiableUserRoles} from "../utils/constant.js"


const userRegisterValidator=()=>{
    return [
        body("email").trim()
        .notEmpty()
        .withMessage("EMAIL IS REQUIRED")
        .isEmail(),

        body("username").trim()
        .notEmpty()
        .withMessage("USERNAME IS REQUIRED")
        .isLowercase()
        .withMessage("USERNAME MUST BE IN LOWERCASE")
        .isLength({min:3})
        .withMessage("USERNAME MUST BE AT LEAST 3 CHARACTERS"),

        body("password")
        .trim()
        .notEmpty()
        .withMessage("PASSWORD IS REQUIRED"),
        
        body("fullName")
        .optional()
        .trim()

    ]
}

const userLoginValidator=()=>{
    return[
        body("email").optional().isEmail()
        .withMessage("EMAIL IS INVALID"),
        body("password").notEmpty()
        .withMessage("PASSWORD IS REQUIRED")
        
    ]
}


const userChangecurrPass=()=>{
    return[
        body("oldpass").notEmpty()
        .withMessage("Old pass is required"),
        body("newpass").notEmpty()
        .withMessage(" new PASSWORD IS REQUIRED")
        
    ]
}

const userforgotPassvali=()=>{
    return[
        body("email").notEmpty()
        .withMessage("eamil is required")
        .isEmail().withMessage("invalid email"),
        
    ]
}


const userresetforgotPassvali=()=>{
    return[
        body("newpass").notEmpty()
        .withMessage("password is required")
        
        
    ]
}

const addmembertoprojectvali=()=>{
    return[
        body("email").notEmpty()
        .withMessage("email is required")
        .isEmail().withMessage("invalid email"),
        body("role").notEmpty()
        .withMessage("role is required")
        .isIn(AvailiableUserRoles)
        .withMessage(`role must be one of ${AvailiableUserRoles.join(", ")}`)
    ]
}




const createProjectValidator=()=>{
    return[
        body("name").notEmpty()
        .withMessage("Project name is required"),
        body("description").optional()
    ]
}



export {
    userRegisterValidator, userLoginValidator
    ,userChangecurrPass,userforgotPassvali,
    createProjectValidator,userresetforgotPassvali,addmembertoprojectvali
}
    