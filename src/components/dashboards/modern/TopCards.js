import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import producedGif from 'src/assets/animated-icons/producedgif.gif';
import transporting from 'src/assets/animated-icons/transporting.gif';
import accepted from 'src/assets/animated-icons/accepted.gif';
import installed from 'src/assets/animated-icons/installed.gif';
import rejected from 'src/assets/animated-icons/rejected.gif';
import { fetchComponentStats } from 'src/utils/api';

// Constants
const COLORS = {
  manufactured: '#82ca9d',
  transported: '#ffc658',
  accepted: '#8e44ad',
  installed: '#27ae60',
  rejected: '#ff6b6b',
};

const STATUS_THAI = {
  manufactured: 'ผลิตแล้ว',
  transported: 'ขนส่งสำเร็จ',
  accepted: 'ตรวจรับแล้ว',
  installed: 'ติดตั้งแล้ว',
  rejected: 'ถูกปฏิเสธ',
};

const STATUS_GIFS = {
  manufactured: producedGif,
  transported: transporting,
  accepted: accepted,
  installed: installed,
  rejected: rejected,
};

// StatusCard Component
const StatusCard = ({ status, count, percent, isXsScreen, isSmScreen }) => (
  <Box
    sx={{
      backgroundColor: COLORS[status],
      color: '#ffffff',
      borderRadius: isXsScreen ? 1 : 2,
      p: isXsScreen ? 0.5 : (isSmScreen ? 1 : 1.5),
      textAlign: 'center',
      transition: 'transform 0.3s ease-in-out',
      '&:hover': {
        transform: isXsScreen ? 'none' : 'scale(1.05)',
      },
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <Box
      component="img"
      src={STATUS_GIFS[status]}
      alt={STATUS_THAI[status]}
      sx={{
        width: isXsScreen ? '20px' : (isSmScreen ? '25px' : '40px'),
        height: isXsScreen ? '20px' : (isSmScreen ? '25px' : '40px'),
        objectFit: 'contain',
        margin: 'auto',
      }}
    />
    <Box>
      <Typography
        variant={isXsScreen ? 'caption' : (isSmScreen ? 'body2' : 'subtitle2')}
        fontWeight={600}
        sx={{
          mt: 1,
          fontSize: isXsScreen ? '0.5rem' : (isSmScreen ? '0.7rem' : '0.9rem'),
        }}
      >
        {STATUS_THAI[status]}
      </Typography>
      <Typography
      variant={isXsScreen ? 'caption' : (isSmScreen ? 'body2' : 'h6')}
      fontWeight={600}
      sx={{
        fontSize: isXsScreen ? '0.6rem' : (isSmScreen ? '0.8rem' : '1rem'),
        mt: 1
      }}
    >
      {Number(percent || 0).toFixed(1)}%
    </Typography>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          fontSize: isXsScreen ? '0.4rem' : (isSmScreen ? '0.5rem' : '0.7rem'),
          mt: 0.5
        }}
      >
        ({count})
      </Typography>
    </Box>
  </Box>
);

// Project Summary Component
const ProjectSummary = ({ stats, projectName, isXsScreen }) => (
  <Paper
    elevation={3}
    sx={{
      p: isXsScreen ? 1 : { xs: 1, sm: 2, md: 3 },
      mb: isXsScreen ? 1 : 3,
      borderRadius: isXsScreen ? 0 : 2,
      backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.9),
    }}
  >
    <Typography
      variant={isXsScreen ? 'subtitle1' : 'h6'}
      fontWeight={600}
      noWrap
      mb={isXsScreen ? 0.5 : 1}
    >
      โครงการ: {projectName || 'เลือกโครงการ'}
    </Typography>
    {/* {stats.rejected_count > 0 && (
      <>
        <Typography variant="body2" color="error.main">
          ถูกปฏิเสธ: {stats.rejected_count} ชิ้น ({Number(stats.rejected_percent || 0).toFixed(1)}%)
        </Typography>
        <Typography variant="body2">
          ต้องผลิตทั้งหมด: {stats.total_components + stats.rejected_count} ชิ้น
        </Typography>
      </>
    )} */}
  </Paper>
);

// Main TopCards Component
const TopCards = ({ projectId, projectName, isResetState }) => {
  const [stats, setStats] = useState({
    manufactured_count: 0,
    transported_count: 0,
    accepted_count: 0,
    installed_count: 0,
    rejected_count: 0,
    manufactured_percent: 0,
    transported_percent: 0,
    accepted_percent: 0,
    installed_percent: 0,
    rejected_percent: 0
  });
  const [loading, setLoading] = useState(false);

  // เพิ่มการใช้ theme และ media queries
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    const loadStats = async () => {
      if (!projectId || isResetState) {
        setStats(null);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchComponentStats(projectId);
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [projectId, isResetState]);

  if (loading || !stats) return null;

  return (
    <Box sx={{ mb: isXsScreen ? 1 : 2 }}>
      <ProjectSummary 
        stats={stats} 
        projectName={projectName} 
        isXsScreen={isXsScreen} 
      />
      <Grid container spacing={isXsScreen ? 0.5 : (isSmScreen ? 1 : 2)}>
        {[
          { status: 'manufactured', count: stats.manufactured_count, percent: stats.manufactured_percent },
          { status: 'transported', count: stats.transported_count, percent: stats.transported_percent },
          { status: 'accepted', count: stats.accepted_count, percent: stats.accepted_percent },
          { status: 'installed', count: stats.installed_count, percent: stats.installed_percent },
          { status: 'rejected', count: stats.rejected_count, percent: stats.rejected_percent }
        ].map((card) => (
          <Grid item xs={2.4} key={card.status}>
            <StatusCard 
              {...card} 
              isXsScreen={isXsScreen} 
              isSmScreen={isSmScreen} 
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TopCards;