const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    accessionNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, default: 'General' }, // 🟢 NEW: For AI 
    pages: { type: Number, default: 300 },          // 🟢 NEW: For AI 
    totalCopies: { type: Number, required: true, default: 1 },
    availableCopies: { type: Number, required: true, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);