import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

function Login() {
  const [role, setRole] = useState('student');
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (role === 'admin') {
      // 🔐 Admin Login (Hardcoded for now)
      if (rollNo === 'admin' && password === 'admin123') {
        navigate('/admin-dashboard');
      } else {
        alert('Invalid Admin Credentials');
      }
    } else {
      // 🎓 Student Login (Database Check)
      try {
        const res = await axios.post('http://localhost:5000/api/auth/login', { rollNo, password });
        
        // Save student info to browser storage so we can use it on the Dashboard
        localStorage.setItem('studentData', JSON.stringify(res.data));
        navigate('/student-dashboard');
      } catch (err) {
        alert('Invalid Login! Check Roll No or Password.');
      }
    }
  };

  return (
    <Container maxWidth="xs" style={{ marginTop: '100px' }}>
      <Paper elevation={3} style={{ padding: '30px', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom color="primary">Hostel Library</Typography>
        
        {/* Toggle between Student and Admin */}
        <ToggleButtonGroup
          value={role}
          exclusive
          onChange={(e, newRole) => { if (newRole) setRole(newRole); }}
          style={{ marginBottom: '20px' }}
        >
          <ToggleButton value="student">Student</ToggleButton>
          <ToggleButton value="admin">Admin</ToggleButton>
        </ToggleButtonGroup>

        {/* Inputs */}
        <TextField 
          label={role === 'admin' ? "Username" : "Roll Number"} 
          fullWidth 
          margin="normal" 
          onChange={(e) => setRollNo(e.target.value)} 
        />
        <TextField 
          label="Password" 
          type="password" 
          fullWidth 
          margin="normal" 
          onChange={(e) => setPassword(e.target.value)} 
        />

        {/* Forgot Password Link (Only for Students) */}
        {role === 'student' && (
          <div style={{ textAlign: 'right', marginTop: '5px' }}>
            <Button size="small" style={{ textTransform: 'none' }} onClick={() => navigate('/forgot-password')}>
              Forgot Password?
            </Button>
          </div>
        )}

        {/* Login Button */}
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          style={{ marginTop: '20px', height: '50px' }} 
          onClick={handleLogin}
        >
          Login
        </Button>

        {/* Registration Link */}
        {role === 'student' && (
          <Button 
            color="secondary" 
            style={{ marginTop: '15px' }} 
            onClick={() => navigate('/register')}
          >
            New Student? Register Here
          </Button>
        )}
      </Paper>
    </Container>
  );
}

export default Login;