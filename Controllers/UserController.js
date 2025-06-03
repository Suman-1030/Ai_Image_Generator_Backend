import User from '../Models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Image from '../Models/Image.js';

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// Register a new user
const Register = async (req, res) => {
  const { Username, Email, Password } = req.body;

  try {
    const existingUser = await User.findOne({ Email: Email });  // Corrected the variable name to match 'Email'

    if (existingUser) {
      return res.status(400).json({ msg: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    const newUser = new User({
      Username: Username,
      Email: Email,
      Password: hashedPassword,
    });

    await newUser.save();
    res.status(200).json({ msg: 'User registered successfully', userId: newUser._id });
  } catch (error) {
    console.error("Registration failed:", error.message);
    res.status(500).json({ msg: 'Registration failed', error: error.message });
  }
};
// Login user
const Login = async (req, res) => {
  const { Email, Password } = req.body;

  try {
    const loginUser = await User.findOne({ Email: Email });
    if (!loginUser) {
      return res.status(404).json({ msg: 'You are not registered' });
    }

    const isPasswordCorrect = await bcrypt.compare(Password, loginUser.Password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ msg: 'Incorrect password' });
    }

    const token = jwt.sign({ userId: loginUser._id }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ msg: 'Login successful', token, userId: loginUser._id,userName:loginUser.Username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Login failed' });
  }
};

// Get single user details
const UserDetails = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'User details fetch failed' });
  }
};

// Get all user images
const collection = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId).populate('Imagestock').lean();

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const retrievedData = user.Imagestock.map((stock) => ({
      _id: stock._id,
      prompt: stock.prompt,
      contentType: stock.image?.contentType,
    }));

    return res.status(200).json({
      msg: 'Data retrieved successfully',
      retrievedData,
    });
  } catch (error) {
    res.status(500).json({
      msg: 'Data retrieval failed',
      error: error.message,
    });
  }
};

// Get specific image by ID
const getImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ msg: 'Image not found' });
    }

    res.set('Content-Type', image.image.contentType);
    res.send(image.image.data);
  } catch (err) {
    res.status(500).json({ msg: 'Image fetch error', error: err.message });
  }
};

export default { Register, Login, UserDetails, collection, getImage };
