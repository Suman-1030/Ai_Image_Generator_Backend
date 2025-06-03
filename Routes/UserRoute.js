import express from 'express';
import UserController from '../Controllers/UserController.js';

const router = express.Router();

// 🔹 Register a new user
router.post('/reg', UserController.Register);

// 🔹 Login a user
router.post('/login', UserController.Login);

// 🔹 Get user details by ID
router.get('/userdetails/:id', UserController.UserDetails);

// 🔹 Get image collection for a user
router.post('/getcollection', UserController.collection);

// 🔹 Get raw image file by image ID
router.get('/getimage/:id', UserController.getImage);

export default router;
