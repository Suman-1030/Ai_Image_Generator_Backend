import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ImgRouter from './Routes/ImgRoute.js'; 
import UserRouter from './Routes/UserRoute.js';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Configure CORS - Added specific origin
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ai-image-generator-frontend-gamma.vercel.app'
  ],
  credentials: true // if using cookies or auth headers
}));


// Increase payload size limit for JSON (50MB - adjust as needed)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/Ai', ImgRouter);
app.use('/User', UserRouter);

// Database connection - Added connection options
mongoose.connect(process.env.Mongodb_Str, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed", error);
    process.exit(1); // Exit process on DB connection failure
  });