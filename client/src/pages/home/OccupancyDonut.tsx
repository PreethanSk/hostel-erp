import { Box, Typography, Skeleton } from '@mui/material';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { gray, primary, success, warning, radius, shadows } from '../../theme';

interface OccupancyDonutProps {
  cotsDetail: any;
  loading: boolean;
}

const COLORS = [
  primary[600],   // Occupied
  success[500],   // Vacant
  warning[500],   // Booked
  gray[300],      // Maintenance
];

const LABELS = ['Occupied', 'Vacant', 'Booked', 'Maintenance'];

export default function OccupancyDonut({ cotsDetail, loading }: OccupancyDonutProps) {
  const occupied = cotsDetail?.occupied?.length || 0;
  const available = cotsDetail?.available?.length || 0;
  const booked = cotsDetail?.booked?.length || 0;
  const maintenance = cotsDetail?.maintenance?.length || 0;
  const total = cotsDetail?.totalCots?.length || 0;

  const data = [
    { name: 'Occupied', value: occupied },
    { name: 'Vacant', value: available },
    { name: 'Booked', value: booked },
    { name: 'Maintenance', value: maintenance },
  ].filter((d) => d.value > 0);

  const hasData = data.length > 0;

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: `${radius.lg}px`,
        border: `1px solid ${gray[200]}`,
        padding: 3,
        height: '100%',
      }}
    >
      <Typography sx={{ fontSize: '16px', fontWeight: 600, color: gray[900], mb: 2 }}>
        Bed Occupancy
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Skeleton variant="circular" width={200} height={200} />
        </Box>
      ) : !hasData ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography sx={{ fontSize: '13px', color: gray[400] }}>No data available</Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', height: 280, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={95}
                dataKey="value"
                stroke="none"
                paddingAngle={2}
              >
                {data.map((entry, index) => {
                  const colorIndex = LABELS.indexOf(entry.name);
                  return <Cell key={entry.name} fill={COLORS[colorIndex >= 0 ? colorIndex : 0]} />;
                })}
              </Pie>
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={8}
                formatter={(value: string, entry: any) => {
                  const item = data.find((d) => d.name === value);
                  const pct = total > 0 ? Math.round(((item?.value || 0) / total) * 100) : 0;
                  return (
                    <span style={{ color: gray[600], fontSize: '12px' }}>
                      {value}: {item?.value} ({pct}%)
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <Box
            sx={{
              position: 'absolute',
              top: '45%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography sx={{ fontSize: '28px', fontWeight: 700, color: gray[900], lineHeight: 1 }}>
              {total}
            </Typography>
            <Typography sx={{ fontSize: '11px', color: gray[500], mt: 0.25 }}>
              Total
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
