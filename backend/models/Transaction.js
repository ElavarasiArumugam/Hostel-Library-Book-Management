const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', 
        required: true
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book', 
        required: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date
    },
    status: {
        type: String,
        default: 'Issued', // 🟢 CRITICAL: Default must be 'Issued'
        enum: ['Issued', 'Returned']
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);