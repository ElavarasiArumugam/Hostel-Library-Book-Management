const mongoose = require('mongoose');
const Book = require('./models/Book');
const dotenv = require('dotenv');

dotenv.config();

// Standard Engineering Books List
const sampleTitles = [
    "Engineering Physics", "Engineering Chemistry", "Python Programming", 
    "Calculus I", "Data Structures", "Circuit Theory", "Thermodynamics",
    "Fluid Mechanics", "Digital Logic", "Microprocessors", "Machine Learning",
    "Artificial Intelligence", "VLSI Design", "Control Systems", "Software Engineering"
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("✅ Connected to DB. seeding 700 books...");
        
        // Clear existing books (Optional: Remove this line if you want to keep old books)
        // await Book.deleteMany({}); 

        const books = [];
        for (let i = 1; i <= 700; i++) {
            const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
            const deptCode = ["CSE", "ECE", "MECH", "CIVIL", "EEE"][Math.floor(Math.random() * 5)];
            
            books.push({
                accessionNumber: `ACC-${1000 + i}`,
                title: `${randomTitle} (Vol ${Math.ceil(i/50)})`,
                author: `Author ${i}`,
                publisher: `Tech Press ${deptCode}`,
                totalCopies: 5,
                availableCopies: 5
            });
        }

        await Book.insertMany(books);
        console.log("🎉 700 Books Added Successfully!");
        process.exit();
    })
    .catch((err) => {
        console.log(err);
        process.exit();
    });