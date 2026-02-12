import React from 'react';
import { createTheme, ThemeProvider } from "@mui/material";

interface props {
    children?: React.ReactNode;
}

let theme = createTheme({
    palette: {
        primary: {
            main: '#F76D61',
            contrastText: '#fff'
        },
        secondary: {
            main: '#000',
            contrastText: '#ffffff'
        },
        action: {
            disabled: '#ffffff',
        }
    },
    typography: {
        fontFamily: 'Nunito, sans-serif !important',
        button: {
            textTransform: 'none',
        }
    },
    components: {
        MuiButtonBase: {
            defaultProps: {
                disableRipple: true,
            }
        }
    }
});

function AppThemeProvider({ children }: props) {
    return (<ThemeProvider theme={theme}>{children}</ThemeProvider>);
}

export default AppThemeProvider;