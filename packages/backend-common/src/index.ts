import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET||"jowjhfoiejfoe";
export { JWT_SECRET };

