const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    nome: String,
    email: String,
    mensagem: String,
    data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema, 'Messages');