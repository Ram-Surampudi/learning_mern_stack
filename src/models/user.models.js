import mongoose , {Schema} from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import crypto from 'crypto'

const userSchema = new Schema(
    {
        avatar : {
            type :{
                url : String,
                localPath : String
            },
            default :{
                url : 'https://placehold.co/2Ø0x200',
                localPath : ''
            }
        },
        username :{
            type : String ,
            required : true,
            unique:true,
            lowercase :true,
            trim : true,
            index : true
        },
        email :{
            type : String,
            unique : true,
            trim : true
        },
        fullName : {
            type : String,
            trim : true
        },
        password :{
            type : String,
            require : [true , "password is required"] //with custom error 
        },
        isEmailVerified :{
            type : Boolean,
            default : false
        },
        refreshToken : {
            type : String,
        },
        forgotPasswordToken : {
            type :String
        },
        forgotPasswordExpiry : {
            type : Date
        },
        emailVerificationToken : {
            type : String
        },
        emailVerificationExpiry : {
            type : Date
        }
    },
    {
        timestamps : true,
    }
)

userSchema.pre('save', async function(next){
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    // next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password);
}

userSchema.methods.generateAcessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email : this.email,
            username: this.username
        },
        process.env.ACESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACESS_TOKEN_EXPRIY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email : this.email,
            username: this.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPRIY
        }
    )
}

userSchema.methods.generateTemporaryToken = function(){
    const unhashedtoken = crypto.randomBytes(20).toString('hex');
    const hashedtoken = crypto.createHash('sha256')
                            .update(unhashedtoken)
                            .digest('hex')
    const tokenExpriy = Date.now() + (20*60*1000) //20min

    return {unhashedtoken , hashedtoken , tokenExpriy};
}

export const User = mongoose.model("User", userSchema)