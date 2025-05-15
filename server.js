require('dotenv').config();
const cors = require('cors');
app.use(cors());

const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());

app.post('/enviar-email', async (req, res) => {
  const { nome, email, mensagem } = req.body;

  const transporter = nodemailer.createTransport({
    host: 'webdomain03.dnscpanel.com',     
    port: 465,                              
    secure: true,                          
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Mensagem de ${nome}`,
    text: mensagem
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email enviado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao enviar email.' });
  }
});

app.get('/', (req, res) => {
  res.send('API a funcionar!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});