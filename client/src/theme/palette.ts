import { PaletteOptions } from '@mui/material/styles';
import { gray, primary, success, warning, error, info } from './tokens';

export const paletteOptions: PaletteOptions = {
  primary: {
    main: primary[600],
    light: primary[100],
    dark: primary[700],
    contrastText: '#fff',
  },
  secondary: {
    main: gray[700],
    light: gray[100],
    dark: gray[900],
    contrastText: '#fff',
  },
  success: {
    main: success[500],
    light: success[50],
    dark: success[700],
  },
  warning: {
    main: warning[500],
    light: warning[50],
    dark: warning[700],
  },
  error: {
    main: error[500],
    light: error[50],
    dark: error[700],
  },
  info: {
    main: info[500],
    light: info[50],
    dark: info[700],
  },
  text: {
    primary: gray[900],
    secondary: gray[500],
    disabled: gray[400],
  },
  divider: gray[200],
  background: {
    default: gray[50],
    paper: '#FFFFFF',
  },
  action: {
    hover: gray[25],
    selected: primary[50],
    disabled: gray[300],
    disabledBackground: gray[100],
  },
};
