import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Paper, TextField, Button, Typography, MenuItem, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    name: '', rollNo: '', email: '', password: '', confirmPassword: '', gender: '', degree: '', department: '', year: '', phoneNumber: '', hostelBlock: '', roomNo: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
      if (formData.rollNo && formData.rollNo.length === 10) {
          setFormData(prev => ({ ...prev, email: `${formData.rollNo}@student.annauniv.edu` }));
      } else {
          setFormData(prev => ({ ...prev, email: '' }));
      }
  }, [formData.rollNo]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    setError('');
    
    // Validations
    if (!/^\d{10}$/.test(formData.rollNo)) return setError("Roll Number must be exactly 10 digits.");
    
    // 🟢 PASSWORD CONSTRAINTS LOGIC
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
        return setError("Password must be at least 8 characters long, contain 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
    }
    
    // 🟢 CONFIRM PASSWORD LOGIC
    if (formData.password !== formData.confirmPassword) {
        return setError("Passwords do not match!");
    }

    if (!formData.gender) return setError("Please select your Gender.");
    if (!formData.degree || !formData.department || !formData.hostelBlock) return setError("Please fill all dropdowns.");

    try {
      // Exclude confirmPassword from the data sent to the backend
      const { confirmPassword, ...submitData } = formData;
      
      await axios.post('http://localhost:5000/api/auth/register', submitData);
      alert("Registration Successful! Please Login.");
      navigate('/');
    } catch (err) { 
      setError(err.response?.data || "Registration failed"); 
    }
  };

  const genders = ['Female', 'Male', 'Other'];
  const degrees = ['B.E', 'B.Tech', 'M.Sc', 'M.E', 'M.Tech', 'MBA', 'MCA'];
  const departments = ['Information Technology', 'Computer Science Engineering', 'Electronics and Comm. (ECE)', 'Electrical and Electronics (EEE)', 'Mechanical Engineering', 'Civil Engineering', 'Bio-Medical Engineering', 'M.Sc Computer Science', 'M.Sc Electronic Media', 'M.Sc Mathematics', 'Manufacturing Engineering', 'Printing Technology', 'Mining Engineering'];
  const hostelBlocks = ['Malligai', 'Mullai', 'Marutham', 'Semparuthi', 'Vaagai', 'Thamarai', 'Roja', 'Parijatham', 'Thumbai', 'NRI Block (Girls)', 'NRI Block (Boys)'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

  return (
    <div style={{ backgroundColor: '#eef2f6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 20px' }}>
        <Container maxWidth="sm">
            <Paper elevation={6} sx={{ padding: '40px', borderRadius: '15px' }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Student Registration
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    
                    <TextField label="Full Name" name="name" onChange={handleChange} fullWidth required />
                    
                    <Box display="flex" gap={2}>
                        <TextField label="Roll Number (10 Digits)" name="rollNo" onChange={handleChange} fullWidth required inputProps={{ maxLength: 10 }} />
                        <TextField label="Email (Auto)" name="email" value={formData.email} fullWidth disabled sx={{ backgroundColor: '#f5f5f5' }} />
                    </Box>

                    {/* 🟢 NEW: SECURE PASSWORD FIELDS */}
                    <Box display="flex" gap={2}>
                        <TextField label="Password" name="password" type="password" onChange={handleChange} fullWidth required />
                        <TextField label="Confirm Password" name="confirmPassword" type="password" onChange={handleChange} fullWidth required />
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: -1, ml: 1 }}>
                        Must be 8+ chars, 1 Uppercase, 1 Number, 1 Special Char.
                    </Typography>
                    
                    <Box display="flex" gap={2}>
                        <TextField select label="Gender" name="gender" value={formData.gender} onChange={handleChange} fullWidth required>
                            {genders.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </TextField>
                        <TextField select label="Degree" name="degree" value={formData.degree} onChange={handleChange} fullWidth required>
                            {degrees.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </TextField>
                    </Box>

                    <Box display="flex" gap={2}>
                        <TextField select label="Department" name="department" value={formData.department} onChange={handleChange} fullWidth required>
                            {departments.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </TextField>
                        <TextField select label="Year" name="year" value={formData.year} onChange={handleChange} fullWidth required>
                            {years.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </TextField>
                    </Box>

                    <TextField label="Phone Number" name="phoneNumber" onChange={handleChange} fullWidth required inputProps={{ maxLength: 10 }} />
                    
                    <Box display="flex" gap={2}>
                        <TextField select label="Hostel Block" name="hostelBlock" value={formData.hostelBlock} onChange={handleChange} fullWidth required>
                            {hostelBlocks.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </TextField>
                        <TextField label="Room Number" name="roomNo" onChange={handleChange} fullWidth required />
                    </Box>

                    <Button variant="contained" size="large" onClick={handleRegister} sx={{ mt: 2, bgcolor: '#1976d2', fontWeight: 'bold' }}>Register Account</Button>
                    <Button color="primary" onClick={() => navigate('/')}>Already have an account? Login</Button>
                </Box>
            </Paper>
        </Container>
    </div>
  );
}

export default Register;