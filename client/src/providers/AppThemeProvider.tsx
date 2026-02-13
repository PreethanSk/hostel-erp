import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '../theme';

interface Props {
    children?: React.ReactNode;
}

function AppThemeProvider({ children }: Props) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}

export default AppThemeProvider;
