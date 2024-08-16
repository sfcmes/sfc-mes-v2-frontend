import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Stack } from '@mui/material';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import { useAuth } from '../../../contexts/AuthContext';

const AuthLogin = ({ title, subtext }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    if (!emailOrUsername.trim()) {
      setError('Email or username is required');
      return false;
    }
    if (!password.trim()) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(emailOrUsername, password);
      if (result.success) {
        navigate('/dashboards/modern');
      } else {
        setError(result.error || 'Invalid email or username or password');
      }
    } catch (err) {
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(err.response.data.message || 'An error occurred during login');
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {title && (
        <Typography fontWeight="700" variant="h3" mb={1} color="common.white">
          {title}
        </Typography>
      )}

      {subtext}

      <Stack spacing={2}>
        <Box>
          <CustomFormLabel htmlFor="emailOrUsername" sx={{ color: 'common.white' }}>
            Email or Username
          </CustomFormLabel>
          <CustomTextField
            id="emailOrUsername"
            name="emailOrUsername"
            variant="outlined"
            fullWidth
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.7)' },
                '&.Mui-focused fieldset': { borderColor: 'white' },
              },
              input: { color: 'common.white' },
            }}
          />
        </Box>
        <Box>
          <CustomFormLabel htmlFor="password" sx={{ color: 'common.white' }}>
            Password
          </CustomFormLabel>
          <CustomTextField
            id="password"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.7)' },
                '&.Mui-focused fieldset': { borderColor: 'white' },
              },
              input: { color: 'common.white' },
            }}
          />
        </Box>
      </Stack>
      {error && <Typography color="error" mt={2}>{error}</Typography>}
      <Box mt={3}>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          disabled={isLoading}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'common.white',
            },
          }}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </Box>
    </form>
  );
};

export default AuthLogin;