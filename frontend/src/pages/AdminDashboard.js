import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Paper, TextField, Button, Typography, Grid, Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, Divider, IconButton, Chip, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState('home'); 
  const [reportSubView, setReportSubView] = useState('dashboard'); 
  const [message, setMessage] = useState({ type: '', text: '' });

  // STATES
  const [issueData, setIssueData] = useState({ rollNo: '', accessionNumber: '' });
  const [returnAccession, setReturnAccession] = useState('');
  const [newBook, setNewBook] = useState({ accessionNumber: '', title: '', author: '', totalCopies: 1 });
  
  // Student Search States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentResult, setStudentResult] = useState(null); 
  const [studentBooks, setStudentBooks] = useState([]);     

  // Book Search States
  const [bookQuery, setBookQuery] = useState('');
  const [bookResults, setBookResults] = useState([]);

  // REPORT DATA STATES
  const [stats, setStats] = useState({ totalBooks: 0, issuedBooks: 0, returnedBooks: 0, totalStudents: 0 });
  const [allStudents, setAllStudents] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [allBooks, setAllBooks] = useState([]); 
  const [overdueBooks, setOverdueBooks] = useState([]);
  
  // FILTERS
  const [filterText, setFilterText] = useState("");
  const [filterDate, setFilterDate] = useState("");


  // --- API CALLS ---

  const loadStats = async () => {
      try {
          const res = await axios.get('http://localhost:5000/api/transactions/report');
          setStats({
              totalBooks: res.data.totalBooks,
              issuedBooks: res.data.issuedBooks,
              returnedBooks: 0, 
              totalStudents: res.data.totalStudents
          });
      } catch (err) { console.log(err); }
  };

  const fetchAllData = async () => {
      try {
          const resStudents = await axios.get('http://localhost:5000/api/auth/all-students');
          setAllStudents(resStudents.data);

          const resTrans = await axios.get('http://localhost:5000/api/transactions/all-history');
          setAllTransactions(resTrans.data);

          const resBooks = await axios.get('http://localhost:5000/api/books/search?q=');
          setAllBooks(resBooks.data);

          const overdue = resTrans.data.filter(t => t.status === 'Issued' && new Date() > new Date(t.dueDate));
          setOverdueBooks(overdue);
      } catch (err) { console.log(err); }
  };

  useEffect(() => {
      if (view === 'report') {
          loadStats();
          fetchAllData();
      }
  }, [view]);


  // --- ACTIONS ---

  const handleDeleteStudent = async (id) => {
      if(window.confirm("Are you sure you want to delete this student?")) {
          try {
              await axios.delete(`http://localhost:5000/api/auth/delete/${id}`);
              alert("Student Deleted");
              fetchAllData(); 
          } catch(err) { alert("Error deleting student"); }
      }
  };

  const handleIssue = async () => {
    setMessage({ type: '', text: '' });
    try {
        const res = await axios.post('http://localhost:5000/api/transactions/issue-direct', issueData);
        setMessage({ type: 'success', text: `✅ Issued "${res.data.book}" to ${res.data.student}` });
        setIssueData({ rollNo: '', accessionNumber: '' });
        
        // 🟢 FORCE RELOAD DATA
        loadStats();
        fetchAllData();

    } catch (err) {
        setMessage({ type: 'error', text: err.response?.data?.message || "Error issuing book" });
    }
  };

  const handleReturn = async () => {
    setMessage({ type: '', text: '' });
    try {
        const res = await axios.post('http://localhost:5000/api/transactions/return-direct', { accessionNumber: returnAccession });
        setMessage({ type: 'success', text: `✅ Returned "${res.data.book}" from ${res.data.student}` });
        setReturnAccession(''); 
    } catch (err) {
        setMessage({ type: 'error', text: err.response?.data?.message || "Error returning book" });
    }
  };

  const handleAddBook = async () => {
    try {
      await axios.post('http://localhost:5000/api/books/add', newBook);
      alert('Book Added!');
      setNewBook({ accessionNumber: '', title: '', author: '', totalCopies: 1 });
    } catch (err) { alert('Error adding book'); }
  };

  const getFilteredTransactions = (status) => {
      return allTransactions.filter(t => {
          const matchesStatus = t.status === status;
          const matchesText = filterText === "" || 
              t.bookId?.title.toLowerCase().includes(filterText.toLowerCase()) || 
              t.bookId?.author.toLowerCase().includes(filterText.toLowerCase()) ||
              t.studentId?.name.toLowerCase().includes(filterText.toLowerCase());
          
          const matchesDate = filterDate === "" || 
              new Date(t.issueDate).toISOString().slice(0,10) === filterDate;

          return matchesStatus && matchesText && matchesDate;
      });
  };


  // --- COMPONENTS ---

  const MenuCard = ({ title, icon, color, onClick }) => (
    <Paper 
      elevation={4} 
      onClick={onClick}
      sx={{ 
          padding: '30px', 
          textAlign: 'center', 
          cursor: 'pointer', 
          backgroundColor: color, 
          color: 'white',
          borderRadius: '15px',
          height: '180px', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          '&:hover': { transform: 'scale(1.05)', transition: '0.3s' }
      }}
    >
        {icon}
        <Typography variant="h6" sx={{ marginTop: '15px', fontWeight: 'bold' }}>{title}</Typography>
    </Paper>
  );

  const StatCard = ({ title, count, color, onClick }) => (
      <Card sx={{ backgroundColor: color, color: 'white', cursor: 'pointer', textAlign: 'center', padding: '20px', borderRadius: '15px' }} onClick={onClick}>
          <Typography variant="h2" fontWeight="bold">{count}</Typography>
          <Typography variant="subtitle1">{title}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>Click to view details</Typography>
      </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ marginTop: '30px', marginBottom: '50px' }}>
      
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>Admin Dashboard</Typography>
          <Button color="error" variant="outlined" onClick={() => navigate('/')}>Logout</Button>
      </Box>

      {/* 🟢 VIEW: HOME (MENU) */}
      {view === 'home' && (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
          <Grid container spacing={4} sx={{ maxWidth: '1000px', justifyContent: 'center' }}>
            <Grid item xs={12} sm={6} md={4}><MenuCard title="Student Details" color="#1565c0" icon={<PersonSearchIcon sx={{ fontSize: 60 }} />} onClick={() => setView('studentDetails')} /></Grid>
            <Grid item xs={12} sm={6} md={4}><MenuCard title="Search Books" color="#00838f" icon={<LibraryBooksIcon sx={{ fontSize: 60 }} />} onClick={() => setView('searchBooks')} /></Grid>
            <Grid item xs={12} sm={6} md={4}><MenuCard title="Issue Book" color="#2e7d32" icon={<UploadFileIcon sx={{ fontSize: 60 }} />} onClick={() => setView('issue')} /></Grid>
            <Grid item xs={12} sm={6} md={4}><MenuCard title="Return Book" color="#e65100" icon={<AssignmentReturnIcon sx={{ fontSize: 60 }} />} onClick={() => setView('return')} /></Grid>
            <Grid item xs={12} sm={6} md={4}><MenuCard title="Add New Book" color="#4527a0" icon={<AddCircleIcon sx={{ fontSize: 60 }} />} onClick={() => setView('addBook')} /></Grid>
            <Grid item xs={12} sm={6} md={4}><MenuCard title="Library Report" color="#616161" icon={<AssessmentIcon sx={{ fontSize: 60 }} />} onClick={() => { setView('report'); setReportSubView('dashboard'); }} /></Grid>
          </Grid>
        </Box>
      )}

      {/* 🟣 VIEW: REPORT */}
      {view === 'report' && (
          <Box>
              <Button startIcon={<ArrowBackIcon />} onClick={() => setView('home')} sx={{ mb: 2 }}>Back to Menu</Button>

              {/* 1. REPORT DASHBOARD */}
              {reportSubView === 'dashboard' && (
                  <>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Library Statistics</Typography>
                      
                      <Grid container spacing={3}>
                          <Grid item xs={12} md={3}>
                              <StatCard title="Total Books" count={stats.totalBooks} color="#1976d2" onClick={() => setReportSubView('bookList')} />
                          </Grid>
                          <Grid item xs={12} md={3}>
                              <StatCard title="Issued Books" count={stats.issuedBooks} color="#e65100" onClick={() => setReportSubView('issuedList')} />
                          </Grid>
                          <Grid item xs={12} md={3}>
                              <StatCard title="Returned Books" count={allTransactions.filter(t=>t.status==='Returned').length} color="#2e7d32" onClick={() => setReportSubView('returnedList')} />
                          </Grid>
                          <Grid item xs={12} md={3}>
                              <StatCard title="Students" count={stats.totalStudents} color="#5e35b1" onClick={() => setReportSubView('studentList')} />
                          </Grid>
                      </Grid>

                      <Box mt={4}>
                          <Typography variant="h6" color="error" sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                              <WarningIcon sx={{ mr: 1 }} /> Overdue Notifications ({overdueBooks.length})
                          </Typography>
                          <TableContainer component={Paper} sx={{ mt: 2, border: '1px solid red' }}>
                              <Table>
                                  <TableHead sx={{ backgroundColor: '#ffebee' }}>
                                      <TableRow><TableCell>Student</TableCell><TableCell>Book</TableCell><TableCell>Due Date</TableCell><TableCell>Days Overdue</TableCell></TableRow>
                                  </TableHead>
                                  <TableBody>
                                      {overdueBooks.map((t) => {
                                          const daysOver = Math.floor((new Date() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24));
                                          return (
                                              <TableRow key={t._id}>
                                                  <TableCell>{t.studentId?.name} ({t.studentId?.rollNo})</TableCell>
                                                  <TableCell>{t.bookId?.title}</TableCell>
                                                  <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>{new Date(t.dueDate).toLocaleDateString()}</TableCell>
                                                  <TableCell sx={{ color: 'red' }}>{daysOver} Days</TableCell>
                                              </TableRow>
                                          )
                                      })}
                                      {overdueBooks.length === 0 && <TableRow><TableCell colSpan={4} align="center">No overdue books!</TableCell></TableRow>}
                                  </TableBody>
                              </Table>
                          </TableContainer>
                      </Box>
                  </>
              )}

              {/* 🟢 2. BOOK LIST VIEW */}
              {reportSubView === 'bookList' && (
                  <Box>
                      <Button variant="outlined" onClick={() => setReportSubView('dashboard')} sx={{ mb: 2 }}>&lt; Back to Stats</Button>
                      <Typography variant="h5" gutterBottom>Full Book Database ({allBooks.length})</Typography>
                      
                      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                          <Table stickyHeader>
                              <TableHead>
                                  <TableRow><TableCell>Accession No</TableCell><TableCell>Title</TableCell><TableCell>Author</TableCell><TableCell>Copies</TableCell></TableRow>
                              </TableHead>
                              <TableBody>
                                  {allBooks.map(b => (
                                      <TableRow key={b._id}>
                                          <TableCell>{b.accessionNumber}</TableCell>
                                          <TableCell>{b.title}</TableCell>
                                          <TableCell>{b.author}</TableCell>
                                          <TableCell>{b.availableCopies} / {b.totalCopies}</TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      </TableContainer>
                  </Box>
              )}

              {/* 3. STUDENT LIST VIEW */}
              {reportSubView === 'studentList' && (
                  <Box>
                      <Button variant="outlined" onClick={() => setReportSubView('dashboard')} sx={{ mb: 2 }}>&lt; Back to Stats</Button>
                      <Typography variant="h5" gutterBottom>Registered Students ({allStudents.length})</Typography>
                      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                          <Table stickyHeader>
                              <TableHead>
                                  <TableRow><TableCell>Name</TableCell><TableCell>Roll No</TableCell><TableCell>Dept</TableCell><TableCell>Actions</TableCell></TableRow>
                              </TableHead>
                              <TableBody>
                                  {allStudents.map(s => (
                                      <TableRow key={s._id}>
                                          <TableCell>{s.name}</TableCell>
                                          <TableCell>{s.rollNo}</TableCell>
                                          <TableCell>{s.department}</TableCell>
                                          <TableCell>
                                              <IconButton color="error" onClick={() => handleDeleteStudent(s._id)}>
                                                  <DeleteIcon />
                                              </IconButton>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      </TableContainer>
                  </Box>
              )}

              {/* 4. ISSUED / RETURNED LIST VIEWS */}
              {(reportSubView === 'issuedList' || reportSubView === 'returnedList') && (
                  <Box>
                      <Button variant="outlined" onClick={() => setReportSubView('dashboard')} sx={{ mb: 2 }}>&lt; Back to Stats</Button>
                      <Typography variant="h5" gutterBottom>
                          {reportSubView === 'issuedList' ? "Currently Issued Books" : "Returned Books History"}
                      </Typography>

                      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2 }}>
                          <TextField label="Filter by Name, Book or Author" fullWidth value={filterText} onChange={(e) => setFilterText(e.target.value)} />
                          <TextField type="date" label="Filter Date" InputLabelProps={{ shrink: true }} value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                          <Button variant="outlined" onClick={() => { setFilterText(""); setFilterDate(""); }}>Clear</Button>
                      </Paper>

                      <TableContainer component={Paper}>
                          <Table>
                              <TableHead>
                                  <TableRow>
                                      <TableCell>Book Title</TableCell>
                                      <TableCell>Student</TableCell>
                                      <TableCell>Issue Date</TableCell>
                                      <TableCell>{reportSubView === 'issuedList' ? "Due Date" : "Return Date"}</TableCell>
                                  </TableRow>
                              </TableHead>
                              <TableBody>
                                  {getFilteredTransactions(reportSubView === 'issuedList' ? 'Issued' : 'Returned').map(t => (
                                      <TableRow key={t._id}>
                                          <TableCell>{t.bookId?.title}</TableCell>
                                          <TableCell>{t.studentId?.name} ({t.studentId?.rollNo})</TableCell>
                                          <TableCell>{new Date(t.issueDate).toLocaleDateString()}</TableCell>
                                          <TableCell sx={{ fontWeight: 'bold', color: reportSubView === 'issuedList' ? 'red' : 'green' }}>
                                              {new Date(reportSubView === 'issuedList' ? t.dueDate : t.returnDate).toLocaleDateString()}
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      </TableContainer>
                  </Box>
              )}
          </Box>
      )}

      {/* 🔵 VIEW: STUDENT DETAILS (SEARCH) */}
      {view === 'studentDetails' && (
          <Box>
              <Button startIcon={<ArrowBackIcon />} onClick={() => setView('home')}>Back</Button>
              
              <Paper sx={{ padding: '20px', marginTop: '10px', backgroundColor: '#e3f2fd' }}>
                  <Box display="flex" gap={2}>
                      <TextField label="Enter Student Roll Number" fullWidth value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
                      <Button variant="contained" onClick={async () => {
                          try {
                              const res = await axios.get(`http://localhost:5000/api/auth/student/${studentSearch}`);
                              setStudentResult(res.data);
                              const resBooks = await axios.get(`http://localhost:5000/api/transactions/student-active/${res.data._id}`);
                              setStudentBooks(resBooks.data);
                          } catch (err) { alert("Student not found"); }
                      }}>Search</Button>
                  </Box>
              </Paper>

              {/* 🟢 FULL STUDENT PROFILE CARD */}
              {studentResult && (
                  <Container maxWidth="md" sx={{ marginTop: '30px' }}>
                      
                      <Paper elevation={6} sx={{ width: '100%', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                          
                          {/* LEFT SIDE (BLUE) */}
                          <Box sx={{ width: { xs: '100%', md: '35%' }, backgroundColor: '#1565c0', color: 'white', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                              <Avatar sx={{ width: 120, height: 120, border: '4px solid white', fontSize: '3rem', bgcolor: '#0d47a1', marginBottom: '20px' }}>
                                  {studentResult.name.charAt(0)}
                              </Avatar>
                              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{studentResult.name}</Typography>
                              <Typography variant="subtitle1" sx={{ opacity: 0.8, marginBottom: '20px' }}>{studentResult.rollNo}</Typography>
                              <Chip label="Active Student" sx={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 'bold' }} />
                          </Box>

                          {/* RIGHT SIDE (WHITE) */}
                          <Box sx={{ width: { xs: '100%', md: '65%' }, backgroundColor: 'white', padding: '40px' }}>
                              <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', marginBottom: '25px' }}>
                                  General Information
                              </Typography>
                              <Grid container spacing={3}>
                                  <Grid item xs={12} sm={6}>
                                      <Box display="flex" alignItems="center" mb={1}>
                                          <SchoolIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>DEPARTMENT</Typography>
                                      </Box>
                                      <Typography variant="body1" sx={{ fontWeight: '500' }}>{studentResult.department}</Typography>
                                  </Grid>

                                  <Grid item xs={12} sm={6}>
                                      <Box display="flex" alignItems="center" mb={1}>
                                          <CalendarTodayIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>YEAR</Typography>
                                      </Box>
                                      <Typography variant="body1" sx={{ fontWeight: '500' }}>{studentResult.year}</Typography>
                                  </Grid>

                                  <Grid item xs={12} sm={6}>
                                      <Box display="flex" alignItems="center" mb={1}>
                                          <EmailIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>EMAIL ID</Typography>
                                      </Box>
                                      <Typography variant="body1" sx={{ fontWeight: '500' }}>{studentResult.email}</Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                      <Box display="flex" alignItems="center" mb={1}>
                                          <PhoneIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>PHONE NUMBER</Typography>
                                      </Box>
                                      <Typography variant="body1" sx={{ fontWeight: '500' }}>{studentResult.phoneNumber}</Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                      <Box display="flex" alignItems="center" mb={1}>
                                          <HomeIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>HOSTEL LOCATION</Typography>
                                      </Box>
                                      <Typography variant="body1" sx={{ fontWeight: '500' }}>{studentResult.hostelBlock} - Room {studentResult.roomNo}</Typography>
                                  </Grid>
                              </Grid>
                          </Box>
                      </Paper>

                      {/* 🟢 DETAILED BORROWED BOOKS TABLE */}
                      <Typography variant="h5" sx={{ marginTop: '30px', marginBottom: '15px', fontWeight: 'bold', textAlign: 'center' }}>Borrowed Books</Typography>
                      {studentBooks.length > 0 ? (
                          <TableContainer component={Paper} elevation={3}>
                              <Table>
                                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                      <TableRow><TableCell><strong>Book Title</strong></TableCell><TableCell><strong>Issue Date</strong></TableCell><TableCell><strong>Due Date</strong></TableCell><TableCell><strong>Status</strong></TableCell></TableRow>
                                  </TableHead>
                                  <TableBody>
                                      {studentBooks.map(b => (
                                          <TableRow key={b._id}>
                                              <TableCell sx={{ fontWeight: 'bold' }}>{b.bookId.title}</TableCell>
                                              <TableCell>{new Date(b.issueDate).toLocaleDateString()}</TableCell>
                                              <TableCell>{new Date(b.dueDate).toLocaleDateString()}</TableCell>
                                              <TableCell sx={{ color: new Date() > new Date(b.dueDate) ? 'red' : 'green', fontWeight: 'bold' }}>
                                                  {new Date() > new Date(b.dueDate) ? "OVERDUE" : "Active"}
                                              </TableCell>
                                          </TableRow>
                                      ))}
                                  </TableBody>
                              </Table>
                          </TableContainer>
                      ) : (
                          <Alert severity="info" sx={{ justifyContent: 'center' }}>No active borrowed books.</Alert>
                      )}

                  </Container>
              )}
          </Box>
      )}

      {/* 🟣 VIEW: ISSUE BOOK */}
      {view === 'issue' && (
          <Box maxWidth="sm" mx="auto">
              <Button startIcon={<ArrowBackIcon />} onClick={() => { setView('home'); setMessage({type:'', text:''}) }}>Back</Button>
              <Paper elevation={3} sx={{ padding: '30px', marginTop: '10px', borderRadius: '15px' }}>
                  <Typography variant="h5" color="primary" gutterBottom>Issue Book</Typography>
                  {message.text && <Alert severity={message.type} sx={{ marginBottom: '15px' }}>{message.text}</Alert>}
                  <TextField label="Student Roll Number" fullWidth margin="normal" value={issueData.rollNo} onChange={(e) => setIssueData({...issueData, rollNo: e.target.value})} />
                  <TextField label="Book Accession Number" fullWidth margin="normal" value={issueData.accessionNumber} onChange={(e) => setIssueData({...issueData, accessionNumber: e.target.value})} />
                  <Button variant="contained" color="primary" fullWidth size="large" sx={{ marginTop: '20px' }} onClick={handleIssue}>Confirm Issue</Button>
              </Paper>
          </Box>
      )}

      {/* 🟤 VIEW: RETURN BOOK */}
      {view === 'return' && (
          <Box maxWidth="sm" mx="auto">
              <Button startIcon={<ArrowBackIcon />} onClick={() => { setView('home'); setMessage({type:'', text:''}) }}>Back</Button>
              <Paper elevation={3} sx={{ padding: '30px', marginTop: '10px', borderRadius: '15px' }}>
                  <Typography variant="h5" color="warning" gutterBottom>Return Book</Typography>
                  {message.text && <Alert severity={message.type} sx={{ marginBottom: '15px' }}>{message.text}</Alert>}
                  <TextField label="Book Accession Number" fullWidth margin="normal" value={returnAccession} onChange={(e) => setReturnAccession(e.target.value)} />
                  <Button variant="contained" color="warning" fullWidth size="large" sx={{ marginTop: '20px' }} onClick={handleReturn}>Confirm Return</Button>
              </Paper>
          </Box>
      )}

      {/* 🟢 VIEW: ADD BOOK */}
      {view === 'addBook' && (
          <Box maxWidth="sm" mx="auto">
              <Button startIcon={<ArrowBackIcon />} onClick={() => setView('home')}>Back</Button>
              <Paper elevation={3} sx={{ padding: '30px', marginTop: '10px', borderRadius: '15px' }}>
                  <Typography variant="h5" color="success" gutterBottom>Add New Book</Typography>
                  <TextField label="Accession Number" fullWidth margin="normal" value={newBook.accessionNumber} onChange={(e) => setNewBook({...newBook, accessionNumber: e.target.value})} />
                  <TextField label="Book Title" fullWidth margin="normal" value={newBook.title} onChange={(e) => setNewBook({...newBook, title: e.target.value})} />
                  <TextField label="Author" fullWidth margin="normal" value={newBook.author} onChange={(e) => setNewBook({...newBook, author: e.target.value})} />
                  <TextField label="Total Copies" type="number" fullWidth margin="normal" value={newBook.totalCopies} onChange={(e) => setNewBook({...newBook, totalCopies: e.target.value})} />
                  <Button variant="contained" color="success" fullWidth size="large" sx={{ marginTop: '20px' }} onClick={handleAddBook}>Add to Library</Button>
              </Paper>
          </Box>
      )}

      {/* 🟠 VIEW: SEARCH BOOKS */}
      {view === 'searchBooks' && (
          <Box>
              <Button startIcon={<ArrowBackIcon />} onClick={() => setView('home')}>Back</Button>
              <Paper sx={{ padding: '20px', marginTop: '10px' }}>
                  <Box display="flex" gap={2}>
                      <TextField label="Search by Title or Author" fullWidth value={bookQuery} onChange={(e) => setBookQuery(e.target.value)} />
                      <Button variant="contained" onClick={async () => {
                           try {
                              const res = await axios.get(`http://localhost:5000/api/books/search?q=${bookQuery}`);
                              setBookResults(res.data);
                          } catch (err) { console.log(err); }
                      }}>Search</Button>
                  </Box>
                  <TableContainer sx={{ marginTop: '20px' }}>
                      <Table>
                          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableRow><TableCell>Title</TableCell><TableCell>Author</TableCell><TableCell>Accession No</TableCell><TableCell>Availability</TableCell></TableRow>
                          </TableHead>
                          <TableBody>
                              {bookResults.map((b) => (
                                  <TableRow key={b._id}>
                                      <TableCell>{b.title}</TableCell>
                                      <TableCell>{b.author}</TableCell>
                                      <TableCell>{b.accessionNumber}</TableCell>
                                      <TableCell style={{ color: b.availableCopies > 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                                          {b.availableCopies} Copies
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </TableContainer>
              </Paper>
          </Box>
      )}

    </Container>
  );
}

export default AdminDashboard;