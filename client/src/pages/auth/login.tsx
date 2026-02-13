import { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import { ROUTES } from '../../configs/constants';
import { useNavigate } from 'react-router-dom';
import { base64 } from '../../services/HelperService';
import OtpInput from 'react-otp-input';
import { getLoginOtp, verifyLoginOtp } from '../../models';
import { validateEmail } from '../../services/ValidationService';
import { authService } from '../../services/AuthService';
import { useStateValue } from '../../providers/StateProvider';
import moment from 'moment';
import { gray, primary, radius } from '../../theme';
import FormField from '../../components/shared/FormField';

type Severity = 'error' | 'warning' | 'info' | 'success';

interface AlertState {
    show: boolean;
    severity?: Severity;
    message: string;
}

export default function Login() {
    const [{}, dispatch]: any = useStateValue();
    const navigate = useNavigate();
    const [alert, setAlert] = useState<AlertState>({ show: false, severity: undefined, message: '' });
    const [loading, setLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [otpSent, setOtpSent] = useState(false);
    const [formData, setFormData] = useState<{ username: string; otp: string }>({ username: '', otp: '' });

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const changeFormData = (key: string, value: string) => {
        setFormData({ ...formData, [key]: value });
    };

    const checkValidation = () => {
        if (!formData.username.trim()) {
            setAlert({ show: true, severity: 'error', message: 'Please enter your email address' });
            return false;
        }
        if (!validateEmail(formData.username)) {
            setAlert({ show: true, severity: 'error', message: 'Please enter a valid email address' });
            return false;
        }
        return true;
    };

    const handleGenerateOtp = () => {
        setLoading(true);
        if (!checkValidation()) {
            setLoading(false);
            return;
        }
        getLoginOtp(formData.username, 'login')
            .then((resp) => {
                if (resp?.data?.status === 'success') {
                    setAlert({ show: true, severity: 'success', message: 'OTP sent to your email' });
                    setOtpSent(true);
                    setTimeRemaining(60);
                    setResendDisabled(true);
                }
            })
            .catch((err) => {
                setAlert({ show: true, severity: 'error', message: err?.response?.data?.error?.message });
            })
            .finally(() => setLoading(false));
    };

    const handleVerifyLoginOtp = () => {
        setLoading(true);
        verifyLoginOtp(formData.username, 'login', Number(formData.otp))
            .then((resp) => {
                if (resp?.data?.status === 'success') {
                    setAlert({ show: true, severity: 'success', message: 'Login successful' });
                    setTimeout(() => {
                        localStorage.setItem(
                            'app_login',
                            base64.encode(
                                JSON.stringify({
                                    ...resp?.data?.result,
                                    loginTime: moment()?.format('DD-MM-YYYY | hh:mm A'),
                                })
                            )
                        );
                        const tempData = authService.user();
                        dispatch({ type: 'SET_USER', user: tempData });
                        navigate(ROUTES.HOME.DASHBOARD);
                    }, 1000);
                } else {
                    setLoading(false);
                    setAlert({ show: true, severity: 'error', message: resp?.data?.error?.emailOTP });
                }
            })
            .catch((err) => {
                setAlert({ show: true, severity: 'error', message: err?.response?.data?.error?.emailOTP });
                setLoading(false);
            });
    };

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (timeRemaining > 0) {
            timer = setTimeout(() => {
                setTimeRemaining((prev) => prev - 1);
            }, 1000);
        } else {
            setResendDisabled(false);
        }
        return () => clearTimeout(timer);
    }, [timeRemaining]);

    useEffect(() => {
        if (alert.show) {
            const timer = setTimeout(() => {
                setAlert((prev) => ({ ...prev, show: false }));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    return (
        <>
            <Box sx={{ textAlign: 'center' }}>
                {/* Logo */}
                <Box sx={{ mb: 3 }}>
                    <Typography
                        sx={{
                            fontSize: '24px',
                            fontWeight: 700,
                            color: gray[900],
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Hostel ERP
                    </Typography>
                </Box>

                {/* Title */}
                <Typography
                    sx={{
                        fontSize: '20px',
                        fontWeight: 600,
                        color: gray[900],
                        mb: 0.5,
                    }}
                >
                    Sign in to your account
                </Typography>

                {/* Subtitle */}
                <Typography
                    sx={{
                        fontSize: '13px',
                        color: gray[500],
                        mb: 4,
                    }}
                >
                    Enter your email to receive an OTP
                </Typography>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        otpSent ? handleVerifyLoginOtp() : handleGenerateOtp();
                    }}
                >
                    {/* Email field */}
                    <Box sx={{ textAlign: 'left' }}>
                        <FormField label="Email address" required>
                            <TextField
                                placeholder="you@example.com"
                                value={formData.username}
                                onChange={(e) => changeFormData('username', e.target.value.trim())}
                                fullWidth
                                size="small"
                                InputProps={{ readOnly: otpSent }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: otpSent ? gray[50] : '#fff',
                                    },
                                }}
                            />
                        </FormField>
                    </Box>

                    {/* OTP Input */}
                    {otpSent && (
                        <Box sx={{ mt: 2, mb: 2 }}>
                            <Box sx={{ textAlign: 'left', mb: 1 }}>
                                <Typography
                                    sx={{
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        color: gray[700],
                                    }}
                                >
                                    Verification code
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <OtpInput
                                    value={formData.otp}
                                    onChange={(value: string) => changeFormData('otp', value)}
                                    numInputs={6}
                                    renderSeparator={<Box sx={{ width: 12 }} />}
                                    renderInput={(props) => (
                                        <input
                                            {...props}
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                fontSize: '20px',
                                                fontWeight: 600,
                                                textAlign: 'center',
                                                border: `1px solid ${gray[300]}`,
                                                borderRadius: `${radius.md}px`,
                                                outline: 'none',
                                                transition: 'border-color 150ms, box-shadow 150ms',
                                                fontFamily: 'inherit',
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = primary[600];
                                                e.target.style.borderWidth = '2px';
                                                e.target.style.boxShadow = `0 0 0 4px ${primary[100]}`;
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = gray[300];
                                                e.target.style.borderWidth = '1px';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>
                    )}

                    {/* Action button */}
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        sx={{
                            height: 44,
                            mt: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '14px',
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : otpSent ? (
                            'Verify OTP'
                        ) : (
                            'Request OTP'
                        )}
                    </Button>
                </form>

                {/* Resend OTP link */}
                {otpSent && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                        <Typography
                            component="button"
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                if (!resendDisabled) handleGenerateOtp();
                            }}
                            sx={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: resendDisabled ? gray[400] : primary[600],
                                cursor: resendDisabled ? 'not-allowed' : 'pointer',
                                border: 'none',
                                background: 'none',
                                padding: 0,
                                textDecoration: resendDisabled ? 'none' : 'underline',
                                '&:hover': {
                                    color: resendDisabled ? gray[400] : primary[700],
                                },
                            }}
                            disabled={resendDisabled}
                        >
                            Resend OTP
                        </Typography>
                        {resendDisabled && (
                            <Typography sx={{ fontSize: '13px', color: gray[500] }}>
                                in {formatTime(timeRemaining)}
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>

            {/* Alert */}
            {alert.show && (
                <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1400 }}>
                    <Alert
                        severity={alert.severity}
                        onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
                    >
                        {alert.message}
                    </Alert>
                </Box>
            )}
        </>
    );
}
