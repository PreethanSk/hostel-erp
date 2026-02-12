import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';
import { userSession } from '../services/HelperService';
import axios from "axios";
import moment from 'moment';
import { useStateValue } from './StateProvider';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../configs/constants';


function AxiosProvider() {
    const navigate = useNavigate()
    const [{ }, dispatch]: any = useStateValue();
    const user: any = userSession(true);
    const [open, setOpen] = useState(false);
    const [_msg, _setMsg] = useState('');


    const handleLogout = () => {
        setOpen(false);
        if (user) {
            window.location.reload();
            dispatch({ type: "SET_USER", user: null });
            localStorage.clear();
            navigate(ROUTES.AUTH.LOGIN);
        }
    }


    const updateAccessToken = () => {
        const _userSession = userSession(true);
        if (_userSession?.accessToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${_userSession.accessToken}`;
        }
    }
    useEffect(() => {
        if (user?.id && moment()?.isAfter(moment(user?.logoutTime, 'DD-MM-YYYY HH:mm A'))) {
            setOpen(true);
            _setMsg('Something went wrong, Try again');
        }
        const authInterceptor = axios.interceptors.request.use();
        return () => {
            axios.interceptors.request.eject(authInterceptor);
        }
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        updateAccessToken();
        axios.interceptors.response.use(function (response) {
            return response;
        }, function (error) {
            if (error.response.status === 401) {
                setTimeout(() => {
                    setOpen(true);
                    _setMsg('Login token expired. Please Re-Login');
                }, 100);
            } else {
                return Promise.reject(error);
            }
        });
    }, []);

    return (<>
        <Dialog fullWidth maxWidth={"xs"} open={open} onClose={handleLogout} disableEscapeKeyDown={true}>
            <DialogTitle className="text-danger text-center">{_msg}</DialogTitle>
            <DialogActions className="justify-content-center pb-4">
                <Button className="text-white" variant={"contained"} onClick={handleLogout}>Ok</Button>
            </DialogActions>
        </Dialog>
    </>);
}

export default AxiosProvider;