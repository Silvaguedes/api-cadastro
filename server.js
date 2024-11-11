const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Importa o CORS
require('dotenv').config();

const User = require('./models/User');

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((error) => console.error('Erro ao conectar no MongoDB', error));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para interpretar JSON
app.use(express.json());

// Configura o CORS
const allowedOrigins = ['https://registrationpeople.netlify.app', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Permite todos os métodos HTTP necessários
  allowedHeaders: ['Content-Type', 'Authorization'], // Permite cabeçalhos específicos
  credentials: true // Permite envio de credenciais, se necessário
}));

// Tratamento adicional para preflight requests (opcional)
app.options('*', cors()); // Permite que todas as rotas respondam à preflight request





// Rota para cadastro de usuário
app.post('/users', async (req, res) => {
  const { nome, idade, email, senha } = req.body;

  if (!nome || !idade || !email || !senha) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Já existe um usuário com esse e-mail.' });
    }

    const newUser = new User({ nome, idade, email, senha });
    await newUser.save();

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: { nome: newUser.nome, idade: newUser.idade, email: newUser.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// Rota para listar todos os usuários
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
});

// Rota para deletar um usuário por ID
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  // Verificar se o ID tem o formato correto de ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json({ message: 'Usuário deletado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});


// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
