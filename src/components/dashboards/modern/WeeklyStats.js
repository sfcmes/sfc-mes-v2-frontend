import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Box, Card } from '@mui/material';
import DashboardCard from '../../shared/DashboardCard';
import ProductCarousel from '../../apps/ecommerce/productDetail/ProductCarousel';
import { IconGridDots } from '@tabler/icons';

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

const WeeklyStats = ({ stats, projectName }) => {
  const theme = useTheme();

  const iconStyles = {
    width: 18,
    height: 18,
  };

  const updatedStats = stats.map((stat) => ({
    ...stat,
    icon: <IconGridDots style={iconStyles} />,
    color: getStatusColor(stat.title),
    lightcolor: theme.palette.grey[200],
  }));

  return (
    <DashboardCard title="ความคืบหน้าโครงการ" subtitle={projectName}>
      <>
        <Stack mt={4}>
          <ProductCarousel />
        </Stack>
        <Stack spacing={3} mt={3}>
          {updatedStats.map((stat, i) => (
            <Card
              key={i}
              sx={{
                backgroundColor: stat.lightcolor,
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
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    variant="rounded"
                    sx={{ bgcolor: stat.lightcolor, color: stat.color, width: 40, height: 40 }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" mb="4px">
                      {stat.title}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      {stat.subtitle}
                    </Typography>
                  </Box>
                </Stack>
                <Avatar
                  sx={{
                    bgcolor: stat.lightcolor,
                    color: stat.color,
                    width: 42,
                    height: 24,
                    borderRadius: '4px',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="600">
                    {stat.percent}%
                  </Typography>
                </Avatar>
              </Stack>
            </Card>
          ))}
        </Stack>
      </>
    </DashboardCard>
  );
};

export default WeeklyStats;
