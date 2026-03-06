import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, ToggleButton, ToggleButtonGroup, Box } from '@mui/material';

function Login() {
  const [role, setRole] = useState('student');
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    // 🟢 BULLETPROOF DEMO OVERRIDE
    if (role === 'admin' && rollNo === '0000000000' && password === 'admin123') {
        localStorage.setItem('adminData', JSON.stringify({ name: "Super Admin", rollNo: "0000000000", isAdmin: true }));
        navigate('/admin-dashboard');
        return; 
    }

    try {
      const res = await axios.post('https://hostel-library-book-management.onrender.com/api/auth/login', { rollNo, password });
      
      if (role === 'admin') {
        if (res.data.isAdmin) {
          localStorage.setItem('adminData', JSON.stringify(res.data)); 
          navigate('/admin-dashboard');
        } else {
          alert('Access Denied: You do not have Admin privileges.');
        }
      } else {
        if (!res.data.isAdmin) {
          localStorage.setItem('studentData', JSON.stringify(res.data));
          navigate('/student-dashboard');
        } else {
          alert('Admins must use the Admin login tab.');
        }
      }
    } catch (err) {
        alert('Invalid Login! Check your credentials.');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#eef2f6' }}>
      
      <Box sx={{ backgroundColor: '#1976d2', color: 'white', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: 3 }}>
        <img src="/ech-logo.png" alt="ECH Logo" style={{ height: '55px', backgroundColor: 'white', padding: '4px', borderRadius: '5px', position: 'absolute', left: '20px' }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center' }}>
          Engineering College Hostels Library, CEG
        </Typography>
      </Box>

      <Container maxWidth="xs" sx={{ mt: 8, mb: 8, flexGrow: 1 }}>
        <Paper elevation={6} sx={{ padding: '30px', textAlign: 'center', borderRadius: '15px', backgroundColor: '#f0f4f8', borderTop: '6px solid #1976d2' }}>
          <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>Library Portal</Typography>
          
          <ToggleButtonGroup value={role} exclusive onChange={(e, newRole) => { if (newRole) setRole(newRole); }} sx={{ marginBottom: '20px', width: '100%', backgroundColor: 'white' }}>
            <ToggleButton value="student" sx={{ width: '50%', fontWeight: 'bold' }}>Student</ToggleButton>
            <ToggleButton value="admin" sx={{ width: '50%', fontWeight: 'bold' }}>Admin</ToggleButton>
          </ToggleButtonGroup>

          {/* 🟢 STRICT 10 DIGIT LIMIT FOR BOTH ROLES */}
          <TextField 
              label={role === 'admin' ? "Admin ID (10 Digits)" : "Roll Number (10 Digits)"} 
              fullWidth 
              margin="normal" 
              onChange={(e) => setRollNo(e.target.value)} 
              inputProps={{ maxLength: 10 }} 
              sx={{ backgroundColor: 'white', borderRadius: '5px' }} 
          />
          
          <TextField label="Password" type="password" fullWidth margin="normal" onChange={(e) => setPassword(e.target.value)} sx={{ backgroundColor: 'white', borderRadius: '5px' }} />

          {role === 'student' && (
            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Button size="small" sx={{ textTransform: 'none', fontSize: '14px', fontWeight: 'bold' }} onClick={() => navigate('/forgot-password')}>
                Forgot Password?
              </Button>
            </Box>
          )}

          <Button variant="contained" color="primary" fullWidth sx={{ mt: 3, height: '50px', fontSize: '16px', fontWeight: 'bold', boxShadow: 2 }} onClick={handleLogin}>Login</Button>

          {role === 'student' && (
            <Button color="primary" sx={{ mt: 2, fontSize: '15px', fontWeight: 'bold' }} onClick={() => navigate('/register')}>New Student? Register Here</Button>
          )}
        </Paper>
      </Container>

      <Box sx={{ backgroundColor: '#1976d2', color: 'white', textAlign: 'center', p: 3, mt: 'auto', boxShadow: '0px -3px 5px rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Engineering College Hostels</Typography>
        <Typography variant="body1" sx={{ fontSize: '16px' }}>12, Sardar Patel Road, Anna University, Guindy, Chennai - 600025</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2, fontWeight: 'bold', fontSize: '16px' }}>
          <span>📞 044-22352257</span>
          <span>✉️ echquery@yahoo.com</span>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;