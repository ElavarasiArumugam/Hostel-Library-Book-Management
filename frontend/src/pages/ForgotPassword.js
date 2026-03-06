import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, ToggleButtonGroup, ToggleButton, Box } from '@mui/material';

function ForgotPassword() {
  const [role, setRole] = useState('student');
  const [data, setData] = useState({ rollNo: '', email: '', newPassword: '' });
  const navigate = useNavigate();

  // Auto-generate correct email based on role
  useEffect(() => {
    if (data.rollNo && data.rollNo.length === 10) {
        const domain = role === 'admin' ? '@admin.ech.edu' : '@student.annauniv.edu';
        setData(prev => ({ ...prev, email: `${data.rollNo}${domain}` }));
    } else {
        setData(prev => ({ ...prev, email: '' }));
    }
  }, [data.rollNo, role]);

  const handleReset = async () => {
    try {
      await axios.post('https://hostel-library-book-management.onrender.com/api/auth/reset-password', data);
      alert('Password Reset Successful! Please Login.');
      navigate('/');
    } catch (err) {
      alert(err.response?.data || 'Error: Details do not match.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#eef2f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="xs">
        <Paper elevation={6} sx={{ padding: '30px', borderRadius: '15px', borderTop: '6px solid #1976d2' }}>
          <Typography variant="h5" align="center" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>Reset Password</Typography>
          
          <ToggleButtonGroup value={role} exclusive onChange={(e, newRole) => { if (newRole) setRole(newRole); }} sx={{ width: '100%', mb: 2 }}>
            <ToggleButton value="student" sx={{ width: '50%', fontWeight: 'bold' }}>Student</ToggleButton>
            <ToggleButton value="admin" sx={{ width: '50%', fontWeight: 'bold' }}>Admin</ToggleButton>
          </ToggleButtonGroup>

          <TextField label="Roll No / Admin ID" fullWidth margin="normal" onChange={(e) => setData({...data, rollNo: e.target.value})} inputProps={{ maxLength: 10 }} />
          <TextField label="System Email (Auto)" fullWidth margin="normal" value={data.email} disabled sx={{ backgroundColor: '#f5f5f5' }} />
          <TextField label="New Password" type="password" fullWidth margin="normal" onChange={(e) => setData({...data, newPassword: e.target.value})} />

          <Button variant="contained" color="primary" fullWidth sx={{ mt: 3, fontWeight: 'bold' }} onClick={handleReset}>Reset Password</Button>
          <Button fullWidth sx={{ mt: 1 }} onClick={() => navigate('/')}>Back to Login</Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default ForgotPassword;