import express, { urlencoded } from "express"
import cors from "cors"

import authrouter from "./routes/auth.route.js"
import healthcheckrouter from "./routes/healthcheck.route.js"
import cookieParser from "cookie-parser"
import projectrouter from "./routes/project.route.js"

const app=express();
//basic configurations
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(cookieParser())


//cors configuration
app.use(cors({
    origin : process.env.CORS_ORIGIN?.split(",")|| "http://localhost:5173",
    credentials:true,
    methods:["GET","POST","PUT","PATCH","DELETE"],
    allowedHeaders:["Authorization","Content-Type"]
}));

//import the rotes;
app.use("/api/v1/healthcheck",healthcheckrouter);
app.use("/api/v1/auth",authrouter);
app.use("/api/v1/project",projectrouter);

app.get('/',(req,res)=>{
  res.send("hello, welcome")
  return res.status(200);
})

export default app;