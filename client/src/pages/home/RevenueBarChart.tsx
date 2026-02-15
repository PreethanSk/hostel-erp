import { useMemo } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { gray, success, error as errorColor, radius } from '../../theme';

interface RevenueBarChartProps {
  paymentsDetail: any;
  loading: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

export default function RevenueBarChart({ paymentsDetail, loading }: RevenueBarChartProps) {
  const chartData = useMemo(() => {
    if (!paymentsDetail) return [];

    // Try to group payment records by month
    const allRecords: any[] = [];
    if (paymentsDetail?.paid) allRecords.push(...(Array.isArray(paymentsDetail.paid) ? paymentsDetail.paid : []));
    if (paymentsDetail?.pending) allRecords.push(...(Array.isArray(paymentsDetail.pending) ? paymentsDetail.pending : []));
    if (paymentsDetail?.totalPayments) allRecords.push(...(Array.isArray(paymentsDetail.totalPayments) ? paymentsDetail.totalPayments : []));

    if (allRecords.length === 0) return [];

    // Group by month from updatedAt or createdAt
    const monthMap: Record<string, { paid: number; pending: number }> = {};

    allRecords.forEach((record: any) => {
      const dateStr = record?.updatedAt || record?.createdAt || '';
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[monthKey]) monthMap[monthKey] = { paid: 0, pending: 0 };

      const paid = parseFloat(record?.totalPayment || record?.totalPaid || '0') || 0;
      const pending = parseFloat(record?.pendingPayment || record?.totalPending || '0') || 0;
      monthMap[monthKey].paid += paid;
      monthMap[monthKey].pending += pending;
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, val]) => {
        const [, m] = key.split('-');
        return {
          month: months[parseInt(m, 10) - 1] || key,
          Paid: Math.round(val.paid),
          Pending: Math.round(val.pending),
        };
      });
  }, [paymentsDetail]);

  const hasData = chartData.length > 0;

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
        Revenue Breakdown
      </Typography>

      {loading ? (
        <Skeleton variant="rectangular" height={240} sx={{ borderRadius: `${radius.md}px` }} />
      ) : !hasData ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography sx={{ fontSize: '13px', color: gray[400] }}>No payment data available</Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={gray[100]} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: gray[500] }}
                axisLine={{ stroke: gray[200] }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: gray[500] }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatCurrency(v)}
              />
              <Tooltip
                formatter={(value: number, name: string) => [`₹${value.toLocaleString('en-IN')}`, name]}
                contentStyle={{
                  borderRadius: 8,
                  border: `1px solid ${gray[200]}`,
                  fontSize: 13,
                  boxShadow: '0px 4px 8px rgba(16,24,40,0.1)',
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span style={{ color: gray[600], fontSize: 12 }}>{value}</span>
                )}
              />
              <Bar dataKey="Paid" fill={success[500]} radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Pending" fill={errorColor[500]} radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}
