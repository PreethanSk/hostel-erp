import { useState, useEffect } from 'react';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { gray } from '../../theme';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import Breadcrumbs from './Breadcrumbs';
import ContentArea from './ContentArea';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;

export default function AppShell() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 900-1280

  // Load collapse state from localStorage
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  // On tablet, default collapsed
  useEffect(() => {
    if (isTablet && !collapsed) {
      setCollapsed(true);
    }
  }, [isTablet]);

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebarCollapsed', String(next));
  };

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop/Tablet sidebar */}
      {!isMobile && (
        <Box
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            transition: 'width 200ms ease',
          }}
        >
          <Box
            sx={{
              width: sidebarWidth,
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              backgroundColor: gray[900],
              transition: 'width 200ms ease',
              zIndex: 1200,
              overflowX: 'hidden',
            }}
          >
            <Sidebar
              collapsed={collapsed}
              onToggle={handleToggle}
            />
          </Box>
        </Box>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          PaperProps={{
            sx: {
              width: SIDEBAR_WIDTH,
              backgroundColor: gray[900],
            },
          }}
        >
          <Sidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            onNavClick={() => setMobileOpen(false)}
          />
        </Drawer>
      )}

      {/* Main content area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          minWidth: 0, // Prevent flex overflow
        }}
      >
        <TopHeader
          collapsed={collapsed}
          onToggle={handleToggle}
          onMobileMenuOpen={() => setMobileOpen(true)}
          isMobile={isMobile}
        />
        <Breadcrumbs />
        <ContentArea>
          <Outlet />
        </ContentArea>
      </Box>
    </Box>
  );
}
