import express from 'express';
import cors from 'cors';
import healthCheck from './routes/healthcheck.routes.js';
import auth from './routes/auth.routes.js';
import CookieParser from 'cookie-parser'

const app = express();

//basic configuration
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true,
    methods : ['GET', 'POST', 'PUT' , 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders : ["Content-Type", "Authorization"]
}));


app.use(express.json());
app.use(express.static('public')) 
app.use(CookieParser())

app.use('/api/v1/healthcheck', healthCheck);
app.use('/api/v1/auth', auth);

export default app;