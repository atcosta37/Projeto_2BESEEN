const Order = require('../models/Order');

exports.listOrdersAdmin= async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ mensagem: "Acesso restrito ao administrador." });
    }
    try {
        const encomendas = await Order.find().populate('userId', 'nome email');
        res.json(encomendas);
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao buscar as encomendas", erro: err });
    }
};


exports.deleteOrdersAdmin= async(req, res) => {
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
};


exports.updateOrdersAdmin= async (req, res) => {
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
};


exports.mensagemAdmin = async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ mensagem: "Acesso restrito ao administrador." });
    }
    try {
        const mensagens = await Message.find().sort({ data: -1 });
        res.json(mensagens);
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao buscar mensagens." });
    }
};