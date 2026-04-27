const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
    enum: ['ingreso', 'gasto']
  },
  monto: {
    type: Number,
    required: true,
    min: 0
  },
  categoria: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
