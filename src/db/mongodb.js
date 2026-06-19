import mongoose from "mongoose"


async function connectdb(){
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MONGODB CONNECTED SUCCESSFULLY")
    }catch(err){
        console.log("error connecting the database",err)
        process.exit(1)
    }
}

export default connectdb;
