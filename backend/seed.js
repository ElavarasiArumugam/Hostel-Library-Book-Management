const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Book = require('./models/Book');
const Student = require('./models/Student');
const Transaction = require('./models/Transaction');

dotenv.config();

// ==========================================
// 1. SMART GENERATOR DATA FOR 750+ BOOKS
// ==========================================
const bookPrefixes = ["Advanced", "Applied", "Principles of", "Fundamentals of", "Modern", "Introduction to", "Elements of", "Comprehensive", "Essentials of", "Handbook of", "Practical"];
const bookSubjects = [
    // CSE / IT
    "Data Structures", "Algorithms", "Artificial Intelligence", "Machine Learning", "Cloud Computing", "Cryptography", "Network Security", "Database Systems", "Operating Systems", "Software Engineering", "Computer Graphics", "Deep Learning", "Internet of Things", "Blockchain Technology", "Data Analytics", "Compiler Design", "Web Technologies",
    // ECE / EEE
    "Digital Signal Processing", "VLSI Design", "Microprocessors", "Embedded Systems", "Control Systems", "Power Electronics", "Electromagnetic Fields", "Antenna Theory", "Communication Networks", "Circuit Theory", "Wireless Communication", "Optical Networks", "Power Systems Analysis",
    // Mechanical / Manufacturing
    "Thermodynamics", "Fluid Mechanics", "Kinematics of Machinery", "Heat and Mass Transfer", "Robotics", "Automobile Engineering", "CAD/CAM", "Mechatronics", "Material Science", "Finite Element Analysis", "Manufacturing Processes",
    // Civil / Mining
    "Structural Analysis", "Geotechnical Engineering", "Transportation Engineering", "Fluid Dynamics", "Surveying", "Concrete Technology", "Environmental Engineering", "Rock Mechanics", "Mine Surveying", "Underground Mining",
    // Bio-Medical / Printing
    "Biomechanics", "Medical Imaging", "Biomaterials", "Clinical Instrumentation", "Typography", "Digital Prepress", "Print Media Management",
    // General Science
    "Engineering Physics", "Engineering Chemistry", "Discrete Mathematics", "Calculus and Linear Algebra", "Quantum Computing"
];
const bookSuffixes = ["in Practice", "Systems", "Analysis", "Design", "and Applications", "Methodologies", "Architecture", "Techniques"];
const authors = ["Thomas H. Cormen", "M. Morris Mano", "B.S. Grewal", "Yunus A. Cengel", "James F. Kurose", "Stuart Russell", "Abraham Silberschatz", "R.K. Rajput", "Ian Goodfellow", "Simon Haykin", "Adel S. Sedra", "P.S. Bimbhra", "Katsuhiko Ogata", "V.B. Bhandari", "C.S. Reddy", "John G. Proakis", "Robert L. Boylestad", "Alan V. Oppenheim", "S.S. Rattan", "P.K. Nag", "N.N. Basak", "Erwin Kreyszig"];
const publishers = ["Pearson", "McGraw Hill", "Wiley", "Oxford", "MIT Press", "Springer", "Cengage", "Prentice Hall", "S. Chand", "Dhanpat Rai", "Khanna Publishers", "PHI Learning"];

// Generate Books Function
const generateBooks = (count) => {
    const books = [];
    let accNum = 1001;
    
    for (let i = 0; i < count; i++) {
        const prefix = bookPrefixes[Math.floor(Math.random() * bookPrefixes.length)];
        const subject = bookSubjects[Math.floor(Math.random() * bookSubjects.length)];
        const suffix = bookSuffixes[Math.floor(Math.random() * bookSuffixes.length)];
        const useSuffix = Math.random() > 0.5; // 50% chance to have a suffix to make it sound natural
        
        const title = useSuffix ? `${prefix} ${subject}: ${suffix}` : `${prefix} ${subject}`;
        const totalCopies = Math.floor(Math.random() * 8) + 2; // Random copies between 2 and 9
        
        books.push({
            accessionNumber: `ACC-${accNum++}`,
            title: title,
            author: authors[Math.floor(Math.random() * authors.length)],
            publisher: publishers[Math.floor(Math.random() * publishers.length)],
            totalCopies: totalCopies,
            availableCopies: totalCopies
        });
    }
    // Remove exact duplicate titles if any happen to generate
    return [...new Map(books.map(item => [item.title, item])).values()];
};

// ==========================================
// 2. SMART GENERATOR FOR 200 STUDENTS
// ==========================================
const femaleNames = ["Priya", "Divya", "Meena", "Kavya", "Sneha", "Anjali", "Swathi", "Shruti", "Aishwarya", "Keerthi", "Nandhini", "Pooja", "Ramya", "Sindhu", "Harini"];
const maleNames = ["Arun", "Sanjay", "Rahul", "Karthik", "Vignesh", "Vijay", "Surya", "Gautham", "Praveen", "Ashwin", "Dinesh", "Manoj", "Ajith", "Harish", "Pradeep"];
const lastNames = ["Kumar", "Rajan", "Singh", "Iyer", "Nair", "Krishnan", "Reddy", "Sharma", "Babu", "Rao", "Prasad", "Chandran", "Menon", "Pillai", "Das"];

// Exact Requirements provided by you
const hostelBlocksFemale = ['Malligai', 'Mullai', 'Marutham', 'Semparuthi', 'Thamarai', 'Roja', 'Parijatham', 'NRI Block (Girls)'];
const hostelBlocksMale = ['Vaagai', 'Thumbai', 'NRI Block (Boys)'];
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
const degrees = ['B.E', 'B.Tech', 'M.Sc', 'M.E', 'M.Tech', 'MBA', 'MCA'];
const departments = ['Information Technology', 'Computer Science Engineering', 'Electronics and Comm. (ECE)', 'Electrical and Electronics (EEE)', 'Mechanical Engineering', 'Civil Engineering', 'Bio-Medical Engineering', 'M.Sc Computer Science', 'M.Sc Electronic Media', 'M.Sc Mathematics', 'Manufacturing Engineering', 'Printing Technology', 'Mining Engineering'];

const generateStudents = async (count, hashedPassword) => {
    const students = [];
    let rollBase = 2021115000;

    for (let i = 0; i < count; i++) {
        const isMale = Math.random() > 0.5;
        const firstName = isMale ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const gender = isMale ? "Male" : "Female";
        const hostelList = isMale ? hostelBlocksMale : hostelBlocksFemale;

        const rollNo = (rollBase + i).toString();
        
        students.push({
            name: `${firstName} ${lastName}`,
            rollNo: rollNo,
            email: `${rollNo}@student.annauniv.edu`,
            password: hashedPassword,
            gender: gender,
            degree: degrees[Math.floor(Math.random() * degrees.length)],
            department: departments[Math.floor(Math.random() * departments.length)],
            year: years[Math.floor(Math.random() * years.length)],
            phoneNumber: `9${Math.floor(Math.random() * 899999999 + 100000000)}`, // Random 10 digit Indian number
            hostelBlock: hostelList[Math.floor(Math.random() * hostelList.length)],
            roomNo: Math.floor(Math.random() * 400 + 100).toString(),
            isAdmin: false
        });
    }
    return students;
};

// ==========================================
// 3. EXECUTE THE SEEDING
// ==========================================
const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to Database.");

        // WIPE OLD DATA COMPLETELY
        console.log("🧹 Clearing old Books, Students, and Transactions...");
        await Book.deleteMany({});
        await Student.deleteMany({});
        // Using Mongoose collection drop in case the model is cached differently
        try { await mongoose.connection.collection('transactions').deleteMany({}); } catch(e){} 

        // CREATE HASHED PASSWORDS
        console.log("🔐 Generating Passwords...");
        const salt = await bcrypt.genSalt(10);
        const studentPassword = await bcrypt.hash("student123", salt);
        const adminPassword = await bcrypt.hash("admin123", salt);

        // INSERT 700+ BOOKS
        console.log("📚 Generating and Adding 750 Engineering Books...");
        const generatedBooks = generateBooks(750);
        await Book.insertMany(generatedBooks);
        console.log(`✅ Successfully added ${generatedBooks.length} unique books.`);

        // INSERT 200 STUDENTS
        console.log("🎓 Generating and Adding 200 Students...");
        const generatedStudents = await generateStudents(200, studentPassword);
        await Student.insertMany(generatedStudents);
        console.log(`✅ Successfully added 200 students across all hostels.`);

        // INSERT SUPER ADMIN
        console.log("🛡️ Adding Super Admin...");
        const superAdmin = new Student({
            name: "Super Admin",
            rollNo: "0000000000",
            email: "0000000000@admin.ech.edu",
            password: adminPassword,
            gender: "Male",
            degree: "Admin",
            department: "Hostel Office",
            year: "Staff",
            phoneNumber: "04422352257",
            hostelBlock: "Office",
            roomNo: "N/A",
            isAdmin: true
        });
        await superAdmin.save();

        console.log("🎉 MASSIVE DATABASE SEEDING COMPLETED SUCCESSFULLY! READY FOR DEMO!");
        process.exit();

    } catch (error) {
        console.error("❌ Error Seeding Database:", error);
        process.exit(1);
    }
};

seedDatabase();