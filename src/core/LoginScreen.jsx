import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Card,
    FormControl,
    FormLabel,
    TextField,
    Typography,
    Alert,
    Stack,
    Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { BirdIcon } from '../assets/BirdIcon.jsx';

const SignInCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(5),
    gap: theme.spacing(2),
    margin: 'auto',
    backgroundColor: '#ffffff',
    [theme.breakpoints.up('sm')]: {
        maxWidth: '450px',
    },
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    border: 'none',
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
    minHeight: '100vh',
    padding: theme.spacing(2),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
    },
}));

export const LoginScreen = ({ onLogin }) => {
    const [email, setEmail] = useState('you@example.com');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

    const validateInputs = () => {
        let isValid = true;

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setEmailError(true);
            setEmailErrorMessage('Please enter a valid email address.');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        if (!password || password.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage('Password must be at least 6 characters long.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        return isValid;
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateInputs()) {
            return;
        }

        setError('');
        try {
            const response = await fetch('/api/auth/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // The login API now returns access_token and refresh_token
                onLogin(data.role, data.access_token, data.refresh_token);
            } else {
                setError(data.message || 'Login failed.');
            }
        } catch (err) {
            // Optionally log the error: console.error(err);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <SignInContainer direction="column" component="main">
            <SignInCard variant="outlined">
                {/* Logo and Header */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <BirdIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 'bold',
                            fontSize: '1.8rem',
                            textAlign: 'center',
                            color: 'text.primary',
                            mb: 1
                        }}
                    >
                        Architex Axis
                    </Typography>
                    <Typography
                        variant="h5"
                        component="h2"
                        sx={{
                            fontWeight: 'normal',
                            fontSize: '1.3rem',
                            textAlign: 'center',
                            color: 'text.primary',
                            mb: 1
                        }}
                    >
                        Management Suite
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            textAlign: 'center',
                            color: 'text.secondary',
                            fontSize: '0.95rem'
                        }}
                    >
                        Access your architectural project hub.
                    </Typography>
                </Box>

                <Box
                    component="form"
                    onSubmit={handleLogin}
                    noValidate
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        gap: 2.5,
                    }}
                >
                    <FormControl>
                        <FormLabel htmlFor="email" sx={{ mb: 1, color: 'text.primary', fontWeight: 500 }}>
                            Email address
                        </FormLabel>
                        <TextField
                            error={emailError}
                            helperText={emailErrorMessage}
                            id="email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            autoFocus
                            required
                            fullWidth
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            color={emailError ? 'error' : 'primary'}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#ffffff',
                                }
                            }}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel htmlFor="password" sx={{ mb: 1, color: 'text.primary', fontWeight: 500 }}>
                            Password
                        </FormLabel>
                        <TextField
                            error={passwordError}
                            helperText={passwordErrorMessage}
                            name="password"
                            placeholder="••••••••"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            required
                            fullWidth
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            color={passwordError ? 'error' : 'primary'}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#ffffff',
                                }
                            }}
                        />
                    </FormControl>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%' }}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 2,
                            py: 1.5,
                            backgroundColor: 'primary.main',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            }
                        }}
                    >
                        Sign In
                    </Button>

                    <Typography sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/signup"
                            variant="body2"
                            sx={{
                                color: 'primary.main',
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline',
                                }
                            }}
                        >
                            Sign up
                        </Link>
                    </Typography>
                </Box>
            </SignInCard>
        </SignInContainer>
    );
};

LoginScreen.propTypes = {
    onLogin: PropTypes.func.isRequired,
};

export default LoginScreen;
