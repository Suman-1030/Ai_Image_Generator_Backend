import fetch from 'node-fetch';
import dotenv from 'dotenv';
import Image from '../Models/Image.js';
import User from '../Models/User.js';

dotenv.config();

const API_KEY = process.env.API_KEY;

const Generate = async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("⚙️  Incoming Generate request with prompt:", prompt);

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "Missing Stability API Key" });
    }

    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 512,
        width: 512,
        samples: 1,
        steps: 30,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: `Stability API Error: ${errorText}` });
    }

    const responseData = await response.json();
    if (responseData.artifacts?.length > 0) {
      const imageBase64 = responseData.artifacts[0].base64;
      return res.json({ image: imageBase64 });
    } else {
      return res.status(500).json({ error: 'No image data received from Stability API' });
    }

  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
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
