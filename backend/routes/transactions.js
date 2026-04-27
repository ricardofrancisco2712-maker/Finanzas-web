const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Obtener todas las transacciones (con filtro opcional)
router.get('/', async (req, res) => {
  try {
    const { tipo, categoria } = req.query;
    let filter = {};
    if (tipo) filter.tipo = tipo;
    if (categoria) filter.categoria = categoria;

    const transactions = await Transaction.find(filter).sort({ fecha: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtener una sola transacción por ID
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transacción no encontrada' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear una transacción
router.post('/', async (req, res) => {
  const transaction = new Transaction(req.body);
  try {
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Actualizar una transacción
router.put('/:id', async (req, res) => {
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTransaction) return res.status(404).json({ message: 'Transacción no encontrada' });
    res.json(updatedTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Eliminar una transacción
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transacción no encontrada' });
    res.json({ message: 'Transacción eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
