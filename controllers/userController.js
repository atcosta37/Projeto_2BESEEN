const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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