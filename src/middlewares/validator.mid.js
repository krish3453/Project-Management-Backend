import { validationResult } from "express-validator";
import { ApiError } from "../utils/apierror.js";


const validate=(req,res,next)=>{
    const errors=validationResult(req)
    if(errors.isEmpty()){
        return next();
    }

    const extractederror=[]
    errors.array().map((err)=>extractederror.push(
        {
            [err.path]:err.msg
        }
    ))
    throw new ApiError(422,"recieved data is not valid",extractederror);
    
}

export {validate}