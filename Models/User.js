import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  Username: {
    type: String,
    required: true,
    trim: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Imagestock: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image', // Must match model name
  }],
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
