/*const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const port = 3000;
dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Conectado ao MongoDB Atlas"))
    .catch(err => console.error("Erro ao conectar ao MongoDB:", err));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//ROTAS
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});
app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, 'index.html'));
})
app.get('/login', (req,res)=>{
    res.sendFile(path.join(__dirname, 'login.html')); 
});
app.get('/register', (req,res)=>{
    res.sendFile(path.join(__dirname, 'register.html'));
});
app.get('/servicos',(req,res)=>{
    res.sendFile(path.join(__dirname,'servicos.html'));
});
app.get('/personalizar/impressao',(req,res)=>{
    res.sendFile(path.join(__dirname,'/offset.html'));
});

app.get('/personalizar/offset/flyers',(req,res)=>{
    res.sendFile(path.join(__dirname,'/offset_formatos/flyers.html'));
});
app.get('/personalizar/offset/flyers/tresD',(req,res)=>{
    res.sendFile(path.join(__dirname, '/flyers.html'));
});
app.get('/personalizar/offset/cartoes',(req,res)=>{
    res.sendFile(path.join(__dirname,'/offset_formatos/cartoes.html'));
});
app.get('/personalizar/offset/bruchuras',(req,res)=>{
    res.sendFile(path.join(__dirname,'/offset_formatos/bruchuras.html'));
});
app.get('/personalizar/grande-formato',(req,res)=>{
    res.sendFile(path.join(__dirname,'grande-formato.html'));
});





//GETS
app.get('/api/admin/encomendas', authenticateToken, async (req, res) => {
    // Verifica se é admin (podes ajustar depois com uma flag no User)
    if (req.user.email !== "admin@gmail.com") {
        return res.status(403).json({ mensagem: "Acesso restrito ao administrador." });
    }

    try {
        const encomendas = await Order.find().populate('userId', 'nome email');
        res.json(encomendas);
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao buscar as encomendas", erro: err });
    }
});


//POSTS
app.post('/login',async (req,res)=>{
    const {email} = req.body;
    const user = await User.findOne({ email });
    const validPassaword = await bcrypt.compare(req.body.password, user.password);
    if(!user){
        return res.status(400).json({ mensagem: "Utilizador não encontrado!" });
    } 
    if (!validPassaword) {
        return res.status(400).json({ mensagem: "Password incorreta!" });
    }

    const token = jwt.sign({ userId: user._id, email: user.email, nome: user.nome, isAdmin: user.isAdmin}, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    if (user.isAdmin) {
        return res.status(200).json({redirectTo: "/admin", token: token});
    }
    res.status(200).json({redirectTo: "/", token: token});
});
 
app.post('/register', async (req,res)=>{
    const salt = await bcrypt.genSalt(10);
    const { nome, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;
    if (!nome || !email || !password) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ mensagem: "Já existe um utilizador com este email!" });
    }
 TENTAR ENCRIPTAR
    const saltRounds = 10; // número de rounds de salt (quanto maior, mais seguro, mas mais lento)
    bcrypt.hash(password, saltRounds, async (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ mensagem: "Erro ao gerar hash da senha" });
        }});

    // Cria um novo utilizador
    const newUser = new User({ nome, email, password: hashedPassword });

    // Salva no MongoDB
    try {
        await newUser.save();
        res.status(201).json({redirectTo: "/login" });
       
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao registar o utilizador!", erro: err });
    }
}); 



app.post('/pedido-impressao', authenticateToken, async (req, res) => {
    const { tamanho, papel, quantidade, arquivo } = req.body
    if (!arquivo) {
        return res.status(400).json({ mensagem: "É necessário o ficheiro para a impressão!" });
    }
    const newOrder = new Order({
        userId: req.user.userId, //ID do utilizador do token
        tamanho:tamanho,
        papel:papel,
        quantidade:quantidade,
        arquivo:arquivo,
        tipoServico: "impressao"
    });

    try {
        await newOrder.save();
        res.status(201).json({ mensagem: "Pedido realizado com sucesso!" });
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao criar o pedido", erro: err });
    }
});
app.post('/pedido-grande-formato', authenticateToken, async (req, res) => {
    const { material, largura, altura, quantidade, arquivo } = req.body;

    if (!material || !largura || !altura || !quantidade || !arquivo) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
    }

    try {
        const newOrder = new Order({
            userId: req.user.userId, //ID do utilizador do token
            tamanho: `${largura}x${altura} cm`,
            papel: material, // Aqui podes adaptar para o nome correto do material
            quantidade:quantidade,
            arquivo:arquivo,
            tipoServico: "grande-formato"
        });

        await newOrder.save();
        res.status(201).json({ mensagem: "Pedido de grande formato realizado com sucesso!" });

    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao criar o pedido de grande formato", erro: err });
    }
});

//PUTS
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

//DELETES
app.delete('/api/admin/encomendas/:id', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ mensagem: "Apenas o admin pode apagar encomendas." });
    }

    try {
        const {id}  = req.params;
        await Order.findByIdAndDelete(id);
        res.status(200).json({ mensagem: "Encomenda apagada com sucesso." });
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao apagar encomenda", erro: err });
    }
});

//FUNCTIONS 
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    
    if (!token) return res.status(401).json({ mensagem: "Acesso negado!" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ mensagem: "Token inválido!" });

        req.user = user;
        next();
    });
}



//SCHEMAS 
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tamanho: String,
    papel: String,
    quantidade: Number,
    arquivo: String,
    dataPedido: { type: Date, default: Date.now },
    tipoServico: { type: String, enum: ['impressao', 'grande-formato'], required: true },
    estado: { type: String, enum: ['pendente', 'em-processamento', 'concluido', 'enviado'], default: 'pendente' }
});

const Order = mongoose.model('Order', orderSchema);

const userSchema = new mongoose.Schema({
    nome: String,
    email: { type: String, unique: true },
    password: String,
    isAdmin: { type: Boolean, default: false },
    resetToken: String,
    resetTokenExpiration: Date
});
const User = mongoose.model('User', userSchema, 'Users');

app.listen(port,()=>{
    console.log('Server is runningo on port'+ port);
})




//tree.js
*/

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');


dotenv.config();

const  authenticateToken  = require('./middlewares/auth');
const Order = require('./models/Order');
const Message = require('./models/Message');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

const cors = require('cors')
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

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

// Rotas para páginas HTML
/*
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'register.html')));
app.get('/servicos', (req, res) => res.sendFile(path.join(__dirname, 'servicos.html')));
app.get('/portfolio', (req, res) => res.sendFile(path.join(__dirname, 'portfolio.html')));
app.get('/contactos', (req, res) => res.sendFile(path.join(__dirname, 'contactos.html')));
app.get('/perfilCliente', (req, res) => res.sendFile(path.join(__dirname, 'perfil_Cliente.html')));
app.get('/personalizar/impressao', (req, res) => res.sendFile(path.join(__dirname, 'offset.html')));
app.get('/personalizar/grande-formato', (req, res) => res.sendFile(path.join(__dirname, 'grande_formato.html')));
app.get('/personalizar/stands', (req, res) => res.sendFile(path.join(__dirname, 'stands.html')));
app.get('/personalizar/offset/flyers', (req, res) => res.sendFile(path.join(__dirname, 'offset_formatos/flyers.html')));
app.get('/personalizar/offset/flyers/tresD', (req, res) => res.sendFile(path.join(__dirname, 'flyers.html')));
app.get('/personalizar/offset/cartoes', (req, res) => res.sendFile(path.join(__dirname, 'offset_formatos/cartoes.html')));
app.get('/personalizar/offset/bruchuras', (req, res) => res.sendFile(path.join(__dirname, 'offset_formatos/bruchuras.html')));
*/

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

app.post('/api/stripe/checkout-session', async (req, res) => {
  const { morada, telefone, carrinho, token } = req.body;

  // Converte os itens do carrinho para o formato Stripe
  const line_items = carrinho.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.tipoServico || item.produto || "Produto",
      },
      unit_amount: Math.round((item.precoEstimado || 0) * 10),
    },
    quantity: item.quantidade || 1,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'http://localhost:5173/index.html', // Altera para o teu domínio
      cancel_url: 'http://localhost:5173/checkout.html',
      metadata: { morada, telefone, carrinho: JSON.stringify(carrinho), token },
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar sessão Stripe" });
  }
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

  // ou o caminho correto

if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { morada, telefone, carrinho, token } = session.metadata;
    const email = session.customer_email;
    const carrinhoArray = JSON.parse(carrinho);

    // Se quiseres associar ao user, extrai o userId do token JWT
    let userId = null;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
        } catch (err) {
            console.error("Token JWT inválido no webhook:", err);
        }
    }

    for (const item of carrinhoArray) {
        try {
            await Order.create({
                userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
                tamanho: item.tamanho,
                papel: item.papel,
                quantidade: item.quantidade,
                arquivo: item.arquivo,
                tipoServico: item.tipoServico || item.produto,
                estado: 'pendente',
                morada,
                telefone,
                email
            });
        } catch (err) {
            console.error("Erro ao criar encomenda:", err);
        }
    }
}
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { morada, telefone, carrinho, token } = session.metadata;
        const email = session.customer_email;
        const carrinhoArray = JSON.parse(carrinho);

        // Se quiseres associar ao user, extrai o userId do token JWT
        let userId = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.userId;
            } catch (err) {
                console.error("Token JWT inválido no webhook:", err);
            }
        }

        for (const item of carrinhoArray) {
            try {
                await Order.create({
                    userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
                    tamanho: item.tamanho,
                    papel: item.papel,
                    quantidade: item.quantidade,
                    arquivo: item.arquivo,
                    tipoServico: item.tipoServico || item.produto,
                    estado: 'pendente',
                    morada,
                    telefone,
                    email
                });
            } catch (err) {
                console.error("Erro ao criar encomenda:", err);
            }
        }
    }
});
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});