import { Box, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { gray, primary } from '../../theme';
import { getNavParent } from '../../configs/navigation';

export default function Breadcrumbs() {
  const location = useLocation();
  const navInfo = getNavParent(location.pathname);

  if (!navInfo) return null;

  const crumbs: { label: string; path?: string }[] = [];

  // Add section if it's a child of a group
  if (navInfo.parent) {
    crumbs.push({ label: navInfo.parent });
  }

  // Last crumb is current page (no link)
  crumbs.push({ label: navInfo.label });

  return (
    <Box
      sx={{
        height: 40,
        backgroundColor: '#fff',
        borderBottom: `1px solid ${gray[200]}`,
        display: 'flex',
        alignItems: 'center',
        px: 3,
        gap: 0.5,
      }}
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {index > 0 && <ChevronRight size={14} color={gray[400]} />}
            {isLast ? (
              <Typography sx={{ fontSize: '13px', fontWeight: 500, color: gray[800] }}>
                {crumb.label}
              </Typography>
            ) : (
              <Typography
                component={crumb.path ? Link : 'span'}
                {...(crumb.path ? { to: crumb.path } : {})}
                sx={{
                  fontSize: '13px',
                  color: gray[500],
                  textDecoration: 'none',
                  '&:hover': crumb.path ? { color: primary[600] } : undefined,
                }}
              >
                {crumb.label}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
