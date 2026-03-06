import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Paper, Typography, Box, Avatar, Button, List, ListItem, ListItemIcon, ListItemText, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person'; // 🟢 Added PersonIcon import

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [view, setView] = useState('profile'); 
  const [myBooks, setMyBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedStudent = localStorage.getItem('studentData');
    if (!storedStudent) { navigate('/'); return; }
    
    const parsedStudent = JSON.parse(storedStudent);
    setStudent(parsedStudent);

    axios.post('https://hostel-library-book-management.onrender.com/api/transactions/my-books', { studentId: parsedStudent._id })
      .then(res => setMyBooks(res.data))
      .catch(err => console.log(err));

  }, [navigate]);

  const handleSearch = async () => {
      if(!searchQuery) return;
      try {
          const res = await axios.get(`https://hostel-library-book-management.onrender.com/api/books/search?q=${searchQuery}`);
          setSearchResults(res.data);
          setHasSearched(true);
      } catch (err) { console.log(err); }
  };

  if (!student) return <div>Loading...</div>;

  // --- SIDEBAR ---
  const Sidebar = () => (
      <Box sx={{ width: '250px', backgroundColor: '#1976d2', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0 }}>
          <div style={{ padding: '24px', fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.2)', textAlign: 'center', backgroundColor: '#1565c0' }}>
             Hostel Library
          </div>
          <List component="nav" sx={{ marginTop: '10px' }}>
              <ListItem button onClick={() => setView('profile')} sx={{ backgroundColor: view === 'profile' ? 'rgba(255,255,255,0.2)' : 'transparent', mb: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                  <ListItemIcon sx={{ color: 'white' }}><DashboardIcon /></ListItemIcon>
                  <ListItemText primary="My Profile" />
              </ListItem>
              <ListItem button onClick={() => setView('myBooks')} sx={{ backgroundColor: view === 'myBooks' ? 'rgba(255,255,255,0.2)' : 'transparent', mb: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                  <ListItemIcon sx={{ color: 'white' }}><MenuBookIcon /></ListItemIcon>
                  <ListItemText primary="Borrowed Books" />
              </ListItem>
              <ListItem button onClick={() => setView('search')} sx={{ backgroundColor: view === 'search' ? 'rgba(255,255,255,0.2)' : 'transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                  <ListItemIcon sx={{ color: 'white' }}><SearchIcon /></ListItemIcon>
                  <ListItemText primary="Search Library" />
              </ListItem>
          </List>
          <Box sx={{ marginTop: 'auto', padding: '20px' }}>
              <Button variant="contained" color="error" fullWidth startIcon={<ExitToAppIcon />} onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</Button>
          </Box>
      </Box>
  );

  return (
    <div style={{ display: 'flex', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      
      <Sidebar />

      <Box sx={{ marginLeft: '250px', width: '100%', padding: '40px' }}>
          
          {/* 🟢 VIEW: PROFILE */}
          {view === 'profile' && (
              <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                  
                  {/* UNIFIED CARD */}
                  <Paper elevation={6} sx={{ width: '100%', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                      
                      {/* LEFT SIDE (BLUE) */}
                      <Box sx={{ width: { xs: '100%', md: '35%' }, backgroundColor: '#1976d2', color: 'white', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                          <Avatar sx={{ width: 140, height: 140, border: '4px solid white', fontSize: '3.5rem', bgcolor: '#1565c0', marginBottom: '20px' }}>
                              {student.name.charAt(0)}
                          </Avatar>
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{student.name}</Typography>
                          <Typography variant="subtitle1" sx={{ opacity: 0.8, marginBottom: '20px' }}>{student.rollNo}</Typography>
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
                                  <Typography variant="body1" sx={{ fontWeight: '500' }}>{student.department}</Typography>
                              </Grid>
                              
                              {/* 🟢 GENDER ADDED HERE */}
                              <Grid item xs={12} sm={6}>
                                  <Box display="flex" alignItems="center" mb={1}>
                                      <PersonIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>GENDER</Typography>
                                  </Box>
                                  <Typography variant="body1" sx={{ fontWeight: '500' }}>{student.gender}</Typography>
                              </Grid>

                              <Grid item xs={12} sm={6}>
                                  <Box display="flex" alignItems="center" mb={1}>
                                      <CalendarTodayIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>YEAR OF STUDY</Typography>
                                  </Box>
                                  <Typography variant="body1" sx={{ fontWeight: '500' }}>{student.year}</Typography>
                              </Grid>

                              <Grid item xs={12} sm={6}>
                                  <Box display="flex" alignItems="center" mb={1}>
                                      <EmailIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>EMAIL ID</Typography>
                                  </Box>
                                  <Typography variant="body1" sx={{ fontWeight: '500', wordBreak: 'break-all' }}>{student.email}</Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                  <Box display="flex" alignItems="center" mb={1}>
                                      <PhoneIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>PHONE NUMBER</Typography>
                                  </Box>
                                  <Typography variant="body1" sx={{ fontWeight: '500' }}>{student.phoneNumber}</Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                  <Box display="flex" alignItems="center" mb={1}>
                                      <HomeIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>HOSTEL LOCATION</Typography>
                                  </Box>
                                  <Typography variant="body1" sx={{ fontWeight: '500' }}>{student.hostelBlock} - Room {student.roomNo}</Typography>
                              </Grid>
                          </Grid>
                      </Box>
                  </Paper>
              </Container>
          )}

          {/* 🔵 VIEW: MY BOOKS */}
          {view === 'myBooks' && (
              <Container maxWidth="lg">
                  <Typography variant="h4" sx={{ marginBottom: '30px', fontWeight: 'bold', color: '#333' }}>My Borrowed Books</Typography>
                  {myBooks.length === 0 ? (
                      <Alert severity="info">You have not borrowed any books yet.</Alert>
                  ) : (
                      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: '15px' }}>
                          <Table>
                              <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
                                  <TableRow>
                                      <TableCell><strong>Book Title</strong></TableCell>
                                      <TableCell><strong>Issue Date</strong></TableCell>
                                      <TableCell><strong>Due Date</strong></TableCell>
                                      <TableCell><strong>Status</strong></TableCell>
                                  </TableRow>
                              </TableHead>
                              <TableBody>
                                  {myBooks.map((t) => (
                                      <TableRow key={t._id}>
                                          <TableCell sx={{ fontWeight: 'bold' }}>{t.bookId.title}</TableCell>
                                          <TableCell>{new Date(t.issueDate).toLocaleDateString()}</TableCell>
                                          <TableCell>{new Date(t.dueDate).toLocaleDateString()}</TableCell>
                                          <TableCell>
                                              {new Date() > new Date(t.dueDate) ? 
                                                  <span style={{ color: 'red', fontWeight: 'bold', border: '1px solid red', padding: '4px 8px', borderRadius: '4px' }}>OVERDUE</span> : 
                                                  <span style={{ color: 'green', fontWeight: 'bold', border: '1px solid green', padding: '4px 8px', borderRadius: '4px' }}>Active</span>
                                              }
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      </TableContainer>
                  )}
              </Container>
          )}

          {/* 🟠 VIEW: SEARCH BOOKS */}
          {view === 'search' && (
              <Container maxWidth="lg">
                  <Typography variant="h4" sx={{ marginBottom: '30px', fontWeight: 'bold', color: '#333' }}>Search Library</Typography>
                  <Paper elevation={3} sx={{ padding: '20px', marginBottom: '30px', borderRadius: '15px' }}>
                      <Box display="flex" gap={2}>
                          <TextField label="Search by Book Title or Author" variant="outlined" fullWidth value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                          <Button variant="contained" size="large" onClick={handleSearch} startIcon={<SearchIcon />}>Search</Button>
                      </Box>
                  </Paper>
                  
                  {hasSearched && searchResults.length === 0 && (
                      <Alert severity="error" sx={{ marginTop: '20px', fontSize: '1.1rem' }}>
                          <strong>Book is not available.</strong> We could not find any book matching your search.
                      </Alert>
                  )}

                  {searchResults.length > 0 && (
                      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: '15px' }}>
                          <Table>
                              <TableHead sx={{ backgroundColor: '#fff3e0' }}>
                                  <TableRow><TableCell><strong>Book Title</strong></TableCell><TableCell><strong>Author</strong></TableCell><TableCell><strong>Accession No</strong></TableCell><TableCell><strong>Availability</strong></TableCell></TableRow>
                              </TableHead>
                              <TableBody>
                                  {searchResults.map((book) => (
                                      <TableRow key={book._id}>
                                          <TableCell sx={{ fontWeight: 'bold' }}>{book.title}</TableCell>
                                          <TableCell>{book.author}</TableCell>
                                          <TableCell>{book.accessionNumber}</TableCell>
                                          <TableCell>
                                              {book.availableCopies > 0 ? 
                                                  <span style={{ color: 'green', fontWeight: 'bold' }}>{book.availableCopies} Copies Available</span> 
                                                  : 
                                                  <span style={{ color: 'red', fontWeight: 'bold' }}>Book Not Available (0 Copies)</span>
                                              }
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      </TableContainer>
                  )}
              </Container>
          )}

      </Box>
    </div>
  );
}

export default StudentDashboard;