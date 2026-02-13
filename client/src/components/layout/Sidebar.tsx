import { Box, Typography } from '@mui/material';
import { gray } from '../../theme';
import { navigationConfig } from '../../configs/navigation';
import SidebarItem from './SidebarItem';
import SidebarGroup from './SidebarGroup';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavClick?: () => void; // for mobile drawer close
}

export default function Sidebar({ collapsed, onNavClick }: SidebarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {/* Logo area */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: collapsed ? 1 : 2.5,
          py: 2,
          minHeight: 56,
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
        }}
      >
        <Typography
          sx={{
            fontSize: collapsed ? '14px' : '16px',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          {collapsed ? 'H' : 'Hostel ERP'}
        </Typography>
      </Box>

      {/* Navigation sections */}
      <Box sx={{ flex: 1, py: 1 }}>
        {navigationConfig.map((section, sIdx) => (
          <Box key={section.title} sx={{ mt: sIdx === 0 ? 0 : 3 }}>
            {/* Section header */}
            {!collapsed && (
              <Typography
                sx={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: gray[400],
                  letterSpacing: '0.06em',
                  px: 2,
                  mb: 0.5,
                }}
              >
                {section.title}
              </Typography>
            )}

            {/* Items */}
            {section.items.map((item) => {
              if (item.children && item.children.length > 0) {
                return (
                  <SidebarGroup
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    children={item.children}
                    collapsed={collapsed}
                    onChildClick={onNavClick}
                  />
                );
              }
              if (item.path) {
                return (
                  <SidebarItem
                    key={item.path}
                    label={item.label}
                    path={item.path}
                    icon={item.icon}
                    collapsed={collapsed}
                    onClick={onNavClick}
                  />
                );
              }
              return null;
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
