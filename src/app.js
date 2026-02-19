import express from 'express';
import cors from 'cors';


const app = express();


//basic configuration
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true,
    methods : ['GET', 'POST', 'PUT' , 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders : ["Content-Type", "Authorization"]
}));


//basic configuration
app.use(express.json());
app.use(express.static('public')) 