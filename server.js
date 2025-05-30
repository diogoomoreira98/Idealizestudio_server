require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/enviar-email', async (req, res) => {
  const { nome, email, mensagem, recaptchaToken } = req.body;

  // 1. Validar reCAPTCHA
  if (!recaptchaToken) {
    return res.status(400).json({ message: 'ReCAPTCHA não preenchido.' });
  }

  try {
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`
    });

    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
      return res.status(400).json({ message: 'Falha na verificação do reCAPTCHA.' });
    }

    // 2. Enviar email (se reCAPTCHA for válido)
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

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email enviado com sucesso!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao enviar email ou validar reCAPTCHA.' });
  }
});

app.post('/forwardEmail', async (req, res) => {
  const { title, message, email, identifier, recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ message: 'ReCAPTCHA não preenchido.' });
  }

  try {
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`
    });

    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
      return res.status(400).json({ message: 'Falha na verificação do reCAPTCHA.' });
    }

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
      from: process.env.EMAIL_USER,
      to: 'geral@idealize.pt',
      subject: `[${identifier}] ${title}`,
      text: `Mensagem: ${message}\n\nEmail do requerente: ${email}`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email enviado com sucesso ao destinatário específico!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao enviar email ou validar reCAPTCHA.' });
  }
});

app.get('/', (req, res) => {
  res.send('API a funcionar!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});