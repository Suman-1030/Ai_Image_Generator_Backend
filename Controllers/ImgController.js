import fetch from 'node-fetch';
import dotenv from 'dotenv';
import Image from '../Models/Image.js';
import User from '../Models/User.js';
import FormData from 'form-data';
import axios from "axios";

dotenv.config();

const API_KEY = process.env.API_KEY;


const Generate = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // Create multipart form
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("cfg_scale", 7);
    form.append("height", 1024);
    form.append("width", 1024);
    form.append("samples", 1);
    form.append("steps", 30);
    form.append("output_format", "jpeg");
    
    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/ultra",
      form,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
          ...form.getHeaders(), // important for Node.js
        },
      }
    );
    console.log("Raw Stability API Response:", response.data);

    if (!response.data?.image) {
      throw new Error("No image data received");
    }
    
    res.status(200).json({ image: response.data.image });

    

  } catch (err) {
    console.error("Stability API Error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};



const addImg = async (req, res) => {
  try {
    const { image, userId, prompt } = req.body;

    if (!image || !userId || !prompt) {
      return res.status(400).json({ msg: "Missing image, prompt, or userId" });
    }

    const user = await User.findById(userId).populate('Imagestock');
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');

    const newImage = new Image({
      image: {
        data: imgBuffer,
        contentType: 'image/png',
      },
      prompt,
    });

    const savedImage = await newImage.save();
    user.Imagestock.push(savedImage);
    await user.save();

    res.status(200).json({
      msg: "Image uploaded and linked to user",
      data: savedImage,
      userUpdate: user
    });

  } catch (error) {
    res.status(500).json({
      msg: "Internal server error",
      error: error.message
    });
  }
};

export default { Generate, addImg };
