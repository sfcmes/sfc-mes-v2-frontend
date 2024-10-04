import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { TextField, Button, Box, Typography, Container } from '@mui/material';

const ComponentCardLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // เรียก API สำหรับ login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        // redirect กลับไปยังหน้า FormComponentCard พร้อม id
        navigate(`/forms/form-component-card/${id}`);
      } else {
        // จัดการกรณี login ไม่สำเร็จ
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      // แสดง error message ให้ user
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          เข้าสู่ระบบเพื่อดูรายละเอียดชิ้นงาน
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="ชื่อผู้ใช้"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="รหัสผ่าน"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            เข้าสู่ระบบ
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ComponentCardLogin;