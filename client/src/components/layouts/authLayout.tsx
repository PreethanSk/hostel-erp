import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useStateValue } from '../../providers/StateProvider';
import { ROUTES } from '../../configs/constants';
import { shadows, radius } from '../../theme';

export default function AuthLayout() {
    const [{ user }]: any = useStateValue();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.emailAddress) {
            navigate(ROUTES.HOME.DASHBOARD);
        }
    }, []);

    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #101828 0%, #1D2939 50%, #0F1728 100%)',
                backgroundImage: `
                    linear-gradient(135deg, #101828 0%, #1D2939 50%, #0F1728 100%),
                    radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: 'cover, 24px 24px',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
            }}
        >
            <Box
                sx={{
                    maxWidth: 440,
                    width: '100%',
                    backgroundColor: '#fff',
                    borderRadius: `${radius.xl}px`,
                    boxShadow: shadows.xl,
                    padding: '40px',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
