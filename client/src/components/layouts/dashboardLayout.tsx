import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useStateValue } from '../../providers/StateProvider';
import { ROUTES } from '../../configs/constants';
import { DashboardNewHeader } from './dashboardNewHeader';
import { getRolePageAccessByRoleId } from '../../models';

export default function DashboardLayout() {
    const [{ user }, dispatch]: any = useStateValue();
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.clear();
        dispatch({
            type: "SET_USER",
            user: null
        });
        navigate(ROUTES.AUTH.LOGIN);
    }
    useEffect(() => {
        if (!user?.emailAddress) {
            handleLogout()
            navigate(ROUTES.AUTH.LOGIN)
        }
        getRolePageAccessByRoleId(user?.roleId)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    dispatch({
                        type: "PAGE_ACCESS",
                        data: resp?.data?.result
                    });
                }
            })
            .catch((err) => console.log(err))
    }, [])

    return <React.Fragment>
        <DashboardNewHeader />
        <main className='' style={{ backgroundColor: "white" }}>
            <Outlet />
        </main>
    </React.Fragment >

}
