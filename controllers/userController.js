const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ mensagem: "Utilizador não encontrado!" });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ mensagem: "Password incorreta!" });
        }
        const token = jwt.sign(
            { userId: user._id, email: user.email, nome: user.nome, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        if (user.isAdmin) {
            return res.status(200).json({ redirectTo: "/admin", token });
        }
        res.status(200).json({ redirectTo: "/", token });
    } catch (err) {
        res.status(500).json({ mensagem: "Erro no login!" });
    }
};

// Função de registo
exports.register = async (req, res) => {
    try {
        const { nome, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ mensagem: "Email já registado!" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            nome,
            email,
            password: hashedPassword,
            isAdmin: false
        });
        await newUser.save();
        res.status(201).json({ mensagem: "Registo efetuado com sucesso!", redirectTo: "/login" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensagem: "Erro no registo!" });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ mensagem: "Utilizador não encontrado!" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao obter perfil!" });
    }
};



exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ mensagem: "Email não encontrado!" });

    // Gerar token aleatório
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hora
    await user.save();

    // Enviar email (ajusta para o teu SMTP real)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const resetUrl = `http://localhost:5173/resetPassword.html?token=${token}`;
    await transporter.sendMail({
        from: `"2BESEEN" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Recuperação de palavra-passe",
        html: `<p>Clique no link para definir uma nova palavra-passe:</p><a href="${resetUrl}">${resetUrl}</a>`
    });

    res.json({ mensagem: "Enviámos um link de recuperação para o seu email." });
};

exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;
    const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ mensagem: "Token inválido ou expirado." });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.json({ mensagem: "Palavra-passe alterada com sucesso!" });
};