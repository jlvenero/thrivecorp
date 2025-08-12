// routes/items.js
const express = require('express');
const router = express.Router();
const itemModel = require('../models/itemModel');

// Rota para listar todos os itens
router.get('/', async (req, res) => {
    try {
        const items = await itemModel.getAllItems();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para criar um novo item
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    try {
        const newId = await itemModel.createItem(name, description);
        res.status(201).json({ id: newId, message: 'Item criado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;