import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import logimg from '../../assets/images/Logn Background.png';
import { useStateValue } from '../../providers/StateProvider';
import { ROUTES } from '../../configs/constants';
export default function AuthLayout() {
    const [{ user }]: any = useStateValue();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.emailAddress) {
            navigate(ROUTES.HOME.DASHBOARD)
        }
    }, [])
    return <React.Fragment>
        <div className='container-fluid ' style={{
            backgroundImage: `url(${logimg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100vh'
        }}>
            <div className="d-flex justify-content-center align-items-center  vh-100 g-0">
                <div className="signUpcard   rounded--1 px-5 py-5">
                    <main>
                        <Outlet />
                    </main>
                </div>
            </div>
        </div >
    </React.Fragment >
}
