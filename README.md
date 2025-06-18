# 2BESEEN

**Impressão de Qualidade Online**

## Descrição

O 2BESEEN é uma plataforma web para uma gráfica online, permitindo aos clientes conhecer os serviços, portfólio, fazer pedidos e contactar a empresa de forma simples e intuitiva.

## Funcionalidades

- Apresentação institucional da gráfica
- Catálogo de serviços de impressão
- Portfólio de trabalhos realizados
- Carrinho de compras para pedidos online
- Área de cliente com login e registo
- Recuperação de password por email 
- Gestão de perfil de utilizador
- Página de contactos
- Área de administração 
- Integração com PayPal para pagamentos online

## Tecnologias Utilizadas

- HTML5, CSS3 (Flexbox, Grid)
- JavaScript (ES6)
- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- Vite
- JWT (JSON Web Token)
- Multer
- Nodemailer
- PayPal SDK
- dotenv
- cors
- bcrypt
- three.js

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [npm](https://www.npmjs.com/)
- Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Conta PayPal (para testes de pagamentos)
- Conta mailerSend (ou outro SMTP) [MailerSend](https://www.mailersend.com)

## Como executar o frontend (Vite)

1. **Acede à pasta do frontend:**
   ```bash
   cd frontend/2BESEEN
   ```

2. **Instala as dependências:**
   ```bash
   npm install
   ```

3. **Inicia o servidor de desenvolvimento Vite:**
   ```bash
   npm run dev
   ```

4. **Abre o navegador em:**  
   [http://localhost:5173](http://localhost:5173)

## Como executar o backend

1. **Acede à raiz do projeto (onde está o `server.js`):**
   ```bash
   cd /caminho/para/Projeto_2BESEEN
   ```

2. **Instala as dependências:**
   ```bash
   npm install
   ```

3. **Cria um ficheiro `.env`** com as tuas credenciais (MongoDB, PayPal, email, etc.).  
   Exemplo:
   ```
   PORT=3000
   MONGO_URI=...
   JWT_SECRET=...
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   EMAIL_USER=...
   EMAIL_PASS=...
   EMAIL_HOST=...
   EMAIL_PORT=...
   ```

4. **Inicia o servidor:**
   ```bash
   npm run server
   ```
   O servidor ficará disponível em `http://localhost:3000` (ou na porta definida no `.env`).

> O backend é necessário para autenticação, gestão de encomendas, uploads, integração PayPal, envio de emails (Nodemailer) e ligação à base de dados MongoDB.

## Estrutura de Pastas

```
Projeto_2BESEEN/
├── server.js
├── .env
├── package.json
├── controllers/
├── middlewares/
├── models/
├── routes/
├── frontend/
│   └── 2BESEEN/
│       ├── index.html
│       ├── servicos.html
│       ├── portfolio.html
│       ├── oque-somos.html
│       ├── contactos.html
│       ├── package.json
│       └── src/
│           ├── css/
│           ├── js/
│           └── imagens/
|...
```

## Autor

- [atcosta37](https://github.com/atcosta37)

## Licença

Este projeto é apenas para fins educativos.

---
