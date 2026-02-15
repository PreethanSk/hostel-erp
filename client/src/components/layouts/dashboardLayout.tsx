import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateValue } from '../../providers/StateProvider';
import { ROUTES } from '../../configs/constants';
import { getRolePageAccessByRoleId } from '../../models';
import AppShell from '../layout/AppShell';

export default function DashboardLayout() {
    const [{ user }, dispatch]: any = useStateValue();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        dispatch({ type: 'SET_USER', user: null });
        navigate(ROUTES.AUTH.LOGIN);
    };

    useEffect(() => {
        if (!user?.emailAddress) {
            handleLogout();
            navigate(ROUTES.AUTH.LOGIN);
        }
        getRolePageAccessByRoleId(user?.roleId)
            .then((resp) => {
                if (resp?.data?.status === 'success') {
                    dispatch({ type: 'PAGE_ACCESS', data: resp?.data?.result });
                }
            })
            .catch((err) => console.log(err));
    }, []);

    return <AppShell />;
}
