require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const Transaction = require('./models/Transaction');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to Database.'))
  .catch(err => console.log('❌ DB Error:', err));

const departments = [
  'Computer Science Engineering', 'Information Technology', 'Electrical and Electronics (EEE)', 
  'Electronics and Comm. (ECE)', 'Mechanical Engineering', 'Civil Engineering', 
  'Bio-Medical Engineering', 'Industrial Engineering', 'Printing Technology', 
  'Mining Engineering', 'Material Science', 'Manufacturing Engineering', 
  'Media Science', 'Chemistry', 'Physics', 'Mathematics', 'Literature', 'Philosophy'
];

const authors = ["Dr. R. K. Bansal", "Prof. A. K. Gupta", "John Smith", "David Flanagan", "Robert C. Martin", "Jane Austen", "Plato", "Bjarne Stroustrup", "Isaac Newton", "Marie Curie", "Stephen Hawking"];

const generateRandomBooks = () => {
    let books = [];
    let accCounter = 10001; 
    
    // Generate exactly 2500 books
    for (let i = 0; i < 2500; i++) {
        const category = departments[Math.floor(Math.random() * departments.length)];
        const author = authors[Math.floor(Math.random() * authors.length)];
        const pages = Math.floor(Math.random() * 700) + 150; 
        
        books.push({
            accessionNumber: `CEG${accCounter++}`,
            // Made titles slightly more unique so the duplicates filter doesn't delete too many!
            title: `Advanced ${category} Vol ${Math.floor(Math.random() * 100) + 1}`,
            author: author,
            category: category,
            pages: pages,
            totalCopies: Math.floor(Math.random() * 4) + 1, 
            availableCopies: 0 
        });
    }

    // Set available to equal total
    books.forEach(b => b.availableCopies = b.totalCopies);
    
    // Remove exact duplicates so your database is clean
    const uniqueBooks = [];
    const seenTitles = new Set();
    books.forEach(book => {
        if (!seenTitles.has(book.title)) {
            seenTitles.add(book.title);
            uniqueBooks.push(book);
        }
    });

    return uniqueBooks;
};

const seedData = async () => {
  try {
    console.log('🧹 Clearing old Books and Transactions...');
    await Book.deleteMany();
    await Transaction.deleteMany();
    
    console.log('📚 Generating Categorized Books for the AI...');
    const booksToInsert = generateRandomBooks();
    await Book.insertMany(booksToInsert);
    console.log(`✅ Successfully added ${booksToInsert.length} unique categorized books.`);

    console.log('🎉 MASSIVE DATABASE UPGRADE COMPLETED SUCCESSFULLY!');
    process.exit();
  } catch (err) {
    console.log('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedData();