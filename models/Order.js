const mongoose = require('mongoose');

const paredeSchema = new mongoose.Schema({
    material: { type: String, enum: ['cartao', 'mdf', 'tecido'], required: true },
    quantidade: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Comuns
    tamanho: String,
    formato: String,         // Para brochuras
    paginas: Number,         // Para brochuras
    capa: String,            // Para brochuras
    encadernacao: String,    // Para brochuras
    papel: String,
    quantidade: Number,
    arquivo: String,
    arquivoOriginal: String, // Nome original do arquivo enviado
    precoEstimado: Number,   // Para guardar o preço final
    dataPedido: { type: Date, default: Date.now },
    tipoServico: { type: String, enum: ['impressao', 'grande formato', 'flyers', 'cartoes', 'brochura', 'Stand'], required: true },
    estado: { type: String, enum: ['pendente', 'em-processamento', 'concluido', 'enviado'], default: 'pendente' },

    // Campos específicos para Stand
    baseLargura: Number,
    baseProfundidade: Number,
    cadeiras: Number,
    mesas: Number,
    paredes: [paredeSchema],
    imagem: String, // base64 ou URL

    // Dados do cliente
    nomeCliente: String,
    emailCliente: String,
    morada: String,
    telefoneCliente: Number
});

const Order = mongoose.model('Order', orderSchema, 'Orders');
module.exports = Order;