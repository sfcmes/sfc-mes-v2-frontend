import React from 'react';
import { useTheme, styled } from '@mui/material/styles';
import { Stack, Typography, Box, Card } from '@mui/material';
import DashboardCard from '../../shared/DashboardCard';
import ProductCarousel from '../../apps/ecommerce/productDetail/ProductCarousel';

// Reusing getStatusColor function
const getStatusColor = (status) => {
  switch (status) {
    case 'ผลิตแล้ว':
      return '#FFC107';
    case 'อยู่ระหว่างขนส่ง':
      return '#2196F3';
    case 'ขนส่งสำเร็จ':
      return '#C2AFF0';
    case 'ติดตั้งแล้ว':
      return '#18F2B2';
    case 'Rejected':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

const WeeklyStats = () => {
  const theme = useTheme();

  const updatedStats = [
    { title: 'ผลิตแล้ว', subtitle: '', percent: 18 },
    { title: 'อยู่ระหว่างขนส่ง', subtitle: '', percent: 12 },
    { title: 'ขนส่งสำเร็จ', subtitle: '', percent: 20 },
    { title: 'ติดตั้งแล้ว', subtitle: '', percent: 35 },
    { title: 'Rejected', subtitle: '', percent: 2 },
  ];

  return (
    <DashboardCard title="ความคืบหน้าโครงการ" subtitle="Project A">
      <>
        <Stack mt={4}>
          <ProductCarousel />
        </Stack>
        <Stack spacing={3} mt={3}>
          {updatedStats.map((stat, i) => (
            <Card
              key={i}
              style={{
                backgroundColor: getStatusColor(stat.title),
                padding: theme.spacing(2),
                borderRadius: theme.shape.borderRadius,
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6" mb="4px">
                    {stat.title}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    {stat.subtitle}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" fontWeight="600">
                  {stat.percent}%
                </Typography>
              </Stack>
            </Card>
          ))}
        </Stack>
      </>
    </DashboardCard>
  );
};

export default WeeklyStats;
