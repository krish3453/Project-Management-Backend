import dotenv from "dotenv" 
import app from "./app.js"
import connectdb from "./db/mongodb.js";

dotenv.config({
  override: true
});

const port=process.env.PORT

connectdb().then(()=>{
  app.listen(port,()=>{
  console.log("server has started at port : ", port)
})
})





