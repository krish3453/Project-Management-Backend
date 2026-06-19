import {ApiResponse} from "../utils/api-Response.js";

import { asyncHandler } from "../utils/asynchandlers.js";

const healthcheck = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, {message: "server is running"}));
});

// function healthcheck(req, res) {
//     try {
//         res.status(200).json(
//             new ApiResponse(200,{message:"server is running"}))
        
//     } catch (error) {
         
//     }
// }

export {healthcheck};