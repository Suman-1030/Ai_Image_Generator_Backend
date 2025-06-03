import express from 'express';
import ImgController from '../Controllers/ImgController.js';

const router = express.Router();

// 🔹 Generate image from prompt
router.post('/gen', ImgController.Generate);

// 🔹 Save generated image and link to user
router.post('/addimg', ImgController.addImg);

// Optional future use:
// router.get('/getimgs', imgcollection); 

export default router;
