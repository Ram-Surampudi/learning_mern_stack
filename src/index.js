import dotenv from "dotenv";
import app from "./app.js";
import connectDb from "./db/index.js";

dotenv.config({
    path: "./.env",
});

const PORT = process.env.PORT || 3000;

connectDb()
    .then(()=>{
        app.listen(PORT, () => {
            console.log(`listening to the port ${PORT}`);
        });
    })
    .catch((err)=>{
        console.log(err);
        process.exit(1);
    })

