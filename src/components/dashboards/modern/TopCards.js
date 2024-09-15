import React from 'react';
import { Grid, Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import producedGif from 'src/assets/animated-icons/producedgif.gif';
import transporting from 'src/assets/animated-icons/transporting.gif';
import accepted from 'src/assets/animated-icons/accepted.gif';
import installed from 'src/assets/animated-icons/installed.gif';
import rejected from 'src/assets/animated-icons/rejected.gif';

// Define COLORS and STATUS_THAI to match TopPerformers
const COLORS = {
  planning: '#64b5f6',
  manufactured: '#82ca9d',
  in_transit: '#ffc658', // Same as 'transported' in Tab2Content
  accepted: '#8e44ad',
  installed: '#27ae60',
  rejected: '#ff6b6b',
};

const STATUS_THAI = {
  planning: 'วางแผน',
  manufactured: 'ผลิตแล้ว',
  in_transit: 'ขนส่งสำเร็จ',
  accepted: 'ตรวจรับแล้ว',
  installed: 'ติดตั้งแล้ว',
  rejected: 'ถูกปฏิเสธ',
};

// Simplify getStatusColor to match the color usage in TopPerformers
const getStatusColor = (status) => {
  return { bg: COLORS[status], color: '#ffffff' };
};

const getStatusGif = (status) => {
  switch (status) {
    case 'manufactured':
      return producedGif;
    case 'in_transit':
      return transporting;
    case 'accepted':
      return accepted;
    case 'installed':
      return installed;
    case 'rejected':
      return rejected;
    default:
      return producedGif;
  }
};

const statusOrder = ['manufactured', 'in_transit', 'accepted', 'installed', 'rejected'];

const TopCards = ({ stats, projectName, isResetState }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const totalComponents = isResetState ? 0 : stats.reduce((sum, stat) => sum + stat.count, 0);
  const planningCount = isResetState
    ? 0
    : stats.find((stat) => stat.status === 'planning')?.count || 0;
  const inProgressCount = isResetState ? 0 : totalComponents - planningCount;

  // Prepare displayStats to include all statuses
  const displayStats = statusOrder.map((status) => {
    const stat = stats.find((s) => s.status === status) || { count: 0 };
    const percent =
      totalComponents > 0 ? ((stat.count / totalComponents) * 100).toFixed(1) : 0;
    return {
      status,
      displayTitle: STATUS_THAI[status],
      count: isResetState ? 0 : stat.count,
      percent: isResetState ? 0 : percent,
    };
  });

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" fontWeight={600}>
              โครงการ: {isResetState ? ' ' : projectName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" align="right">
              จำนวนชิ้นงานทั้งหมด: {totalComponents}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">
              อยู่ระหว่างดำเนินการ: {inProgressCount}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" align="right">
              อยู่ในขั้นตอนการวางแผน: {planningCount}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <Grid container spacing={3}>
        {displayStats.map((stat, i) => {
          const { bg, color } = getStatusColor(stat.status);
          return (
            <Grid item xs={6} sm={4} md={2.4} key={i}>
              <Box
                textAlign="center"
                borderRadius={2}
                sx={{
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                  backgroundColor: bg,
                  color: color,
                }}
              >
                <Box
                  component="img"
                  src={getStatusGif(stat.status)}
                  alt={stat.displayTitle}
                  sx={{
                    width: 50,
                    height: 50,
                    objectFit: 'contain',
                    mt: 2,
                  }}
                />
                <Typography mt={1} variant="subtitle1" fontWeight={600}>
                  {stat.displayTitle}
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  {stat.percent}%
                </Typography>
                <Typography variant="body2" pb={2}>
                  ({stat.count})
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default TopCards;
