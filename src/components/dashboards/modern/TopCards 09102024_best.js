import React from 'react';
import { Grid, Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles'; // Import alpha utility from MUI
import producedGif from 'src/assets/animated-icons/producedgif.gif';
import transporting from 'src/assets/animated-icons/transporting.gif';
import transported from 'src/assets/animated-icons/transported.gif';
import accepted from 'src/assets/animated-icons/accepted.gif';
import installed from 'src/assets/animated-icons/installed.gif';
import rejected from 'src/assets/animated-icons/rejected.gif';

const getStatusColor = (status) => {
  switch (status) {
    case 'manufactured':
      return 'primary';
    case 'in_transit':
      return 'warning';
    case 'transported':
      return 'secondary';
    case 'accepted':
      return 'info';
    case 'installed':
      return 'success';
    case 'rejected':
      return 'error';
    default:
      return 'info';
  }
};

const getStatusGif = (status) => {
  switch (status) {
    case 'manufactured':
      return producedGif;
    case 'in_transit':
      return transporting;
    case 'transported':
      return transported;
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

const TopCards = ({ stats, projectName }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const totalComponents = stats.reduce((sum, stat) => 
    stat.status !== 'planning' ? sum + stat.count : sum, 0
  );

  const planningCount = stats.find(stat => stat.status === 'planning')?.count || 0;

  const displayStats = stats.filter(stat => stat.status !== 'planning');

  return (
    <Box>
      {!isSmallScreen && (
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
              <Typography variant="h5" fontWeight={600}>
                โครงการ: {projectName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" align="right">
                จำนวนชิ้นงานทั้งหมด: {totalComponents + planningCount}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                อยู่ระหว่างดำเนินการ: {totalComponents}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" align="right">
                อยู่ในขั้นตอนการวางแผน: {planningCount}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
      <Grid container spacing={3}>
        {displayStats.map((stat, i) => (
          <Grid item xs={6} sm={4} md={2} key={i}>
            <Box
              bgcolor={`${getStatusColor(stat.status)}.light`}
              textAlign="center"
              borderRadius={2}
              sx={{
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
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
                color={`${getStatusColor(stat.status)}.main`}
                mt={1}
                variant="subtitle1"
                fontWeight={600}
              >
                {stat.displayTitle}
              </Typography>
              <Typography 
                color={`${getStatusColor(stat.status)}.main`} 
                variant="h4" 
                fontWeight={600}
              >
                {stat.percent}%
              </Typography>
              <Typography 
                color={`${getStatusColor(stat.status)}.main`} 
                variant="body2"
                pb={2}
              >
                ({stat.count})
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TopCards;
