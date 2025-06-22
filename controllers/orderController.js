
const Order = require('../models/Order');


exports.createOrderRaw = async (orderData) => {
    const order = new Order(orderData);
    return await order.save();
}

// Listar encomendas
exports.listOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao listar encomendas!" });
    }
};

exports.listUserOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log('userId recebido:', userId);
        const orders = await Order.find({ userId }).sort({ dataPedido: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensagem: "Erro ao listar encomendas do utilizador!" });
    }
};

// Obter encomenda por ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ mensagem: "Encomenda não encontrada!" });
        }
        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao obter encomenda!" });
    }
};

// Atualizar encomenda
exports.updateOrder = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ mensagem: "Encomenda não encontrada!" });
        }
        res.status(200).json({ mensagem: "Encomenda atualizada!", order: updatedOrder });
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao atualizar encomenda!" });
    }
};



