import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { gray, radius, shadows } from '../../theme';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' };
  accentColor?: string;
  loading?: boolean;
  onClick?: () => void;
}

export default function StatsCard({
  label,
  value,
  icon,
  trend,
  accentColor = gray[500],
  loading = false,
  onClick,
}: StatsCardProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        backgroundColor: '#fff',
        borderRadius: `${radius.lg}px`,
        border: `1px solid ${gray[200]}`,
        padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 200ms ease',
        '&:hover': onClick
          ? { boxShadow: shadows.sm }
          : undefined,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        {icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: `${accentColor}14`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
        <Typography sx={{ fontSize: '13px', color: gray[500] }}>
          {label}
        </Typography>
      </Box>

      {loading ? (
        <Skeleton variant="text" width={80} height={38} sx={{ borderRadius: `${radius.md}px` }} />
      ) : (
        <Typography
          sx={{
            fontSize: '30px',
            fontWeight: 600,
            lineHeight: '38px',
            color: gray[900],
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </Typography>
      )}

      {trend && !loading && (
        <Typography
          sx={{
            fontSize: '13px',
            mt: 0.5,
            color:
              trend.direction === 'up'
                ? '#12B76A'
                : trend.direction === 'down'
                  ? '#F04438'
                  : gray[500],
          }}
        >
          {trend.direction === 'up' && '\u2191 '}
          {trend.direction === 'down' && '\u2193 '}
          {trend.value}
        </Typography>
      )}
    </Box>
  );
}
