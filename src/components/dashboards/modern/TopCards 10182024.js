import React from 'react';
import { Grid, Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import producedGif from 'src/assets/animated-icons/producedgif.gif';
import transporting from 'src/assets/animated-icons/transporting.gif';
import accepted from 'src/assets/animated-icons/accepted.gif';
import installed from 'src/assets/animated-icons/installed.gif';
import rejected from 'src/assets/animated-icons/rejected.gif';

const COLORS = {
  planning: '#64b5f6',
  manufactured: '#82ca9d',
  in_transit: '#ffc658',
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
  const isIphoneSE = useMediaQuery('(max-width:375px)');
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const totalComponents = isResetState ? 0 : stats.reduce((sum, stat) => sum + stat.count, 0);
  const planningCount = isResetState
    ? 0
    : stats.find((stat) => stat.status === 'planning')?.count || 0;
  const inProgressCount = isResetState ? 0 : totalComponents - planningCount;

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
    <Box sx={{ mb: 2 }}>
      <Paper
        elevation={3}
        sx={{
          p: isIphoneSE ? 0.5 : isSmall ? 2 : 3,
          mb: isIphoneSE ? 1 : 3,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
        }}
      >
        <Typography
          variant={isIphoneSE ? 'subtitle2' : isSmall ? 'h6' : 'h5'}
          fontWeight={600}
          noWrap
          mb={1}
        >
          โครงการ: {isResetState ? 'Not Selected' : projectName}
        </Typography>
      </Paper>
      <Grid container spacing={isIphoneSE ? 0.5 : 3}>
        {displayStats.map((stat, i) => {
          const { bg, color } = getStatusColor(stat.status);
          return (
            <Grid item xs={3} sm={4} md={2.4} key={i}>
              <Box
                sx={{
                  backgroundColor: bg,
                  color: color,
                  borderRadius: 2,
                  p: isIphoneSE ? 0.5 : 2,
                  textAlign: 'center',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Box
                  component="img"
                  src={getStatusGif(stat.status)}
                  alt={stat.displayTitle}
                  sx={{
                    width: isIphoneSE ? '30px' : '50px',
                    height: isIphoneSE ? '30px' : '50px',
                    objectFit: 'contain',
                    mt: isIphoneSE ? 0.5 : 1,
                    mb: isIphoneSE ? 0.5 : 1,
                  }}
                />
                <Typography
                  variant={isIphoneSE ? 'caption' : 'subtitle1'}
                  fontWeight={600}
                  align="center"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.2,
                    fontSize: isIphoneSE ? '0.6rem' : 'inherit',
                    mt: 0.5,
                    mb: 0.5,
                  }}
                >
                  {stat.displayTitle}
                </Typography>
                <Typography
                  variant={isIphoneSE ? 'body2' : 'h4'}
                  fontWeight={600}
                  align="center"
                  sx={{
                    fontSize: isIphoneSE ? '0.8rem' : 'inherit',
                    lineHeight: isIphoneSE ? 1.1 : 'inherit',
                  }}
                >
                  {stat.percent}%
                </Typography>
                <Typography
                  variant={isIphoneSE ? 'caption' : 'body2'}
                  align="center"
                  sx={{
                    fontSize: isIphoneSE ? '0.5rem' : 'inherit',
                    mb: 0.5,
                  }}
                >
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
