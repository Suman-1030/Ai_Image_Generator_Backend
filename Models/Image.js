import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    data: Buffer,
    contentType: String,
  }
}, { timestamps: true });

export default mongoose.model('Image', ImageSchema);
