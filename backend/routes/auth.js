const router = require('express').Router();
const Student = require('../models/Student');
const bcrypt = require('bcryptjs'); // Changed to bcryptjs to be safe (or keep 'bcrypt' if it works for you)

// 1. REGISTER NEW STUDENT
router.post('/register', async (req, res) => {
    try {
        // 🟢 Added 'degree' to the list of fields to read from frontend
        const { name, rollNo, email, password, degree, department, year, phoneNumber, hostelBlock, roomNo } = req.body;

        // Validation: Roll Number must be exactly 10 digits
        if (!/^\d{10}$/.test(rollNo)) {
            return res.status(400).json("Roll Number must be exactly 10 digits.");
        }

        // Validation: Email must match the Anna Univ format
        const expectedEmail = `${rollNo}@student.annauniv.edu`;
        if (email !== expectedEmail) {
            return res.status(400).json(`Invalid Email! It must be: ${expectedEmail}`);
        }

        // Check if user already exists
        const existingUser = await Student.findOne({ rollNo });
        if (existingUser) return res.status(400).json("A student with this Roll Number is already registered.");

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the new student
        const newStudent = new Student({
            name,
            rollNo,
            email,
            password: hashedPassword,
            degree, // 🟢 NOW SAVING DEGREE
            department,
            year,
            phoneNumber,
            hostelBlock,
            roomNo
        });

        const student = await newStudent.save();
        res.status(200).json(student);

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// 2. LOGIN STUDENT
router.post('/login', async (req, res) => {
    try {
        // Find student by Roll No
        const student = await Student.findOne({ rollNo: req.body.rollNo });
        if (!student) return res.status(404).json("User not found");

        // Check Password
        const validPassword = await bcrypt.compare(req.body.password, student.password);
        if (!validPassword) return res.status(400).json("Wrong password");

        // Return student info (excluding password)
        const { password, ...others } = student._doc;
        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 3. GET STUDENT BY ROLL NO (For Admin Search)
router.get('/student/:rollNo', async (req, res) => {
    try {
        // Case-insensitive search
        const student = await Student.findOne({ 
            rollNo: { $regex: new RegExp("^" + req.params.rollNo + "$", "i") } 
        });

        if (!student) return res.status(404).json("Student not found");
        
        const { password, ...others } = student._doc;
        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 4. GET ALL STUDENTS (For Admin Report)
router.get('/all-students', async (req, res) => {
    try {
        const students = await Student.find().select('-password'); // Return all except password
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 5. DELETE STUDENT (Admin Action)
router.delete('/delete/:id', async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.status(200).json("Student has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;