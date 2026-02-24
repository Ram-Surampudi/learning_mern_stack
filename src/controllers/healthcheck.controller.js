import { ApiResponse } from "../utils/api-response.js";
import { asyncHandeler } from "../utils/async-handler.js";

const healthcheck = asyncHandeler(async (req, res, next) =>{
    res.status(200).json(
        new ApiResponse(200 , {message : "server is runnig"})
    );
})

export {healthcheck};