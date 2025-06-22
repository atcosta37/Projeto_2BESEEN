// ===== IMPORTAÇÕES E CONFIGURAÇÕES INICIAIS =====
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const nodemailer = require('nodemailer');
// Carrega variáveis de ambiente do .env
dotenv.config();

// ===== IMPORTAÇÃO DE MIDDLEWARES E MODELOS =====
const authenticateToken = require('./middlewares/auth');
const Order = require('./models/Order');
const Message = require('./models/Message');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

// ===== PAYPAL SDK CONFIG =====
const paypal = require('@paypal/checkout-server-sdk');
function environment() {
    return new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    );
}
const paypalClient = new paypal.core.PayPalHttpClient(environment());

// ===== CONFIGURAÇÃO DO SERVIDOR =====
const port = process.env.PORT || 3000;

// ===== CONEXÃO À BASE DE DADOS =====
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Conectado ao MongoDB Atlas"))
    .catch(err => console.error("Erro ao conectar ao MongoDB:", err));

// ===== MIDDLEWARES GLOBAIS =====
app.use(cors({
    origin: 'http://localhost:5173',
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== CONFIGURAÇÃO DO MULTER PARA UPLOADS =====
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

// ===== ROTAS DE API PRINCIPAIS =====
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// ===== ROTAS DE ADMINISTRAÇÃO DE ENCOMENDAS =====

// Listar todas as encomendas (apenas admin)
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

// Apagar encomenda (apenas admin)
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

// Atualizar estado da encomenda (apenas admin)
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
        // Atualiza o estado e obtém os dados do cliente
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { estado },
            { new: true }
        ).populate('userId', 'nome email');

        if (!updatedOrder) {
            return res.status(404).json({ mensagem: "Encomenda não encontrada." });
        }

        // Obter email e nome do cliente
        const clienteEmail = updatedOrder.emailCliente || updatedOrder.userId?.email;
        const clienteNome = updatedOrder.nomeCliente || updatedOrder.userId?.nome || "Cliente";

        // Enviar email se houver email do cliente
        if (clienteEmail) {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            await transporter.sendMail({
                from: `"2BESEEN" <${process.env.EMAIL_USER}>`,
                to: clienteEmail,
                subject: "Atualização do estado da sua encomenda",
                html: `
                    <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
                        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px #ff660022; padding: 32px;">
                            <h2 style="color: #ff6600; margin-bottom: 18px;">Estado da Encomenda Atualizado</h2>
                            <p>Olá <b>${clienteNome}</b>,</p>
                            <p>O estado da sua encomenda foi alterado para:</p>
                            <div style="margin: 18px 0;">
                                <span style="display:inline-block; background:#ff6600; color:#fff; padding:10px 22px; border-radius:6px; font-weight:bold; font-size:1.1em;">
                                    ${estado.replace('-', ' ')}
                                </span>
                            </div>
                            <p>Se tiver dúvidas, contacte-nos.<br>Obrigado por confiar na <b>2BESEEN</b>!</p>
                            <hr style="margin:24px 0;">
                            <p style="font-size:0.95em; color:#888;">Esta mensagem é automática. Não responda a este email.</p>
                            <p style="color:#ff6600; font-weight:bold; margin-top:24px;">2BESEEN</p>
                        </div>
                    </div>
                `
            });
        }

        res.status(200).json({ mensagem: "Estado da encomenda atualizado com sucesso.", encomenda: updatedOrder });
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao atualizar o estado da encomenda.", erro: err });
    }
});
// ===== UPLOAD DE FICHEIROS =====
app.post('/api/upload', upload.single('arquivo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum ficheiro enviado.' });
    }
    // Devolve o URL para guardar no frontend
    res.json({ url: '/uploads/' + req.file.filename });
});

// ===== DOWNLOAD DE FICHEIROS =====
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

// ===== FORMULÁRIO DE CONTACTO =====
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

// ===== LISTAR MENSAGENS DE CONTACTO (apenas admin) =====
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

// ===== PAYPAL: CRIAR ORDEM =====
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

// ===== PAYPAL: CAPTURAR ORDEM E GUARDAR ENCOMENDA =====
app.post('/api/paypal/capture-order', async (req, res) => {
    const { orderID, carrinho, morada, telefone, token } = req.body;
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    try {
        const capture = await paypalClient.execute(request);
        // Cria a encomenda na base de dados após pagamento
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const nomeCliente = decoded.nome || "";
        const emailCliente = decoded.email || "";
        for (const item of carrinho) {
            await Order.create({
                userId,
                // Dados comuns
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

                // Dados específicos de Stand
                baseLargura: item.baseLargura,
                baseProfundidade: item.baseProfundidade,
                cadeiras: item.cadeiras,
                mesas: item.mesas,
                paredes: item.paredes,
                imagem: item.imagem,

                // Dados do cliente
                nomeCliente: nomeCliente,
                emailCliente: emailCliente,
                morada: morada,
                telefoneCliente: telefone
            });
        }

    if (emailCliente) {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            await transporter.sendMail({
                from: `"2BESEEN" <${process.env.EMAIL_USER}>`,
                to: emailCliente,
                subject: "Confirmação da sua encomenda",
                html: `
                    <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
                        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px #ff660022; padding: 32px;">
                            <h2 style="color: #ff6600; margin-bottom: 18px;">Encomenda Recebida</h2>
                            <p>Olá <b>${nomeCliente}</b>,</p>
                            <p>A sua encomenda foi registada com sucesso e está agora em processamento.</p>
                            <p><b>Resumo:</b></p>
                            <ul style="color:#232526; font-size:1em;">
                                ${carrinho.map(item => `
                                    <li>
                                        <b>Produto:</b> ${item.tipoServico || item.produto || "Serviço"}<br>
                                        <b>Quantidade:</b> ${item.quantidade || 1}<br>
                                        <b>Preço estimado:</b> €${(item.precoEstimado || 0).toFixed(2)}
                                    </li>
                                `).join('<br>')}
                            </ul>
                            <p>Morada de entrega: <b>${morada}</b></p>
                            <p>Telefone: <b>${telefone}</b></p>
                            <hr style="margin:24px 0;">
                            <p style="font-size:0.95em; color:#888;">Se tiver dúvidas, contacte-nos.<br>Obrigado por confiar na <b>2BESEEN</b>!</p>
                            <p style="color:#ff6600; font-weight:bold; margin-top:24px;">2BESEEN</p>
                        </div>
                    </div>
                `
            });
        }
        res.json({ status: capture.result.status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== INICIAR SERVIDOR =====
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});