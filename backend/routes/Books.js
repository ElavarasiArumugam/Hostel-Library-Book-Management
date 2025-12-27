const router = require('express').Router();
const Book = require('../models/Book');


// ADD NEW BOOK (Admin)
router.post('/add', async (req, res) => {
    try {
        const newBook = new Book({
            accessionNumber: req.body.accessionNumber,
            title: req.body.title,
            author: req.body.author,
            publisher: req.body.publisher,
            totalCopies: req.body.totalCopies,
            availableCopies: req.body.totalCopies // Initially, available = total
        });
        const book = await newBook.save();
        res.status(200).json(book);
    } catch (err) {
        res.status(500).json(err);
    }
});

// SEARCH BOOKS (By Title or Author)
router.get('/search', async (req, res) => {
    const query = req.query.q; // e.g. /books/search?q=Harry Potter
    try {
        const books = await Book.find({
            $or: [
                { title: { $regex: query, $options: "i" } },
                { author: { $regex: query, $options: "i" } }
            ]
        });
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;