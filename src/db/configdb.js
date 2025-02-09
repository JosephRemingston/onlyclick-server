import mongoose from 'mongoose';
import  dotenv  from 'dotenv';
dotenv.config();

const connectDB = async () => {
    try{
        console.log(process.env.DB_URL);
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`\n MongoDB connected !! DB HOSTED AT ${connectionInstance.connection.host} \n`);
    }
    catch(err){
        console.error("MongoDB connection error",err);
        process.exit(1)
    }
}

export {connectDB};