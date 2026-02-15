import { useState, useEffect } from 'react';
import { Box, Collapse, Tooltip, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { gray } from '../../theme';
import * as LucideIcons from 'lucide-react';
import SidebarItem from './SidebarItem';
import type { NavItem } from '../../configs/navigation';

interface SidebarGroupProps {
  label: string;
  icon: string;
  children: NavItem[];
  collapsed: boolean;
  onChildClick?: () => void;
}

export default function SidebarGroup({ label, icon, children, collapsed, onChildClick }: SidebarGroupProps) {
  const location = useLocation();
  const hasActiveChild = children.some((c) => c.path === location.pathname);
  const [open, setOpen] = useState(hasActiveChild);
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Circle;

  // Auto-open if a child becomes active (e.g. navigating via URL)
  useEffect(() => {
    if (hasActiveChild && !open) setOpen(true);
  }, [hasActiveChild]);

  if (collapsed) {
    // In collapsed mode, show icon only with tooltip listing children
    return (
      <Tooltip title={label} placement="right" arrow>
        <Box
          onClick={() => setOpen(!open)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 0',
            cursor: 'pointer',
            backgroundColor: hasActiveChild ? 'rgba(255,255,255,0.08)' : 'transparent',
            borderLeft: hasActiveChild ? `3px solid #155EEF` : '3px solid transparent',
            borderRadius: '0 6px 6px 0',
            my: 0.25,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
          }}
        >
          <IconComponent size={20} color={hasActiveChild ? '#fff' : gray[400]} strokeWidth={1.5} />
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box>
      {/* Parent row */}
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          padding: '8px 12px',
          cursor: 'pointer',
          borderRadius: '0 6px 6px 0',
          mx: 0.5,
          my: 0.25,
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
        }}
      >
        <IconComponent
          size={20}
          color={hasActiveChild ? '#fff' : gray[400]}
          strokeWidth={1.5}
        />
        <Typography
          sx={{
            fontSize: '13px',
            fontWeight: hasActiveChild ? 600 : 400,
            color: hasActiveChild ? '#fff' : gray[400],
            flex: 1,
          }}
        >
          {label}
        </Typography>
        <ChevronRight
          size={16}
          color={gray[400]}
          style={{
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
          }}
        />
      </Box>

      {/* Children */}
      <Collapse in={open} timeout={200}>
        {children.map((child) =>
          child.path ? (
            <SidebarItem
              key={child.path}
              label={child.label}
              path={child.path}
              icon={child.icon}
              collapsed={false}
              indent
              onClick={onChildClick}
            />
          ) : null
        )}
      </Collapse>
    </Box>
  );
}
