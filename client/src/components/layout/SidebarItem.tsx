import { Box, Tooltip, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { gray, primary } from '../../theme';
import * as LucideIcons from 'lucide-react';

interface SidebarItemProps {
  label: string;
  path: string;
  icon: string;
  collapsed: boolean;
  indent?: boolean;
  onClick?: () => void;
}

export default function SidebarItem({ label, path, icon, collapsed, indent = false, onClick }: SidebarItemProps) {
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Circle;

  return (
    <Tooltip title={collapsed ? label : ''} placement="right" arrow>
      <NavLink
        to={path}
        onClick={onClick}
        style={{ textDecoration: 'none' }}
      >
        {({ isActive }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              padding: collapsed ? '8px 0' : '8px 12px',
              paddingLeft: indent && !collapsed ? '36px' : collapsed ? 0 : '12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderLeft: isActive ? `3px solid ${primary[600]}` : '3px solid transparent',
              backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderRadius: '0 6px 6px 0',
              cursor: 'pointer',
              transition: 'background-color 150ms ease',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.06)',
              },
              mx: collapsed ? 'auto' : 0.5,
              my: 0.25,
            }}
          >
            <IconComponent
              size={20}
              color={isActive ? '#fff' : gray[400]}
              strokeWidth={isActive ? 2 : 1.5}
            />
            {!collapsed && (
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#fff' : gray[400],
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {label}
              </Typography>
            )}
          </Box>
        )}
      </NavLink>
    </Tooltip>
  );
}
