import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography } from '@mui/material';

function ForgotPassword() {
  const [data, setData] = useState({ rollNo: '', email: '', newPassword: '' });
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', data);
      alert('Password Reset Successful! Please Login.');
      navigate('/');
    } catch (err) {
      alert('Error: Details do not match any student.');
    }
  };

  return (
    <Container maxWidth="xs" style={{ marginTop: '100px' }}>
      <Paper elevation={3} style={{ padding: '30px' }}>
        <Typography variant="h5" align="center" gutterBottom>Reset Password</Typography>
        <Typography variant="body2" color="textSecondary" align="center" paragraph>
            Enter your Roll No and Registered Email to reset.
        </Typography>

        <TextField label="Roll Number" fullWidth margin="normal" onChange={(e) => setData({...data, rollNo: e.target.value})} />
        <TextField label="College Email" fullWidth margin="normal" onChange={(e) => setData({...data, email: e.target.value})} />
        <TextField label="New Password" type="password" fullWidth margin="normal" onChange={(e) => setData({...data, newPassword: e.target.value})} />

        <Button variant="contained" color="warning" fullWidth style={{ marginTop: '20px' }} onClick={handleReset}>
          Reset Password
        </Button>
        <Button size="small" fullWidth style={{ marginTop: '10px' }} onClick={() => navigate('/')}>
          Back to Login
        </Button>
      </Paper>
    </Container>
  );
}

export default ForgotPassword;