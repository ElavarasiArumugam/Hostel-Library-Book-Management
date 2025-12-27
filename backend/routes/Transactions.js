const router = require('express').Router();
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const Student = require('../models/Student');

// 1. ISSUE BOOK DIRECTLY (Admin: Uses Roll No & Accession No)
router.post('/issue-direct', async (req, res) => {
    try {
        const { rollNo, accessionNumber } = req.body;

        // Find Student
        const student = await Student.findOne({ rollNo: { $regex: new RegExp("^" + rollNo + "$", "i") } });
        if (!student) return res.status(404).json({ message: "Student not found" });

        // Find Book
        const book = await Book.findOne({ accessionNumber: accessionNumber });
        if (!book) return res.status(404).json({ message: "Book not found with that Accession Number" });
        if (book.availableCopies < 1) return res.status(400).json({ message: "Book copy is currently unavailable (0 copies)" });

        // Check if already borrowed
        const existing = await Transaction.findOne({ studentId: student._id, bookId: book._id, status: "Issued" });
        if (existing) return res.status(400).json({ message: "Student already has this book issued!" });

        // Create Transaction
        const newTrans = new Transaction({
            studentId: student._id,
            bookId: book._id,
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Default 15 Days
            status: 'Issued' // 🟢 FORCE STATUS
        });

        await newTrans.save();
        await Book.findByIdAndUpdate(book._id, { $inc: { availableCopies: -1 } });

        res.status(200).json({ 
            message: "Book Issued Successfully", 
            student: student.name, 
            book: book.title 
        });

    } catch (err) {
        console.error("Issue Error:", err); // Log error for debugging
        res.status(500).json(err);
    }
});

// 2. RETURN BOOK DIRECTLY
router.post('/return-direct', async (req, res) => {
    try {
        const { accessionNumber } = req.body;

        const book = await Book.findOne({ accessionNumber: accessionNumber });
        if (!book) return res.status(404).json({ message: "Book not found" });

        const trans = await Transaction.findOne({ bookId: book._id, status: 'Issued' }).populate('studentId');
        if (!trans) return res.status(400).json({ message: "This book is not currently issued to anyone." });

        trans.status = 'Returned';
        trans.returnDate = Date.now();
        await trans.save();

        await Book.findByIdAndUpdate(book._id, { $inc: { availableCopies: 1 } });

        res.status(200).json({ 
            message: "Book Returned Successfully", 
            student: trans.studentId.name,
            book: book.title
        });

    } catch (err) {
        res.status(500).json(err);
    }
});

// 3. GET ACTIVE BOOKS FOR A STUDENT
router.get('/student-active/:studentId', async (req, res) => {
    try {
        const trans = await Transaction.find({ studentId: req.params.studentId, status: 'Issued' }).populate('bookId');
        res.status(200).json(trans);
    } catch (err) { res.status(500).json(err); }
});

// 4. MY BOOKS (Student Dashboard)
router.post('/my-books', async (req, res) => {
    try {
        const books = await Transaction.find({ studentId: req.body.studentId, status: 'Issued' }).populate('bookId');
        res.status(200).json(books);
    } catch (err) { res.status(500).json(err); }
});

// 5. LIBRARY REPORT (Stats)
router.get('/report', async (req, res) => {
    try {
        const totalBooks = await Book.countDocuments();
        const issuedBooks = await Transaction.countDocuments({ status: 'Issued' });
        const totalStudents = await Student.countDocuments();
        const recentTrans = await Transaction.find().sort({ _id: -1 }).limit(10).populate('studentId bookId');
        
        res.status(200).json({ totalBooks, issuedBooks, totalStudents, recentTrans });
    } catch (err) { res.status(500).json(err); }
});

// 6. ALL HISTORY
router.get('/all-history', async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('studentId')
            .populate('bookId')
            .sort({ updatedAt: -1 });
        res.status(200).json(transactions);
    } catch (err) { res.status(500).json(err); }
});

module.exports = router;