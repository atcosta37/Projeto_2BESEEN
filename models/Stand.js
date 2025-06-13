const mongoose = require('mongoose');

const standSchema = new mongoose.Schema({
    nomeCliente: { type: String, required: true },
    emailCliente: { type: String, required: true },
    baseLargura: { type: Number, required: true },
    baseProfundidade: { type: Number, required: true },
    cadeiras: { type: Number, default: 0 },
    mesas: { type: Number, default: 0 },
    paredes: [{
        material: { type: String, enum: ['cartao', 'mdf', 'tecido'], required: true },
        quantidade: { type: Number, required: true }
    }],
    precoTotal: { type: Number, required: true },
    imagem: { type: String }, // base64 ou URL
    data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stand', standSchema, 'Stands');