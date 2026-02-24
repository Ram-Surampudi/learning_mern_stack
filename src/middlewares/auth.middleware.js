import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandeler } from "../utils/async-handler.js";
import jwt from 'jsonwebtoken';

export const verifyJWT = asyncHandeler( async (req , res , next)=>{
    
    const token = req.cookies?.acessToken || req.header("Authorization")?.replace("Bearer ", "");

    if(!token) throw new ApiError(401, "Unauthorized request");

    try {

        const decodeData = jwt.verify(token , process.env.ACESS_TOKEN_SECRET);

        const user = await User.findById(decodeData?._id).select(
                            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry");

        if(!user) throw new ApiError(401 , "Invalid acess token");

        req.user = user;

        next();

    } catch (error) {
        console.log(error);
        throw new ApiError(401 , "acess token expired");
    }

});