const router = require('express').Router();
const Student = require('../models/Student');
const bcrypt = require('bcryptjs'); 

// 1. REGISTER NEW STUDENT
router.post('/register', async (req, res) => {
    try {
        const { name, rollNo, email, password, gender, degree, department, year, phoneNumber, hostelBlock, roomNo } = req.body;

        if (!/^\d{10}$/.test(rollNo)) return res.status(400).json("Roll Number must be exactly 10 digits.");
        const expectedEmail = `${rollNo}@student.annauniv.edu`;
        if (email !== expectedEmail) return res.status(400).json(`Invalid Email! It must be: ${expectedEmail}`);

        const existingUser = await Student.findOne({ rollNo });
        if (existingUser) return res.status(400).json("A student with this Roll Number is already registered.");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newStudent = new Student({
            name, rollNo, email, password: hashedPassword, gender, degree, department, year, phoneNumber, hostelBlock, roomNo
        });

        const student = await newStudent.save();
        res.status(200).json(student);
    } catch (err) { res.status(500).json(err); }
});

// 2. CREATE NEW ADMIN
router.post('/create-admin', async (req, res) => {
    try {
        const { name, rollNo, password, gender } = req.body;
        
        if (!/^\d{10}$/.test(rollNo)) return res.status(400).json("Admin ID must be exactly 10 digits.");
        const existingAdmin = await Student.findOne({ rollNo });
        if (existingAdmin) return res.status(400).json("An Admin with this ID already exists.");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new Student({
            name, rollNo, email: `${rollNo}@admin.ech.edu`, password: hashedPassword, gender, 
            degree: "Admin", department: "Hostel Office", year: "Admin", phoneNumber: "0000000000", hostelBlock: "Office", roomNo: "Office",
            isAdmin: true
        });

        await newAdmin.save();
        res.status(200).json("Admin Created Successfully");
    } catch (err) { res.status(500).json(err); }
});

// 3. LOGIN
router.post('/login', async (req, res) => {
    try {
        const user = await Student.findOne({ rollNo: req.body.rollNo });
        if (!user) return res.status(404).json("User not found");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json("Wrong password");

        const { password, ...others } = user._doc;
        res.status(200).json(others);
    } catch (err) { res.status(500).json(err); }
});

// 4. RESET PASSWORD (STUDENT & ADMIN)
router.post('/reset-password', async (req, res) => {
    try {
        const { rollNo, email, newPassword } = req.body;
        const user = await Student.findOne({ rollNo, email });
        if (!user) return res.status(404).json("Details do not match our records.");

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.status(200).json("Password reset successful.");
    } catch (err) { res.status(500).json(err); }
});

// 5. GET STUDENT BY ROLL NO
router.get('/student/:rollNo', async (req, res) => {
    try {
        const student = await Student.findOne({ rollNo: { $regex: new RegExp("^" + req.params.rollNo + "$", "i") }, isAdmin: false });
        if (!student) return res.status(404).json("Student not found");
        const { password, ...others } = student._doc;
        res.status(200).json(others);
    } catch (err) { res.status(500).json(err); }
});

// 6. GET ALL STUDENTS & ALL ADMINS
router.get('/all-students', async (req, res) => {
    try {
        const students = await Student.find({ isAdmin: false }).select('-password'); 
        res.status(200).json(students);
    } catch (err) { res.status(500).json(err); }
});

router.get('/all-admins', async (req, res) => {
    try {
        const admins = await Student.find({ isAdmin: true }).select('-password'); 
        res.status(200).json(admins);
    } catch (err) { res.status(500).json(err); }
});

// 7. DELETE USER (Student or Admin)
router.delete('/delete/:id', async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted...");
    } catch (err) { res.status(500).json(err); }
});

module.exports = router;