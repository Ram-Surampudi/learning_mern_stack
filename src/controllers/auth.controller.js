
import {User} from '../models/user.models.js';
import { ApiError } from '../utils/api-error.js'
import {sendMail , emailVerificationMailgenContent, forgetPasswordMailgenContent} from '../utils/mail.js';
import {asyncHandeler} from '../utils/async-handler.js';
import { ApiResponse } from '../utils/api-response.js';
import jwt from 'jsonwebtoken';
import { CookieOptions } from '../utils/constants.js';
import crypto from 'crypto';


const register = asyncHandeler(async (req,res) => {

    const {email , username , fullName , password, role} = req.body;

    const exitedUser = await User.findOne({ $or : [{username}, {email}]});

    if(exitedUser) throw new ApiError(409, `user with ${ exitedUser.username === username ? "username" : "email" } already exits`);

    const user = await User.create({
        username ,
        email ,
        fullName ,
        password ,
        isEmailVerified : false
    });

     const acessToken = user.generateAcessToken();
     const refreshToken = user.generateRefreshToken();
     const {unhashedtoken , hashedtoken , tokenExpriy} = user.generateTemporaryToken();
     
    user.refreshToken = refreshToken;
    user.emailVerificationExpiry = tokenExpriy;
    user.emailVerificationToken = hashedtoken;

    await user.save({validateBeforeSave: false})

    const url = `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${unhashedtoken}`;

    await sendMail({
        email : user.email,
        subject : 'please verify you email',
        mailgenContent : emailVerificationMailgenContent(user.username, url)
    });

    const createdUser = await User.findById(user._id).select(
  "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
);

    res.status(200).json(
        new ApiResponse(
            200 ,
            {user : createdUser , acessToken} ,
            "User created"
        ));
});


const loginUser = asyncHandeler(async (req , res )=>{

    const {email , username , password} = req.body;

    if(!username && !email) throw new ApiError(400 , 'email or username is required');

    const user = await User.findOne({ $or : [{username}, {email}]});

    if(!user) throw new ApiError(400, 'user not found');

    const isPass = await user.isPasswordCorrect(password);

    if(!isPass) throw new ApiError(400 , 'incorrect password');

    const acessToken = user.generateAcessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;

    await user.save({validateBeforeSave: false});

    const loggedInUser = await User.findById(user._id).select(
  "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    return res.status(200)
              .cookie("acessToken", acessToken, CookieOptions)
              .cookie("refreshToken", refreshToken, CookieOptions)
              .json(new ApiResponse(
                200,
                {
                    user:loggedInUser,
                    acessToken,
                    refreshToken
                },
                "user logged in sucessfully"
              ))

});

const logout = asyncHandeler(async (req, res )=>{

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : ""
            }
        },
        {
            new : true
        }
    );

    return res.status(200)
            .clearCookie("acessToken", CookieOptions)
            .clearCookie("refreshToken", CookieOptions)
            .json(
                new ApiResponse(200 , {}, "user logged out")
            );

});

const getCurrentUser = asyncHandeler(async (req, res)=>{
    return res.status(200, new ApiResponse(
        200,
        req.user,
        "user fecthed succesfully"
    ));
});

const verifyEmail = asyncHandeler(async (req, res)=>{
    const {verificationToken} = req.params;

    if(!verificationToken) throw new ApiError(400 , "email verification token is required");

    let hashedtoken = crypto.createHash('sha256')
                            .update(verificationToken)
                            .digest("hex");

    const user = await User.findOne({
        emailVerificationToken:hashedtoken,
        emailVerificationExpiry : {$gt : Date.now()}
    });

    if(!user) throw new ApiError(400 , "Token is invalid or expired");

    user.isEmailVerified = true;
    user.emailVerificationExpiry = undefined;
    user.emailVerificationToken = undefined;

    await user.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(
        200,
        {
            emailVerified: true
        },
        "email verified sucessfully"
    ));
});

const resendEmail = asyncHandeler(async (req, res)=>{

    const user = User.findById(req.user._id);

    if(!user) throw new ApiError("user does not exits");

    if(user.isEmailVerified) throw new ApiError("user already verified");

    const {unhashedtoken , hashedtoken , tokenExpriy} = user.generateTemporaryToken();
     
    user.emailVerificationExpiry = tokenExpriy;
    user.emailVerificationToken = hashedtoken;

    await user.save({validateBeforeSave: false})

    const url = `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${unhashedtoken}`;

    await sendMail({
        email : user.email,
        subject : 'please verify you email',
        mailgenContent : emailVerificationMailgenContent(user.username, url)
    });

    return res.status(200).json(new ApiResponse(
        200 ,
        {},
        "mail has been sent"
    ));

});

const refreshAcessToken = asyncHandeler( async (req, res)=>{

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) throw new ApiError(400 , "Unauthorized access");

    try {
        const decodedData = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedData?._id);

        if(!user) throw new ApiError(400 , 'invalid refresh token');

        if(user.refreshToken !== incomingRefreshToken) throw new ApiError(400 , 'refresh token expired');

        const acessToken = user.generateAcessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;

        await user.save({validateBeforeSave: false});
        
        return res.status(200)
                  .cookie("acessToken", acessToken , CookieOptions)
                  .cookie("refreshToken", refreshToken , CookieOptions)
                  .json(new ApiResponse(
                    200 ,
                    {acessToken , refreshToken},
                    "Acess token refreshed"
                  ));

    } catch (error) {
        throw new ApiError(400 , 'invalid refresh token');
    }
});


const forgotPasswordRequest = asyncHandeler( async (req, res)=>{

    const {email} = req.body;

    const user = await User.findOne({email});
    
    if(!user) throw new ApiError(404 , 'user not found');

    const {unhashedtoken , hashedtoken , tokenExpriy} = user.generateTemporaryToken();

    user.forgotPasswordExpiry = tokenExpriy;
    user.forgotPasswordToken = hashedtoken;

    await user.save({validateBeforeSave: false});

    const url = `${process.env.FORGOT_PASSWORD_URL}/${unhashedtoken}`;

    await sendMail({
        email : user.email,
        subject : 'Password reset request',
        mailgenContent : forgetPasswordMailgenContent(user.username, url)
    });

    return res.status(200).json(new ApiResponse(
        200 ,
        {},
        "mail has been sent"
    ));
});

const resetForgotPassword = asyncHandeler( async (req, res)=>{

    const {resetToken} = req.params;

    const {newPassword} = req.body; 

    let hashedtoken = crypto.createHash('sha256')
                            .update(resetToken)
                            .digest("hex");

    const user = await User.findOne({
        forgotPasswordToken:hashedtoken,
        forgotPasswordExpiry : {$gt : Date.now()}
    });

    if(!user) throw new ApiError(489 , "Token is invalid or expired");

    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    user.password = newPassword;

    await user.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(
        200 ,
        {},
        "password resetted sucessfully"
    ));
});

const changeCurrentPassword = asyncHandeler( async (req, res)=>{

    const {oldPassword , newPassword} = req.body;

    const user = await User.findById(req.user._id);

    const isPassVaild = await user.isPasswordCorrect(oldPassword);

    if(!isPassVaild) throw new ApiError(400 , 'old password is incorrect');

    user.password = newPassword;

    await user.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(
        200 ,
        {},
        "password has been changed"
    ));

});

export {
    register ,
    loginUser , 
    logout , 
    getCurrentUser, 
    verifyEmail , 
    resendEmail , 
    refreshAcessToken , 
    forgotPasswordRequest,
    resetForgotPassword,
    changeCurrentPassword
};