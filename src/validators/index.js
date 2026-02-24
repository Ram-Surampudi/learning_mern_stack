import {body} from 'express-validator';

const userRegisterValidatior = () =>{
    return [
        body('email')
            .trim()
            .notEmpty()
            .withMessage("email Should not be empty")
            .isEmail()
            .withMessage("invalid email"),
        body('username')
            .trim()
            .notEmpty()
            .withMessage('username is required')
            .toLowerCase()
            .withMessage('username must be in lower case')
            .isLength({min:3})
            .withMessage("username should have min 3 characters"),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('password is required')
            .isLength({min : 8})
            .withMessage('password should have min 8 characters'),
        body('fullName')
            .optional()
            .trim()
    ]
}

const userLoginValidatior = () =>{
    return [
        body('email')
            .optional()
            .trim()
            .notEmpty()
            .withMessage("email Should not be empty")
            .isEmail()
            .withMessage("invalid email"),
        body('username')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('username is required')
            .toLowerCase()
            .withMessage('username must be in lower case')
            .isLength({min:3})
            .withMessage("username should have min 3 characters"),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('password is required')
            .isLength({min : 8})
            .withMessage('password should have min 8 characters')
    ]
}

const userResetForgotPasswordValidator = () =>{
    return [
        body('newPassword')
            .trim()
            .notEmpty()
            .withMessage("new Password Should not be empty")
    ]
}

const userForgotPasswordValidator = () =>{
    return [
        body('email')
            .trim()
            .notEmpty()
            .withMessage("email Should not be empty")
            .isEmail()
            .withMessage("invalid email")
    ]
}

const changeCurrentPasswordValidator = () =>{
    return [
        body('oldPassword')
            .trim()
            .notEmpty()
            .withMessage("old Password Should not be empty"),
        body('newPassword')
            .trim()
            .notEmpty()
            .withMessage("new Password Should not be empty")
    ]
}

export { 
    userRegisterValidatior , 
    userLoginValidatior , 
    changeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator
};