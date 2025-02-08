import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import contractorRoutes from './routes/contractor.routes.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors(
  {origin: '*'}
));

app.use(helmet());

app.use(cookieParser(process.env.COOKIE_SECRET));
// Routes
app.use('/api/contractors', contractorRoutes);

app.get('/',(req,res)=>{
  res.send("<h1>backend</h1>");
})

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
