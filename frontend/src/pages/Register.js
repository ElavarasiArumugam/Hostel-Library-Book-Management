import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Paper, TextField, Button, Typography, MenuItem, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    name: '', 
    rollNo: '', 
    email: '', 
    password: '', 
    degree: '',       // 🟢 New Degree Field
    department: '', 
    year: '', 
    phoneNumber: '', 
    hostelBlock: '',  // 🟢 Now a Dropdown
    roomNo: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 🟢 AUTO-GENERATE EMAIL (Fix)
  // This runs automatically whenever the Roll Number changes
  useEffect(() => {
      if (formData.rollNo && formData.rollNo.length === 10) {
          const autoEmail = `${formData.rollNo}@student.annauniv.edu`;
          setFormData(prev => ({ ...prev, email: autoEmail }));
      } else {
          setFormData(prev => ({ ...prev, email: '' }));
      }
  }, [formData.rollNo]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setError('');
    
    // Validations
    if (!/^\d{10}$/.test(formData.rollNo)) {
        setError("Roll Number must be exactly 10 digits.");
        return;
    }
    if (!formData.degree) {
        setError("Please select your Degree.");
        return;
    }
    if (!formData.department) {
        setError("Please select your Department.");
        return;
    }
    if (!formData.hostelBlock) {
        setError("Please select your Hostel Block.");
        return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert("Registration Successful! Please Login.");
      navigate('/');
    } catch (err) {
      setError(err.response?.data || "Registration failed");
    }
  };

  // --- DROPDOWN DATA ---
  const degrees = ['B.E', 'B.Tech', 'M.Sc', 'M.E', 'M.Tech', 'MBA', 'MCA'];
  
  const departments = [
    'Information Technology',
    'Computer Science Engineering',
    'Electronics and Comm. (ECE)',
    'Electrical and Electronics (EEE)',
    'Mechanical Engineering',
    'Civil Engineering',
    'Bio-Medical Engineering',
    'M.Sc Computer Science',         // 🟢 Added as requested
    'M.Sc Electronic Media',
    'M.Sc Mathematics',
    'Manufacturing Engineering',
    'Printing Technology',
    'Mining Engineering'
  ];

  const hostelBlocks = [
    'Malligai', 'Mullai', 'Marutham', // Ladies Hostels
    'Kuroushi', 'Kavery', 'Krishna',  // Gents Hostels
    'Titan', 'Pothigai', 'Amaravathi', 
    'Sagar', 'Swarna', 'NRI Block'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']; // 🟢 Added 5th Year

  return (
    <div style={{ backgroundColor: '#eef2f6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <Container maxWidth="sm">
            <Paper elevation={6} sx={{ padding: '40px', borderRadius: '15px' }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                    Student Registration
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    
                    {/* NAME */}
                    <TextField label="Full Name" name="name" onChange={handleChange} fullWidth required />
                    
                    {/* ROLL NO & EMAIL (Grouped) */}
                    <Box display="flex" gap={2}>
                        <TextField 
                            label="Roll Number" 
                            name="rollNo" 
                            onChange={handleChange} 
                            fullWidth 
                            required 
                            inputProps={{ maxLength: 10 }}
                            helperText="10 Digits"
                        />
                        <TextField 
                            label="Email (Auto)" 
                            name="email" 
                            value={formData.email} 
                            fullWidth 
                            disabled // User cannot edit this
                            sx={{ backgroundColor: '#f5f5f5' }}
                        />
                    </Box>

                    {/* PASSWORD */}
                    <TextField label="Password" name="password" type="password" onChange={handleChange} fullWidth required />
                    
                    {/* DEGREE & YEAR */}
                    <Box display="flex" gap={2}>
                        <TextField select label="Degree" name="degree" value={formData.degree} onChange={handleChange} fullWidth required>
                            {degrees.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </TextField>

                        <TextField select label="Year" name="year" value={formData.year} onChange={handleChange} fullWidth required>
                            {years.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </TextField>
                    </Box>

                    {/* DEPARTMENT */}
                    <TextField select label="Department" name="department" value={formData.department} onChange={handleChange} fullWidth required>
                        {departments.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </TextField>

                    {/* PHONE */}
                    <TextField label="Phone Number" name="phoneNumber" onChange={handleChange} fullWidth required />
                    
                    {/* HOSTEL & ROOM */}
                    <Box display="flex" gap={2}>
                        <TextField select label="Hostel Block" name="hostelBlock" value={formData.hostelBlock} onChange={handleChange} fullWidth required>
                            {hostelBlocks.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </TextField>
                        <TextField label="Room Number" name="roomNo" onChange={handleChange} fullWidth required />
                    </Box>

                    <Button variant="contained" size="large" onClick={handleRegister} sx={{ mt: 2, bgcolor: '#1565c0' }}>
                        Register
                    </Button>
                    
                    <Button color="primary" onClick={() => navigate('/')}>
                        Already have an account? Login
                    </Button>
                </Box>
            </Paper>
        </Container>
    </div>
  );
}

export default Register;