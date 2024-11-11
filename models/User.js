const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  idade: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true } // Adiciona senha como obrigatório
});

module.exports = mongoose.model('User', userSchema);
