import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link,
} from '@mui/material';
import {
  PersonOutlined,
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    const success = await registerUser({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });
    setLoading(false);
    if (success) navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(-45deg, #0f172a, #1e293b, #312e81, #0f172a)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 440,
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Logo / Branding */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                mb: 2,
              }}
            >
              <AccountBalanceWallet sx={{ fontSize: 32, color: '#fff' }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#f1f5f9',
                letterSpacing: '-0.02em',
              }}
            >
              FinTrack
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(241, 245, 249, 0.6)', mt: 0.5 }}
            >
              Create your account to get started
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth
              label="Full Name"
              placeholder="John Doe"
              margin="normal"
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlined sx={{ color: 'rgba(241, 245, 249, 0.5)' }} />
                  </InputAdornment>
                ),
              }}
              sx={textFieldStyles}
              {...register('fullName', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
            />

            <TextField
              fullWidth
              label="Email Address"
              placeholder="you@example.com"
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: 'rgba(241, 245, 249, 0.5)' }} />
                  </InputAdornment>
                ),
              }}
              sx={textFieldStyles}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              })}
            />

            <TextField
              fullWidth
              label="Password"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: 'rgba(241, 245, 249, 0.5)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      sx={{ color: 'rgba(241, 245, 249, 0.5)' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={textFieldStyles}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              placeholder="••••••••"
              type={showConfirmPassword ? 'text' : 'password'}
              margin="normal"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: 'rgba(241, 245, 249, 0.5)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      edge="end"
                      sx={{ color: 'rgba(241, 245, 249, 0.5)' }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={textFieldStyles}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === passwordValue || 'Passwords do not match',
              })}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5558e6, #7c4feb)',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
                },
                '&.Mui-disabled': {
                  background: 'rgba(99, 102, 241, 0.4)',
                  color: 'rgba(255,255,255,0.6)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#fff' }} />
              ) : (
                'Create Account'
              )}
            </Button>

            <Typography
              variant="body2"
              sx={{ textAlign: 'center', color: 'rgba(241, 245, 249, 0.6)' }}
            >
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: '#6366f1',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline', color: '#818cf8' },
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

/** Shared text field style overrides for the dark glassmorphism theme */
const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    color: '#f1f5f9',
    borderRadius: 2,
    '& fieldset': {
      borderColor: 'rgba(99, 102, 241, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(99, 102, 241, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6366f1',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(241, 245, 249, 0.6)',
    '&.Mui-focused': {
      color: '#6366f1',
    },
  },
  '& .MuiFormHelperText-root': {
    color: '#ef4444',
  },
};

export default RegisterPage;
