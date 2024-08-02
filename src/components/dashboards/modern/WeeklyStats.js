import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Box, Card } from '@mui/material';
import DashboardCard from '../../shared/DashboardCard';
import ProductCarousel from '../../apps/ecommerce/productDetail/ProductCarousel';
import { IconGridDots } from '@tabler/icons';

const getStatusColor = (status) => {
  switch (status) {
    case 'Manufactured':
      return '#53b3cb'; // Light blue: Indicates completion of manufacturing
    case 'In Transit':
      return '#e9eb9e'; // Light orange: Represents movement and transportation
    case 'Transported':
      return '#a1869e'; // Light green: Signifies arrival at destination
    case 'Accepted':
      return '#32d2a2'; // Light purple: Denotes approval and acceptance
    case 'Installed':
      return '#adfc92'; // Light cyan: Represents final installation and readiness
    case 'Rejected':
      return '#ed8209'; // Light red: Indicates issues or rejection
    default:
      return '#fefefe'; // Light grey: For unknown or default states
  }
};

const statusDisplayMap = {
  'Manufactured': 'ผลิตแล้ว',
  'In Transit': 'อยู่ระหว่างขนส่ง',
  'Transported': 'ขนส่งสำเร็จ',
  'Accepted': 'ตรวจรับแล้ว',
  'Installed': 'ติดตั้งแล้ว',
  'Rejected': 'ถูกปฏิเสธ'
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
    color: getStatusColor(stat.status),
    lightcolor: theme.palette.grey[200],
    displayTitle: statusDisplayMap[stat.status] || stat.status
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
                    sx={{ bgcolor: stat.color, color: theme.palette.getContrastText(stat.color), width: 40, height: 40 }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" mb="4px">
                      {stat.displayTitle}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      {stat.subtitle}
                    </Typography>
                  </Box>
                </Stack>
                <Avatar
                  sx={{
                    bgcolor: stat.color,
                    color: theme.palette.getContrastText(stat.color),
                    width: 60,
                    height: 24,
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
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
