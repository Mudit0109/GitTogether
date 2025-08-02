const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastname: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Email is invalid']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  age: {
    type: Number,
    min: [18, 'Age must be at least 18'],
    max: [150, 'Age seems too high']
  },
  gender: {
    type: String,
    lowercase: true,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  photoUrl: {
    type: String,
    default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeE8Sti7nupldscJu8jVr8ecoimhS5tkG-3Q&s",
    match: [/^https?:\/\/.+/, 'Invalid photo URL']
  },
  skills: {
    type: [String],
    default: [],
    validate: [arr => Array.isArray(arr), 'Skills must be an array']
  },
  about: {
    type: String,
    trim: true,
    maxlength: [500, 'About section too long'],
    default: "This is a user about section."
  },
  
},{timestamps: true,}
);

userSchema.methods.getJWT =async function() {
  return await jwt.sign({ _id: this._id }, 'GITTOGETHER2004', { expiresIn: '1d' });
};
userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
