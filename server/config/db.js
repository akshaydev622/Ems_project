import mongoose, { mongo } from 'mongoose';

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log("MongoDB connected"));
        await mongoose.connect(process.env.DB_URI);
    }catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }

}

export default connectDB;