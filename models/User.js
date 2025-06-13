const mongoose = require('mongoose'); 
const userSchema = new mongoose.Schema({
    nome: String,
    email: { type: String, unique: true },
    password: String,
    isAdmin: { type: Boolean, default: false },
    resetToken: String,
    resetTokenExpiration: Date
});
const User = mongoose.model('User', userSchema, 'Users');
module.exports = User;
  