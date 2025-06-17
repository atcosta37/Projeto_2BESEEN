const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');

dotenv.config();

const authenticateToken = require('./middlewares/auth');
const Order = require('./models/Order');
const Message = require('./models/Message');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paypal = require('@paypal/checkout-server-sdk');

function environment() {
    return new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    );
}
const paypalClient = new paypal.core.PayPalHttpClient(environment());
const cors = require('cors')

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Conectado ao MongoDB Atlas"))
    .catch(err => console.error("Erro ao conectar ao MongoDB:", err));


app.use(cors({
    origin: 'http://localhost:5173',
})
);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Configuração do destino e nome do ficheiro
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Rotas para páginas HTML


// Rotas de API
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);



app.get('/api/admin/encomendas', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ mensagem: "Acesso restrito ao administrador." });
    }
    try {
        const encomendas = await Order.find().populate('userId', 'nome email');
        res.json(encomendas);
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao buscar as encomendas", erro: err });
    }
});

app.delete('/api/admin/encomendas/:id', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ mensagem: "Apenas o admin pode apagar encomendas." });
    }
    try {
        const { id } = req.params;
        await Order.findByIdAndDelete(id);
        res.status(200).json({ mensagem: "Encomenda apagada com sucesso." });
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao apagar encomenda", erro: err });
    }
});

app.put('/api/admin/encomendas/:id', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ mensagem: "Apenas administradores podem atualizar encomendas." });
    }

    const { id } = req.params;
    const { estado } = req.body;

    if (!['pendente', 'em-processamento', 'concluido', 'enviado'].includes(estado)) {
        return res.status(400).json({ mensagem: "Estado inválido." });
    }

    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { estado },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ mensagem: "Encomenda não encontrada." });
        }

        res.status(200).json({ mensagem: "Estado da encomenda atualizado com sucesso.", encomenda: updatedOrder });
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao atualizar o estado da encomenda.", erro: err });
    }
});

app.post('/api/upload', upload.single('arquivo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum ficheiro enviado.' });
    }
    // Devolve o URL para guardar no frontend
    res.json({ url: '/uploads/' + req.file.filename });
});
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    // Verifica se o ficheiro existe
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Ficheiro não encontrado');
    }

    // Força o download com o nome e tipo corretos
    res.download(filePath, filename, (err) => {
        if (err) {
            res.status(500).send('Erro ao fazer download');
        }
    });
});
app.post('/api/contacto', async (req, res) => {
    const { nome, email, mensagem } = req.body;
    if (!nome || !email || !mensagem) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
    }
    try {
        const novaMensagem = new Message({ nome, email, mensagem });
        await novaMensagem.save();
        res.status(201).json({ mensagem: "Mensagem enviada com sucesso!" });
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao enviar mensagem." });
    }
});

app.get('/api/admin/mensagens', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ mensagem: "Acesso restrito ao administrador." });
    }
    try {
        const mensagens = await Message.find().sort({ data: -1 });
        res.json(mensagens);
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao buscar mensagens." });
    }
});


// Criar ordem PayPal
app.post('/api/paypal/create-order', async (req, res) => {
    const { carrinho } = req.body;

    if (!carrinho || !Array.isArray(carrinho) || !carrinho.length) {
        return res.status(400).json({ error: "Carrinho vazio ou inválido" });
    }
    const total = carrinho.reduce((acc, item) => acc + Number(item.precoEstimado || 0), 0);

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [{
            amount: {
                currency_code: "EUR",
                value: total.toFixed(2)
            }
        }]
    });

    try {
        const order = await paypalClient.execute(request);
        res.json({ id: order.result.id });
    } catch (err) {
        console.error("Erro PayPal:", err);
        res.status(500).json({ error: err.message });
    }
});

// Capturar ordem PayPal
app.post('/api/paypal/capture-order', async (req, res) => {
    const { orderID, carrinho, morada, telefone, token } = req.body;
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    console.log("Capturando ordem PayPal:", orderID);
    try {
        const capture = await paypalClient.execute(request);
        // Aqui podes criar a encomenda na tua base de dados!
        // Exemplo:
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const nomeCliente = decoded.nome || "";    // ou decoded.name, depende do teu payload
        const emailCliente = decoded.email || "";
        for (const item of carrinho) {
            await Order.create({
                userId,
                // Comuns
                tamanho: item.tamanho,
                formato: item.formato,
                paginas: item.paginas,
                capa: item.capa,
                encadernacao: item.encadernacao,
                papel: item.papel,
                quantidade: item.quantidade,
                arquivo: item.arquivo,
                precoEstimado: item.precoEstimado,
                tipoServico: item.tipoServico || item.produto,
                estado: 'pendente',

                // Stand
                baseLargura: item.baseLargura,
                baseProfundidade: item.baseProfundidade,
                cadeiras: item.cadeiras,
                mesas: item.mesas,
                paredes: item.paredes,
                imagem: item.imagem,

                // Cliente
                nomeCliente: nomeCliente, // se vier do frontend
                emailCliente: emailCliente, // se vier do frontend
                morada: morada,
                telefoneCliente: telefone
            });
        }
        res.json({ status: capture.result.status });
    } catch (err) {
        console.error("Erro ao capturar ordem PayPal:", err);
        res.status(500).json({ error: err.message });
    }
});
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});