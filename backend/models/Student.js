const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNo: { 
        type: String, 
        required: true, 
        unique: true,
        minlength: 10,
        maxlength: 10 
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // 🟢 ADDED DEGREE HERE
    degree: { type: String, required: true },

    department: { type: String, required: true },
    year: { type: String, required: true }, 
    phoneNumber: { type: String, required: true },
    hostelBlock: { type: String, required: true },
    roomNo: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);