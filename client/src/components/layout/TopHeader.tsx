import { Box, IconButton, Typography, Badge } from '@mui/material';
import { Menu as MenuIcon, PanelLeftClose, PanelLeftOpen, Bell } from 'lucide-react';
import { gray } from '../../theme';
import UserMenu from './UserMenu';

interface TopHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  onMobileMenuOpen: () => void;
  isMobile: boolean;
}

export default function TopHeader({ collapsed, onToggle, onMobileMenuOpen, isMobile }: TopHeaderProps) {
  return (
    <Box
      sx={{
        height: 56,
        backgroundColor: '#fff',
        borderBottom: `1px solid ${gray[200]}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        position: 'sticky',
        top: 0,
        zIndex: 1100,
      }}
    >
      {/* Left side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {isMobile ? (
          <IconButton size="small" onClick={onMobileMenuOpen} sx={{ color: gray[700] }}>
            <MenuIcon size={20} />
          </IconButton>
        ) : (
          <IconButton size="small" onClick={onToggle} sx={{ color: gray[500] }}>
            {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </IconButton>
        )}
        {/* Logo text visible when sidebar is collapsed */}
        {(collapsed || isMobile) && (
          <Typography
            sx={{
              fontSize: '16px',
              fontWeight: 700,
              color: gray[800],
              letterSpacing: '-0.01em',
            }}
          >
            Hostel ERP
          </Typography>
        )}
      </Box>

      {/* Right side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton size="small" sx={{ color: gray[500] }}>
          <Badge
            variant="dot"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#F04438',
                width: 8,
                height: 8,
                minWidth: 8,
                borderRadius: '50%',
              },
            }}
          >
            <Bell size={20} />
          </Badge>
        </IconButton>
        <UserMenu />
      </Box>
    </Box>
  );
}
