import {ApiError} from '../utils/api-error.js';
import {validationResult} from 'express-validator';



export const validate = (req , res , next) =>{
    const errors = validationResult(req);

    if(errors.isEmpty()){
        return next();
    }

    const exactedErrors = []
    errors.array().forEach(err=>exactedErrors.push({
        [err.path] : err.msg
    }));

    throw new ApiError(422 , 'recieved invalid data' , exactedErrors);
}