import { useState } from 'react';
import { Avatar, Box, Menu, MenuItem, Typography, Divider } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../configs/constants';
import { useStateValue } from '../../providers/StateProvider';
import { gray, shadows, radius } from '../../theme';

export default function UserMenu() {
  const [{ user }, dispatch]: any = useStateValue();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleLogout = () => {
    setAnchorEl(null);
    localStorage.clear();
    dispatch({ type: 'SET_USER', user: null });
    navigate(ROUTES.AUTH.LOGIN);
  };

  const avatarSrc = user?.profilePic
    ? ROUTES.API.DOWNLOAD_FILE + user.profilePic
    : undefined;

  const initials = (user?.firstName?.[0] || 'U').toUpperCase();

  return (
    <>
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: `${radius.md}px`,
          '&:hover': { backgroundColor: gray[50] },
        }}
      >
        <Avatar
          src={avatarSrc}
          sx={{ width: 32, height: 32, fontSize: '13px', fontWeight: 600, backgroundColor: gray[200], color: gray[700] }}
        >
          {initials}
        </Avatar>
        <Typography
          sx={{
            fontSize: '13px',
            fontWeight: 500,
            color: gray[700],
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {user?.firstName || 'User'}
        </Typography>
        <ChevronDown size={16} color={gray[400]} />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              width: 200,
              boxShadow: shadows.lg,
              borderRadius: `${radius.lg}px`,
              border: `1px solid ${gray[200]}`,
              mt: 1,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 600, color: gray[800] }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography sx={{ fontSize: '12px', color: gray[500] }}>
            {user?.emailAddress || 'Admin'}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          disabled
          sx={{ fontSize: '13px', color: gray[500], py: 1 }}
        >
          Profile
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{ fontSize: '13px', color: '#F04438', py: 1 }}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
