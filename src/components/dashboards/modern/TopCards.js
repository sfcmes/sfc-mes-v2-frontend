import React from 'react';
import { Grid, Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import producedGif from 'src/assets/animated-icons/producedgif.gif';
import transporting from 'src/assets/animated-icons/transporting.gif';
import accepted from 'src/assets/animated-icons/accepted.gif';
import installed from 'src/assets/animated-icons/installed.gif';
import rejected from 'src/assets/animated-icons/rejected.gif';

const getStatusColor = (status) => {
  switch (status) {
    case 'manufactured':
      return { bg: 'primary.light', color: 'primary.main' };
    case 'in_transit':
      return { bg: 'info.light', color: 'info.main' };
    case 'accepted':
      return { bg: 'secondary.light', color: 'secondary.main' };
    case 'installed':
      return { bg: 'warning.light', color: 'warning.main' };
    case 'rejected':
      return { bg: 'error.light', color: 'error.main' };
    default:
      return { bg: 'grey.light', color: 'grey.main' };
  }
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

const TopCards = ({ stats, projectName, isResetState }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const totalComponents = isResetState ? 0 : stats.reduce((sum, stat) => sum + stat.count, 0);
  const planningCount = isResetState ? 0 : stats.find(stat => stat.status === 'planning')?.count || 0;
  const inProgressCount = isResetState ? 0 : totalComponents - planningCount;

  // Filter out 'planning' and 'transported' statuses
  const displayStats = isResetState ? [] : stats.filter(stat => stat.status !== 'planning' && stat.status !== 'transported');

  return (
    <Box>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2, 
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          color: 'white' 
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
                bgcolor={bg}
                textAlign="center"
                borderRadius={2}
                sx={{
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                  backgroundColor: alpha(theme.palette[bg.split('.')[0]][bg.split('.')[1]], 0.7),
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
                <Typography
                  color={color}
                  mt={1}
                  variant="subtitle1"
                  fontWeight={600}
                >
                  {stat.displayTitle}
                </Typography>
                <Typography 
                  color={color}
                  variant="h4" 
                  fontWeight={600}
                >
                  {stat.percent}%
                </Typography>
                <Typography 
                  color={color}
                  variant="body2"
                  pb={2}
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