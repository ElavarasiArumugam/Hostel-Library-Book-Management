import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Paper, TextField, Button, Typography, Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, IconButton, Chip, Avatar, MenuItem, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import DownloadIcon from '@mui/icons-material/Download';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';

function AdminDashboard() {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null); 
  const [view, setView] = useState('home'); 
  const [reportSubView, setReportSubView] = useState('dashboard'); 
  const [message, setMessage] = useState({ type: '', text: '' });

  // STATES
  const [issueData, setIssueData] = useState({ rollNo: '', accessionNumber: '' });
  const [returnAccession, setReturnAccession] = useState('');
  const [newBook, setNewBook] = useState({ accessionNumber: '', title: '', author: '', totalCopies: 1 });
  const [newAdmin, setNewAdmin] = useState({ name: '', rollNo: '', password: '', gender: '' }); 
  
  // Search States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentResult, setStudentResult] = useState(null); 
  const [studentBooks, setStudentBooks] = useState([]);     
  const [bookQuery, setBookQuery] = useState('');
  const [bookResults, setBookResults] = useState([]);
  const [hasSearchedBooks, setHasSearchedBooks] = useState(false); // 🟢 ADDED FLAG FOR BOOK SEARCH

  // REPORT DATA STATES
  const [stats, setStats] = useState({ totalBooks: 0, issuedBooks: 0, returnedBooks: 0, totalStudents: 0 });
  const [allStudents, setAllStudents] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]); 
  const [allTransactions, setAllTransactions] = useState([]);
  const [allBooks, setAllBooks] = useState([]); 
  const [overdueBooks, setOverdueBooks] = useState([]);
  
  // FILTERS
  const [filterText, setFilterText] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [studentFilterYear, setStudentFilterYear] = useState("");
  const [studentFilterDept, setStudentFilterDept] = useState("");
  const [studentFilterHostel, setStudentFilterHostel] = useState("");

  const departments = ['Information Technology', 'Computer Science Engineering', 'Electronics and Comm. (ECE)', 'Electrical and Electronics (EEE)', 'Mechanical Engineering', 'Civil Engineering', 'Bio-Medical Engineering', 'M.Sc Computer Science', 'M.Sc Electronic Media', 'M.Sc Mathematics', 'Manufacturing Engineering', 'Printing Technology', 'Mining Engineering'];
  const hostelBlocks = ['Malligai', 'Mullai', 'Marutham', 'Kuroushi', 'Kavery', 'Krishna', 'Titan', 'Pothigai', 'Amaravathi', 'Sagar', 'Swarna', 'NRI Block'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

  // --- INIT ---
  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminData');
    if (storedAdmin) { setAdminData(JSON.parse(storedAdmin)); } else { navigate('/'); }
  }, [navigate]);

  const loadStats = async () => {
      try {
          const res = await axios.get('https://hostel-library-book-management.onrender.com/api/transactions/report');
          setStats({ totalBooks: res.data.totalBooks, issuedBooks: res.data.issuedBooks, returnedBooks: 0, totalStudents: res.data.totalStudents });
      } catch (err) { console.log(err); }
  };

  const fetchAllData = async () => {
      try {
          const resStudents = await axios.get('https://hostel-library-book-management.onrender.com/api/auth/all-students');
          setAllStudents(resStudents.data);
          
          const resAdmins = await axios.get('https://hostel-library-book-management.onrender.com/api/auth/all-admins');
          setAllAdmins(resAdmins.data);

          const resTrans = await axios.get('https://hostel-library-book-management.onrender.com/api/transactions/all-history');
          
          // 🟢 SAFETY FIX: Filter out "Ghost" transactions where the student or book was deleted
          const validTransactions = resTrans.data.filter(t => t.bookId && t.studentId);
          setAllTransactions(validTransactions);

          const resBooks = await axios.get('https://hostel-library-book-management.onrender.com/api/books/search?q=');
          setAllBooks(resBooks.data);

          const overdue = validTransactions.filter(t => t.status === 'Issued' && new Date() > new Date(t.dueDate));
          setOverdueBooks(overdue);
      } catch (err) { console.log(err); }
  };

  useEffect(() => { if (view === 'report' || view === 'manageAdmins') { loadStats(); fetchAllData(); } }, [view]);

  // --- ACTIONS ---
  const handleCreateAdmin = async () => {
      if (!newAdmin.gender) return alert("Please select gender");
      try {
          await axios.post('https://hostel-library-book-management.onrender.com/api/auth/create-admin', newAdmin);
          alert("New Admin created successfully!");
          setNewAdmin({ name: '', rollNo: '', password: '', gender: '' });
      } catch (err) { alert(err.response?.data || "Error creating admin"); }
  };

  const handleDeleteUser = async (id, type) => {
      if(window.confirm(`Are you sure you want to delete this ${type}?`)) {
          try {
              await axios.delete(`https://hostel-library-book-management.onrender.com/api/auth/delete/${id}`);
              alert(`${type} Deleted`);
              fetchAllData(); 
          } catch(err) { alert(`Error deleting ${type}`); }
      }
  };

  const handleIssue = async () => {
    setMessage({ type: '', text: '' });
    try {
        const res = await axios.post('https://hostel-library-book-management.onrender.com/api/transactions/issue-direct', issueData);
        setMessage({ type: 'success', text: `✅ Issued "${res.data.book}" to ${res.data.student}` });
        setIssueData({ rollNo: '', accessionNumber: '' });
        loadStats(); fetchAllData();
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || "Error issuing book" }); }
  };

  const handleReturn = async () => {
    setMessage({ type: '', text: '' });
    try {
        const res = await axios.post('https://hostel-library-book-management.onrender.com/api/transactions/return-direct', { accessionNumber: returnAccession });
        setMessage({ type: 'success', text: `✅ Returned "${res.data.book}" from ${res.data.student}` });
        setReturnAccession(''); 
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || "Error returning book" }); }
  };

  const handleAddBook = async () => {
    try {
      await axios.post('https://hostel-library-book-management.onrender.com/api/books/add', newBook);
      alert('Book Added!');
      setNewBook({ accessionNumber: '', title: '', author: '', totalCopies: 1 });
    } catch (err) { alert('Error adding book'); }
  };

  // --- PDF EXPORT LOGIC ---
  const generatePDFHeader = async (doc, title) => {
      const img = new Image();
      img.src = '/ech-logo.png';
      await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; 
      });
      try { doc.addImage(img, 'PNG', 14, 10, 16, 16); } catch (e) { console.log(e); }
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Engineering College Hostels Library, CEG", 35, 18);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`${title} - Generated on: ${new Date().toLocaleDateString()}`, 35, 25);
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    await generatePDFHeader(doc, "Library Statistics Report");
    const tableColumn = ["Book Title", "Student Name", "Roll No", "Issue Date", "Status"];
    const tableRows = allTransactions.map(t => [ t.bookId?.title || 'Deleted Book', t.studentId?.name || 'Deleted User', t.studentId?.rollNo || 'N/A', new Date(t.issueDate).toLocaleDateString(), t.status ]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 35, theme: 'grid', headStyles: { fillColor: [25, 118, 210] } });
    doc.save(`ECH_Library_Report.pdf`);
  };

  const exportStudentsToPDF = async () => {
    const doc = new jsPDF();
    await generatePDFHeader(doc, "Student Database Report");
    const tableColumn = ["Name", "Roll No", "Gender", "Dept", "Year", "Hostel", "Phone"];
    const tableRows = getFilteredStudents().map(s => [ s.name, s.rollNo, s.gender, s.department, s.year, `${s.hostelBlock}-${s.roomNo}`, s.phoneNumber ]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 35, theme: 'grid', headStyles: { fillColor: [25, 118, 210] } });
    doc.save(`ECH_Students_List.pdf`);
  };

  const exportTransactionsToPDF = async () => {
    const doc = new jsPDF();
    const isIssued = reportSubView === 'issuedList';
    await generatePDFHeader(doc, isIssued ? "Currently Issued Books" : "Returned Books History");
    const tableColumn = ["Book Title", "Student Name", "Issue Date", isIssued ? "Due Date" : "Return Date", "Status"];
    const tableRows = getFilteredTransactions(isIssued ? 'Issued' : 'Returned').map(t => [ t.bookId?.title || 'Deleted Book', `${t.studentId?.name || 'Deleted'} (${t.studentId?.rollNo || 'N/A'})`, new Date(t.issueDate).toLocaleDateString(), new Date(isIssued ? t.dueDate : t.returnDate).toLocaleDateString(), t.status ]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 35, theme: 'grid', headStyles: { fillColor: [25, 118, 210] } });
    doc.save(`ECH_${isIssued ? 'Issued' : 'Returned'}_Books.pdf`);
  };

  // --- FILTERS ---
  const getFilteredTransactions = (status) => {
      return allTransactions.filter(t => {
          const matchesStatus = t.status === status;
          const matchesText = filterText === "" || t.bookId?.title.toLowerCase().includes(filterText.toLowerCase()) || t.studentId?.name.toLowerCase().includes(filterText.toLowerCase());
          const matchesDate = filterDate === "" || new Date(t.issueDate).toISOString().slice(0,10) === filterDate;
          return matchesStatus && matchesText && matchesDate;
      });
  };

  const getFilteredStudents = () => {
      return allStudents.filter(s => {
          return (studentFilterYear === "" || s.year === studentFilterYear) && (studentFilterDept === "" || s.department === studentFilterDept) && (studentFilterHostel === "" || s.hostelBlock === studentFilterHostel);
      });
  };

  const primaryBlue = '#1976d2';

  const MenuCard = ({ title, icon, onClick }) => (
    <Paper elevation={4} onClick={onClick} sx={{ 
          width: '240px', height: '160px', padding: '15px', textAlign: 'center', cursor: 'pointer', backgroundColor: primaryBlue, color: 'white',
          borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '&:hover': { transform: 'scale(1.05)', transition: '0.3s' }
      }}>
        {icon}
        <Typography variant="subtitle1" sx={{ marginTop: '10px', fontWeight: 'bold', fontSize: '1.1rem' }}>{title}</Typography>
    </Paper>
  );

  const StatCard = ({ title, count, onClick }) => (
      <Card sx={{ 
          width: '220px', height: '140px', backgroundColor: primaryBlue, color: 'white', cursor: 'pointer', textAlign: 'center', padding: '15px', 
          borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: 3 
      }} onClick={onClick}>
          <Typography variant="h3" fontWeight="bold">{count}</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{title}</Typography>
      </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f9', paddingBottom: '50px' }}>
      <Box sx={{ backgroundColor: primaryBlue, color: 'white', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 3, mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Admin Dashboard</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: '500', opacity: 0.9 }}>👤 Welcome, {adminData ? adminData.name : 'Admin'}</Typography>
          </Box>
          <Button color="inherit" variant="outlined" sx={{ borderColor: 'white' }} onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</Button>
      </Box>

      <Container maxWidth="xl">
          {view === 'home' && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4, maxWidth: '1000px', margin: '0 auto' }}>
                <MenuCard title="Student Details" icon={<PersonSearchIcon sx={{ fontSize: 50 }} />} onClick={() => setView('studentDetails')} />
                <MenuCard title="Search Books" icon={<LibraryBooksIcon sx={{ fontSize: 50 }} />} onClick={() => setView('searchBooks')} />
                <MenuCard title="Issue Book" icon={<UploadFileIcon sx={{ fontSize: 50 }} />} onClick={() => setView('issue')} />
                <MenuCard title="Return Book" icon={<AssignmentReturnIcon sx={{ fontSize: 50 }} />} onClick={() => setView('return')} />
                <MenuCard title="Add New Book" icon={<AddCircleIcon sx={{ fontSize: 50 }} />} onClick={() => setView('addBook')} />
                <MenuCard title="Library Report" icon={<AssessmentIcon sx={{ fontSize: 50 }} />} onClick={() => { setView('report'); setReportSubView('dashboard'); }} />
                <MenuCard title="Manage Admins" icon={<SupervisorAccountIcon sx={{ fontSize: 50 }} />} onClick={() => setView('manageAdmins')} />
            </Box>
          )}

          {/* VIEW: MANAGE ADMINS */}
          {view === 'manageAdmins' && (
              <Box sx={{ maxWidth: '900px', margin: '0 auto' }}>
                  <Button startIcon={<ArrowBackIcon />} onClick={() => setView('home')} variant="outlined" sx={{ mb: 2 }}>Back</Button>
                  
                  <Paper elevation={3} sx={{ padding: '30px', borderRadius: '15px', mb: 4 }}>
                      <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>Create New Admin</Typography>
                      <Box display="flex" gap={2} mt={2}>
                          <TextField label="Admin Name" fullWidth value={newAdmin.name} onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})} />
                          <TextField label="Admin ID (10 Digits)" fullWidth value={newAdmin.rollNo} onChange={(e) => setNewAdmin({...newAdmin, rollNo: e.target.value})} inputProps={{ maxLength: 10 }} />
                      </Box>
                      <Box display="flex" gap={2} mt={2}>
                          <TextField select label="Gender" fullWidth value={newAdmin.gender} onChange={(e) => setNewAdmin({...newAdmin, gender: e.target.value})}>
                              <MenuItem value="Female">Female</MenuItem><MenuItem value="Male">Male</MenuItem>
                          </TextField>
                          <TextField label="Password" type="password" fullWidth value={newAdmin.password} onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})} />
                      </Box>
                      <Button variant="contained" color="primary" fullWidth sx={{ mt: 3, fontWeight: 'bold' }} onClick={handleCreateAdmin}>Create Admin</Button>
                  </Paper>

                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Current Admins</Typography>
                  <TableContainer component={Paper}>
                      <Table>
                          <TableHead sx={{ backgroundColor: '#f5f5f5' }}><TableRow><TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Admin ID</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell></TableRow></TableHead>
                          <TableBody>
                              {allAdmins.map(a => (
                                  <TableRow key={a._id}>
                                      <TableCell>{a.name}</TableCell>
                                      <TableCell>{a.rollNo}</TableCell>
                                      <TableCell>
                                          <IconButton color="error" onClick={() => handleDeleteUser(a._id, 'Admin')} disabled={a.name === 'Super Admin'}><DeleteIcon /></IconButton>
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </TableContainer>
              </Box>
          )}

          {/* VIEW: REPORT */}
          {view === 'report' && (
              <Box>
                  <Box display="flex" justifyContent="space-between" mb={3}>
                      <Button startIcon={<ArrowBackIcon />} onClick={() => setView('home')} variant="outlined">Back to Menu</Button>
                  </Box>

                  {reportSubView === 'dashboard' && (
                      <>
                          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333', textAlign: 'center', mb: 3 }}>Library Statistics</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3, mb: 5 }}>
                              <StatCard title="Total Books" count={stats.totalBooks} onClick={() => setReportSubView('bookList')} />
                              <StatCard title="Issued Books" count={stats.issuedBooks} onClick={() => setReportSubView('issuedList')} />
                              <StatCard title="Returned Books" count={allTransactions.filter(t=>t.status==='Returned').length} onClick={() => setReportSubView('returnedList')} />
                              <StatCard title="Students" count={stats.totalStudents} onClick={() => setReportSubView('studentList')} />
                          </Box>

                          <Box mt={4} sx={{ maxWidth: '1000px', margin: '0 auto' }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                  <Typography variant="h6" color="error" sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}><WarningIcon sx={{ mr: 1 }} /> Overdue Notifications ({overdueBooks.length})</Typography>
                                  <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={exportToPDF}>Download Full Report (PDF)</Button>
                              </Box>
                              <TableContainer component={Paper} sx={{ mt: 2, border: '1px solid #f44336' }}>
                                  <Table>
                                      <TableHead sx={{ backgroundColor: '#ffebee' }}><TableRow><TableCell>Student</TableCell><TableCell>Book</TableCell><TableCell>Due Date</TableCell><TableCell>Days Overdue</TableCell></TableRow></TableHead>
                                      <TableBody>
                                          {overdueBooks.map((t) => {
                                              const daysOver = Math.floor((new Date() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24));
                                              return (<TableRow key={t._id}><TableCell>{t.studentId?.name} ({t.studentId?.rollNo})</TableCell><TableCell>{t.bookId?.title}</TableCell><TableCell sx={{ color: 'red', fontWeight: 'bold' }}>{new Date(t.dueDate).toLocaleDateString()}</TableCell><TableCell sx={{ color: 'red', fontWeight: 'bold' }}>{daysOver} Days Overdue</TableCell></TableRow>)
                                          })}
                                          {overdueBooks.length === 0 && <TableRow><TableCell colSpan={4} align="center">No overdue books!</TableCell></TableRow>}
                                      </TableBody>
                                  </Table>
                              </TableContainer>
                          </Box>
                      </>
                  )}

                  {reportSubView === 'bookList' && (
                      <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}>
                          <Button variant="outlined" onClick={() => setReportSubView('dashboard')} sx={{ mb: 2 }}>&lt; Back to Stats</Button>
                          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Full Book Database</Typography>
                          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                              <Table stickyHeader>
                                  <TableHead><TableRow><TableCell sx={{ fontWeight: 'bold' }}>Accession No</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Author</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Copies</TableCell></TableRow></TableHead>
                                  <TableBody>{allBooks.map(b => (<TableRow key={b._id}><TableCell>{b.accessionNumber}</TableCell><TableCell>{b.title}</TableCell><TableCell>{b.author}</TableCell><TableCell>{b.availableCopies} / {b.totalCopies}</TableCell></TableRow>))}</TableBody>
                              </Table>
                          </TableContainer>
                      </Box>
                  )}

                  {reportSubView === 'studentList' && (
                      <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
                          <Button variant="outlined" onClick={() => setReportSubView('dashboard')} sx={{ mb: 2 }}>&lt; Back to Stats</Button>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Registered Students Database</Typography>
                              <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={exportStudentsToPDF}>Download Filtered Students (PDF)</Button>
                          </Box>
                          <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                              <Typography variant="subtitle2" color="textSecondary" sx={{ width: '100%' }}>Filter Database By:</Typography>
                              <TextField select label="Year" value={studentFilterYear} onChange={(e) => setStudentFilterYear(e.target.value)} sx={{ minWidth: 150 }}><MenuItem value="">All Years</MenuItem>{years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}</TextField>
                              <TextField select label="Department" value={studentFilterDept} onChange={(e) => setStudentFilterDept(e.target.value)} sx={{ minWidth: 200 }}><MenuItem value="">All Departments</MenuItem>{departments.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}</TextField>
                              <TextField select label="Hostel Block" value={studentFilterHostel} onChange={(e) => setStudentFilterHostel(e.target.value)} sx={{ minWidth: 150 }}><MenuItem value="">All Hostels</MenuItem>{hostelBlocks.map(h => <MenuItem key={h} value={h}>{h}</MenuItem>)}</TextField>
                              <Button variant="outlined" onClick={() => { setStudentFilterYear(""); setStudentFilterDept(""); setStudentFilterHostel(""); }} sx={{ height: '56px' }}>Clear</Button>
                          </Paper>
                          <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                              <Table stickyHeader>
                                  <TableHead><TableRow><TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Roll No</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Gender</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Dept & Year</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Hostel</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell></TableRow></TableHead>
                                  <TableBody>
                                      {getFilteredStudents().map(s => (<TableRow key={s._id}><TableCell>{s.name}</TableCell><TableCell>{s.rollNo}</TableCell><TableCell>{s.gender}</TableCell><TableCell>{s.department} ({s.year})</TableCell><TableCell>{s.hostelBlock} - {s.roomNo}</TableCell><TableCell><IconButton color="error" onClick={() => handleDeleteUser(s._id, 'Student')}><DeleteIcon /></IconButton></TableCell></TableRow>))}
                                      {getFilteredStudents().length === 0 && <TableRow><TableCell colSpan={6} align="center">No students found matching filters.</TableCell></TableRow>}
                                  </TableBody>
                              </Table>
                          </TableContainer>
                      </Box>
                  )}

                  {(reportSubView === 'issuedList' || reportSubView === 'returnedList') && (
                      <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}>
                          <Button variant="outlined" onClick={() => setReportSubView('dashboard')} sx={{ mb: 2 }}>&lt; Back to Stats</Button>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{reportSubView === 'issuedList' ? "Currently Issued Books" : "Returned Books History"}</Typography>
                              <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={exportTransactionsToPDF}>Download {reportSubView === 'issuedList' ? "Issued" : "Returned"} PDF</Button>
                          </Box>
                          <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
                              <TextField label="Filter by Name or Book" fullWidth value={filterText} onChange={(e) => setFilterText(e.target.value)} />
                              <TextField type="date" label="Filter Date" InputLabelProps={{ shrink: true }} value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                              <Button variant="outlined" onClick={() => { setFilterText(""); setFilterDate(""); }}>Clear</Button>
                          </Paper>
                          <TableContainer component={Paper}>
                              <Table>
                                  <TableHead><TableRow><TableCell sx={{ fontWeight: 'bold' }}>Book Title</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Issue Date</TableCell><TableCell sx={{ fontWeight: 'bold' }}>{reportSubView === 'issuedList' ? "Due Date" : "Return Date"}</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell></TableRow></TableHead>
                                  <TableBody>
                                      {getFilteredTransactions(reportSubView === 'issuedList' ? 'Issued' : 'Returned').map(t => (<TableRow key={t._id}><TableCell>{t.bookId?.title}</TableCell><TableCell>{t.studentId?.name} ({t.studentId?.rollNo})</TableCell><TableCell>{new Date(t.issueDate).toLocaleDateString()}</TableCell><TableCell sx={{ fontWeight: 'bold' }}>{new Date(reportSubView === 'issuedList' ? t.dueDate : t.returnDate).toLocaleDateString()}</TableCell><TableCell>{t.status === 'Issued' && new Date() > new Date(t.dueDate) ? <Chip label="OVERDUE" color="error" size="small" sx={{ fontWeight: 'bold' }} /> : <Chip label={t.status} color={t.status === 'Issued' ? "warning" : "success"} size="small" sx={{ fontWeight: 'bold' }} />}</TableCell></TableRow>))}
                                  </TableBody>
                              </Table>
                          </TableContainer>
                      </Box>
                  )}
              </Box>
          )}

          {/* VIEW: STUDENT DETAILS (SEARCH) */}
          {view === 'studentDetails' && (
              <Box sx={{ maxWidth: '900px', margin: '0 auto' }}>
                  <Button startIcon={<ArrowBackIcon />} onClick={() => setView('home')} variant="outlined" sx={{ mb: 2 }}>Back</Button>
                  <Paper sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Search Student Profile</Typography>
                      <Box display="flex" gap={2}>
                          <TextField label="Enter Student Roll Number (10 Digits)" fullWidth value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
                          <Button variant="contained" size="large" onClick={async () => {
                              try {
                                  const res = await axios.get(`https://hostel-library-book-management.onrender.com/api/auth/student/${studentSearch}`);
                                  setStudentResult(res.data);
                                  const resBooks = await axios.get(`https://hostel-library-book-management.onrender.com/api/transactions/student-active/${res.data._id}`);
                                  setStudentBooks(resBooks.data);
                              } catch (err) { alert("Student not found. Please check the Roll Number."); }
                          }}>Search</Button>
                      </Box>
                  </Paper>

                  {studentResult && (
                      <Box sx={{ marginTop: '30px' }}>
                          <Paper elevation={4} sx={{ width: '100%', borderRadius: '15px', overflow: 'hidden', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                              <Box sx={{ width: { xs: '100%', md: '35%' }, backgroundColor: primaryBlue, color: 'white', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                  <Avatar sx={{ width: 120, height: 120, border: '4px solid white', fontSize: '3rem', bgcolor: '#0d47a1', marginBottom: '20px' }}>{studentResult.name.charAt(0)}</Avatar>
                                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{studentResult.name}</Typography>
                                  <Typography variant="subtitle1" sx={{ opacity: 0.9, marginBottom: '20px' }}>{studentResult.rollNo}</Typography>
                                  <Chip label="Active Student" sx={{ backgroundColor: 'white', color: primaryBlue, fontWeight: 'bold' }} />
                              </Box>
                              <Box sx={{ width: { xs: '100%', md: '65%' }, backgroundColor: 'white', padding: '40px' }}>
                                  <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', marginBottom: '25px' }}>General Information</Typography>
                                  <Grid container spacing={3}>
                                      <Grid item xs={12} sm={6}><Box display="flex" alignItems="center" mb={1}><PersonIcon color="action" sx={{ mr: 1, fontSize: 20 }} /><Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>GENDER</Typography></Box><Typography variant="body1" sx={{ fontWeight: '500' }}>{studentResult.gender}</Typography></Grid>
                                      <Grid item xs={12} sm={6}><Box display="flex" alignItems="center" mb={1}><SchoolIcon color="action" sx={{ mr: 1, fontSize: 20 }} /><Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>DEPARTMENT</Typography></Box><Typography variant="body1" sx={{ fontWeight: '500' }}>{studentResult.department}</Typography></Grid>
                                      <Grid item xs={12} sm={6}><Box display="flex" alignItems="center" mb={1}><CalendarTodayIcon color="action" sx={{ mr: 1, fontSize: 20 }} /><Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>YEAR</Typography></Box><Typography variant="body1" sx={{ fontWeight: '500' }}>{studentResult.year}</Typography></Grid>
                                      <Grid item xs={12} sm={6}><Box display="flex" alignItems="center" mb={1}><EmailIcon color="action" sx={{ mr: 1, fontSize: 20 }} /><Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>EMAIL ID</Typography></Box><Typography variant="body1" sx={{ fontWeight: '500' }}>{studentResult.email}</Typography></Grid>
                                      <Grid item xs={12} sm={6}><Box display="flex" alignItems="center" mb={1}><PhoneIcon color="action" sx={{ mr: 1, fontSize: 20 }} /><Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>PHONE NUMBER</Typography></Box><Typography variant="body1" sx={{ fontWeight: '500' }}>{studentResult.phoneNumber}</Typography></Grid>
                                      <Grid item xs={12} sm={6}><Box display="flex" alignItems="center" mb={1}><HomeIcon color="action" sx={{ mr: 1, fontSize: 20 }} /><Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>HOSTEL LOCATION</Typography></Box><Typography variant="body1" sx={{ fontWeight: '500' }}>{studentResult.hostelBlock} - Room {studentResult.roomNo}</Typography></Grid>
                                  </Grid>
                              </Box>
                          </Paper>
                          <Typography variant="h5" sx={{ marginTop: '30px', marginBottom: '15px', fontWeight: 'bold', color: '#333' }}>Currently Borrowed Books</Typography>
                          {studentBooks.length > 0 ? (
                              <TableContainer component={Paper} elevation={3} sx={{ borderRadius: '15px' }}>
                                  <Table>
                                      <TableHead sx={{ backgroundColor: '#f5f5f5' }}><TableRow><TableCell sx={{ fontWeight: 'bold' }}>Book Title</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Issue Date</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell></TableRow></TableHead>
                                      <TableBody>
                                          {studentBooks.map(b => (<TableRow key={b._id}><TableCell sx={{ fontWeight: 'bold' }}>{b.bookId.title}</TableCell><TableCell>{new Date(b.issueDate).toLocaleDateString()}</TableCell><TableCell>{new Date(b.dueDate).toLocaleDateString()}</TableCell><TableCell>{new Date() > new Date(b.dueDate) ? <Chip label="OVERDUE" color="error" size="small" sx={{ fontWeight: 'bold' }} /> : <Chip label="Active" color="success" size="small" sx={{ fontWeight: 'bold' }} />}</TableCell></TableRow>))}
                                      </TableBody>
                                  </Table>
                              </TableContainer>
                          ) : ( <Alert severity="info" sx={{ borderRadius: '10px' }}>This student does not have any active borrowed books.</Alert> )}
                      </Box>
                  )}
              </Box>
          )}

          {/* VIEW: SEARCH BOOKS */}
          {view === 'searchBooks' && (
              <Box sx={{ maxWidth: '900px', margin: '0 auto' }}>
                  <Button startIcon={<ArrowBackIcon />} onClick={() => setView('home')} variant="outlined" sx={{ mb: 2 }}>Back</Button>
                  <Paper sx={{ padding: '30px', borderRadius: '15px', boxShadow: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Search Digital Catalog</Typography>
                      <Box display="flex" gap={2}>
                          <TextField label="Search by Book Title or Author" fullWidth value={bookQuery} onChange={(e) => setBookQuery(e.target.value)} />
                          <Button variant="contained" size="large" onClick={async () => { 
                              try { 
                                  const res = await axios.get(`https://hostel-library-book-management.onrender.com/api/books/search?q=${bookQuery}`); 
                                  setBookResults(res.data); 
                                  setHasSearchedBooks(true); // 🟢 FLAG SET HERE
                              } catch (err) { console.log(err); } 
                          }}>Search</Button>
                      </Box>

                      {/* 🟢 ERROR MESSAGE ADDED HERE */}
                      {hasSearchedBooks && bookResults.length === 0 && (
                          <Alert severity="error" sx={{ marginTop: '20px', borderRadius: '10px' }}>
                              No books found matching your search.
                          </Alert>
                      )}

                      {bookResults.length > 0 && (
                          <TableContainer sx={{ marginTop: '30px', border: '1px solid #e0e0e0', borderRadius: '10px' }}>
                              <Table>
                                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}><TableRow><TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Author</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Accession No</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Availability</TableCell></TableRow></TableHead>
                                  <TableBody>{bookResults.map((b) => (<TableRow key={b._id}><TableCell sx={{ fontWeight: 'bold' }}>{b.title}</TableCell><TableCell>{b.author}</TableCell><TableCell>{b.accessionNumber}</TableCell><TableCell>{b.availableCopies > 0 ? <Chip label={`${b.availableCopies} Copies`} color="success" size="small" sx={{ fontWeight: 'bold' }} /> : <Chip label="Not Available" color="error" size="small" sx={{ fontWeight: 'bold' }} />}</TableCell></TableRow>))}</TableBody>
                              </Table>
                          </TableContainer>
                      )}
                  </Paper>
              </Box>
          )}

          {view === 'addBook' && (
              <Box maxWidth="sm" mx="auto">
                  <Button startIcon={<ArrowBackIcon />} onClick={() => setView('home')} variant="outlined" sx={{ mb: 2 }}>Back</Button>
                  <Paper elevation={3} sx={{ padding: '30px', borderRadius: '15px' }}>
                      <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>Add New Book to Catalog</Typography>
                      <TextField label="Accession Number" fullWidth margin="normal" value={newBook.accessionNumber} onChange={(e) => setNewBook({...newBook, accessionNumber: e.target.value})} />
                      <TextField label="Book Title" fullWidth margin="normal" value={newBook.title} onChange={(e) => setNewBook({...newBook, title: e.target.value})} />
                      <TextField label="Author" fullWidth margin="normal" value={newBook.author} onChange={(e) => setNewBook({...newBook, author: e.target.value})} />
                      <TextField label="Total Copies" type="number" fullWidth margin="normal" value={newBook.totalCopies} onChange={(e) => setNewBook({...newBook, totalCopies: e.target.value})} />
                      <Button variant="contained" color="primary" fullWidth size="large" sx={{ marginTop: '20px', fontWeight: 'bold' }} onClick={handleAddBook}>Add to Library</Button>
                  </Paper>
              </Box>
          )}
          {view === 'issue' && (
              <Box maxWidth="sm" mx="auto">
                  <Button startIcon={<ArrowBackIcon />} onClick={() => { setView('home'); setMessage({type:'', text:''}) }} variant="outlined" sx={{ mb: 2 }}>Back</Button>
                  <Paper elevation={3} sx={{ padding: '30px', borderRadius: '15px' }}>
                      <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>Issue Book</Typography>
                      {message.text && <Alert severity={message.type} sx={{ marginBottom: '15px', borderRadius: '10px' }}>{message.text}</Alert>}
                      <TextField label="Student Roll Number" fullWidth margin="normal" value={issueData.rollNo} onChange={(e) => setIssueData({...issueData, rollNo: e.target.value})} />
                      <TextField label="Book Accession Number" fullWidth margin="normal" value={issueData.accessionNumber} onChange={(e) => setIssueData({...issueData, accessionNumber: e.target.value})} />
                      <Button variant="contained" color="primary" fullWidth size="large" sx={{ marginTop: '20px', fontWeight: 'bold' }} onClick={handleIssue}>Confirm Issue</Button>
                  </Paper>
              </Box>
          )}
          {view === 'return' && (
              <Box maxWidth="sm" mx="auto">
                  <Button startIcon={<ArrowBackIcon />} onClick={() => { setView('home'); setMessage({type:'', text:''}) }} variant="outlined" sx={{ mb: 2 }}>Back</Button>
                  <Paper elevation={3} sx={{ padding: '30px', borderRadius: '15px' }}>
                      <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>Return Book</Typography>
                      {message.text && <Alert severity={message.type} sx={{ marginBottom: '15px', borderRadius: '10px' }}>{message.text}</Alert>}
                      <TextField label="Book Accession Number" fullWidth margin="normal" value={returnAccession} onChange={(e) => setReturnAccession(e.target.value)} />
                      <Button variant="contained" color="primary" fullWidth size="large" sx={{ marginTop: '20px', fontWeight: 'bold' }} onClick={handleReturn}>Confirm Return</Button>
                  </Paper>
              </Box>
          )}
      </Container>
    </Box>
  );
}

export default AdminDashboard;