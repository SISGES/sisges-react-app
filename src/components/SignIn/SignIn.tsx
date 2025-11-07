import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, Brightness4, Brightness7 } from '@mui/icons-material';
import { authService } from '../../services/authService';
import type { LoginRequest } from '../../types/auth';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';

export const SignIn = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('sisges_form_email') || '';
  });
  const [password, setPassword] = useState(() => {
    return localStorage.getItem('sisges_form_password') || '';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('sisges_form_email', email);
  }, [email]);

  useEffect(() => {
    localStorage.setItem('sisges_form_password', password);
  }, [password]);

  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.value = email;
    }
  }, [email]);

  useEffect(() => {
    const handleInput = () => {
      if (usernameInputRef.current && usernameInputRef.current.value !== email) {
        setEmail(usernameInputRef.current.value);
      }
    };

    const input = usernameInputRef.current;
    if (input) {
      input.addEventListener('input', handleInput);
      return () => input.removeEventListener('input', handleInput);
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const credentials: LoginRequest = {
        email: email.trim(),
        password,
      };

      await authService.login(credentials);
      showToast('Login realizado com sucesso!', 'success');
      localStorage.removeItem('sisges_form_email');
      localStorage.removeItem('sisges_form_password');
      navigate('/home');
      
    } catch (err: any) {
      showToast(
        err.response?.data?.message || 
        'Erro ao fazer login. Verifique suas credenciais e tente novamente.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
            : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
        padding: 2,
        position: 'relative',
      }}
    >
      <IconButton
        onClick={toggleTheme}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: 'text.primary',
        }}
        aria-label="Alternar tema"
      >
        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>

      <Card
        sx={{
          maxWidth: 450,
          width: '100%',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.4)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              SISGES
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de Gestão Escolar
            </Typography>
          </Box>

          <Typography variant="h5" component="h2" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
            Entrar
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <input
              ref={usernameInputRef}
              type="text"
              name="username"
              autoComplete="username"
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
              tabIndex={-1}
              aria-hidden="true"
            />
            <TextField
              fullWidth
              id="email"
              name="email"
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="username"
              autoFocus
              disabled={loading}
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      disabled={loading}
                      aria-label="Mostrar senha"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
              }}
              startIcon={<LoginIcon />}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

