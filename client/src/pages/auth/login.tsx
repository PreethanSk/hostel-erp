import { useEffect, useState } from 'react'
import { Button, TextField } from '@mui/material'
import { ROUTES } from '../../configs/constants';
import { useNavigate } from 'react-router-dom';
import { base64, textFieldStyleLogin } from '../../services/HelperService'
import OtpInput from 'react-otp-input';
import Alert from '@mui/material/Alert';
import { getLoginOtp, verifyLoginOtp } from '../../models';
import { validateEmail } from '../../services/ValidationService';
import { authService } from '../../services/AuthService';
import { useStateValue } from '../../providers/StateProvider';
import moment from 'moment';
import { IMAGES_ICON } from '../../assets/images/exportImages';


type Severity = 'error' | 'warning' | 'info' | 'success';

interface AlertState {
    show: boolean;
    severity?: Severity;
    message: string;
}

export default function Login() {
    const [{ }, dispatch]: any = useStateValue();
    const navigate = useNavigate();
    const [alert, setAlert] = useState<AlertState>({ show: false, severity: undefined, message: '' });
    const [_loading, _setLoading] = useState<any>(false);
    // const [{ }, dispatch]: any = useStateValue();
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [_otpSent, _setOtpSent] = useState(false)
    // const [OTP, setOTP] = useState("");
    const [_formData, _setFormData] = useState<any>({ username: '', otp: '' });

    const validate: any = {
        username: { error: false, message: '' },
        otp: { error: false, message: '' }
    }

    const [_validate, _setValidate] = useState<any>(validate);

    const formatTime = (seconds: any) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    const changeFormData = (key: string, value: any) => {
        _setFormData({ ..._formData, [key]: value })
    }

    const checkValidation = () => {
        if (!_formData?.username?.trim()) {
            setAlert({
                show: true,
                severity: 'error',
                message: 'Please enter the Email',
            });
            return false;
        }
        if (_formData?.username && !validateEmail(_formData?.username)) {
            setAlert({
                show: true,
                severity: 'error',
                message: 'Please enter the Email',
            });
            return false;
        }


        return true;
    }


    const handleGenerateOtp = () => {
        _setLoading(true)
        if (!checkValidation()) {
            _setLoading(false)
            return;
        }
        getLoginOtp(_formData?.username, 'login')
            .then((resp) => {
                if (resp?.data?.status === 'success') {
                    setAlert({ show: true, severity: 'success', message: 'Login OTP Generated', });
                    _setOtpSent(true);
                }
            })
            .catch((err) => {
                setAlert({ show: true, severity: 'error', message: err?.response?.data?.error?.message });
            })
            .finally(() => _setLoading(false))
    }

    const handleVerifyLoginOtp = () => {
        _setLoading(true)
        verifyLoginOtp(_formData?.username, 'login', _formData?.otp)
            .then((resp) => {
                if (resp?.data?.status === 'success') {
                    setAlert({ show: true, severity: 'success', message: 'Login Successful', });
                    setTimeout(() => {
                        localStorage.setItem("app_login", base64.encode(JSON.stringify({ ...resp?.data?.result, loginTime: moment()?.format('DD-MM-YYYY | hh:mm A') })));
                        const _tempData = authService.user();
                        dispatch({
                            type: "SET_USER",
                            user: _tempData
                        });
                        navigate(ROUTES.HOME.DASHBOARD)
                    }, 1000)
                } else {
                    _setLoading(false)
                    setAlert({ show: true, severity: 'error', message: resp?.data?.error?.emailOTP, })
                }
            })
            .catch((err) => {
                setAlert({ show: true, severity: 'error', message: err?.response?.data?.error?.emailOTP });
                _setLoading(false)
            })
    }


    useEffect(() => {
        let timer: any;
        if (timeRemaining > 0) {
            timer = setTimeout(() => {
                setTimeRemaining((prevTime) => prevTime - 1);
            }, 1000);
        } else {
            setResendDisabled(false);
        }

        return () => clearTimeout(timer);
    }, [timeRemaining]);

    useEffect(() => {
        if (alert.show) {
            const timer = setTimeout(() => {
                setAlert({ ...alert, show: false });
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [alert])


    return <>
        <div className="text-center px-4 ">
            <div className="">
                <img src={IMAGES_ICON.HeaderLogo} style={{ height: "45px"}} />
            </div>

            {/* <div className='mt-3 LoginHeader'><span style={{ fontWeight: "400", fontSize: "25px", color: "#F76D61" }}>HostelHost</span></div> */}
            {/* <div className='' style={{marginTop:"-13px"}}>
            <span className='log-subheadFront ' style={{   }}>feel like home...</span>
            </div> */}
            <div className='mt-5'><h5 className='head'>Admin Login</h5></div>
            <form action="" method="post" onSubmit={(e) => { e.preventDefault(); _otpSent ? handleVerifyLoginOtp() : handleGenerateOtp(); }}>
                <div className='row mt-4'>
                    <div className='col-md-12 p-2'>
                        <TextField className=" field " label="" placeholder="Username or Email"
                            value={_formData.username} onChange={(e: any) => changeFormData('username', e.target.value?.trim(''))} fullWidth InputLabelProps={{ shrink: true, }} sx={{
                                ...textFieldStyleLogin, '& .MuiInputBase-input': { textAlign: 'center', }
                            }}
                            error={_validate.username.error} helperText={_validate.username.message}
                            InputProps={{ readOnly: _otpSent ? true : false }} />
                    </div>
                    {_otpSent && (<div className='col-md-12 px-2 mt-2'>
                        <OtpInput
                            value={_formData?.otp}
                            onChange={(value: any) => changeFormData('otp', value)}
                            numInputs={6}
                            renderSeparator={<span>&nbsp;&nbsp;&nbsp;&nbsp; </span>}  // Space separator
                            renderInput={(props) => (
                                <input
                                    {...props}
                                    style={{ width: '36px', height: '45px', fontSize: '18px', textAlign: 'center', border: "1px solid #C7C3C3", borderRadius: "10px", fontWeight: "700" }} // Adjust size and style
                                />
                            )}
                        />
                    </div>)}
                    {!_otpSent && (<div className='col-md-12 text-center'>
                        <Button type="submit" variant="contained" color="primary" className="text-white  border-0 py-2 px-5 mt-4 text-decoration-none"
                            sx={{ textTransform: "none" }} disabled={_loading}>Request OTP</Button>
                    </div>)}
                    {_otpSent && (<div className='col-md-12 text-center'>
                        <Button type="submit" variant="contained" color="primary" className="text-white  border-0 py-2 px-5 mt-4 text-decoration-none"
                            sx={{ textTransform: "none" }} disabled={_loading}>Submit OTP</Button>
                    </div>)}
                </div>
            </form>
            {_otpSent && (<div className='d-flex justify-content-center align-items-center'>
                <button className='my-2 bg-white text-decoration-underline' style={{ border: "none", cursor: resendDisabled ? "not-allowed" : "pointer", fontSize: "16px", fontWeight: "600", color: resendDisabled ? "#B8B8B8" : "#F76D61" }} disabled={resendDisabled} onClick={(e) => { e.preventDefault(); handleGenerateOtp() }}>Resend OTP in</button>
                <span className='my-2 fs16'> {formatTime(timeRemaining)}</span>
            </div>)}
        </div>

        <div className="position-fixed p-3 top-0 end-0">
            {alert.show && (
                <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, show: false })}>
                    {alert.message}
                </Alert>
            )}
        </div>

    </>
}