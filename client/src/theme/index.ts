import { createTheme } from '@mui/material/styles';
import { paletteOptions } from './palette';
import { typographyOptions } from './typography';
import { componentOverrides } from './components';

const theme = createTheme({
  palette: paletteOptions,
  typography: typographyOptions,
  components: componentOverrides,
});

export default theme;

// Re-export tokens for direct use in components
export { gray, primary, success, warning, error, info, purple, spacing, shadows, radius, borders } from './tokens';
