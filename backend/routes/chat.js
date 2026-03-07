const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Book = require('../models/Book');

router.post('/', async (req, res) => {
    try {
        const userMessage = req.body.message;

        // 1. Initialize Gemini using the key from your .env file
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 2. THE "RAG" RETRIEVAL: Fetch 100 random, currently available books from your DB
        const availableBooks = await Book.aggregate([
            { $match: { availableCopies: { $gt: 0 } } },
            { $sample: { size: 100 } } 
        ]);
        
        // Format the books into a clean text list for the AI to read
        const catalogContext = availableBooks.map(b => 
            `- "${b.title}" by ${b.author} (Category: ${b.category}, Length: ${b.pages} pages, Accession No: ${b.accessionNumber})`
        ).join('\n');

        // 3. THE PROMPT: Instruct the AI on how to behave
        const prompt = `You are a highly intelligent, friendly librarian at the Engineering College Hostels (ECH) Library at CEG. 
        A student has just asked you this question: "${userMessage}"
        
        Here is a list of 100 currently available books sitting on our library shelves right now:
        ${catalogContext}

        YOUR INSTRUCTIONS:
        1. Answer the student's question politely and conversationally.
        2. If they are asking for a recommendation, pick 1 or 2 books ONLY from the list above.
        3. Tell them the Title, Category, Page Count, and most importantly, the Accession Number so they can borrow it.
        4. NEVER recommend a book that is not on the list provided. If nothing matches their request, apologize and suggest a different category we do have.
        5. Keep your response relatively short (under 4 sentences).`;

        // 4. Generate the response
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        // Send the AI's answer back to the frontend
        res.status(200).json({ reply: aiResponse });

    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({ reply: "I'm sorry, my AI brain is currently updating! Please ask the front desk." });
    }
});

module.exports = router;