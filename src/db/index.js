import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const uri = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);

    console.log(`✅ MongoDB connected successfully !! DB HOST ${uri.connection.host}`);
    }
  catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDb;
