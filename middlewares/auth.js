const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    console.log("Passei no middleware");
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ mensagem: "Token não fornecido!" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ mensagem: "Token inválido!" });
        req.user = user
        next();
    });
}

module.exports = authenticateToken;