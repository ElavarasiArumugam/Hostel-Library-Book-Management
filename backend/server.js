const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoute = require('./routes/auth');
const bookRoute = require('./routes/Books');
const transactionRoute = require('./routes/Transactions');
const chatRoute = require('./routes/chat');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Connect to Database
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected!"))
.catch((err) => console.log(err));

// Use Routes
app.use('/api/auth', authRoute);
app.use('/api/books', bookRoute);
app.use('/api/transactions', transactionRoute);
app.use('/api/chat', chatRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});