import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import { Grid, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useSpring, animated, config } from 'react-spring';
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';
import AuthLogin from './AuthLogin';
import videoBg from 'src/assets/videos/video.mov';

const AnimatedBox = animated(Box);

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/dashboards/modern', { replace: true });
    }
  }, [user, navigate]);

  // Animation for the logo
  const logoAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-50px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: config.molasses,
  });

  // Animation for the login form
  const formAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.8)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: config.gentle,
    delay: 300,
  });

  // Subtle background animation
  const bgAnimation = useSpring({
    from: { backgroundPosition: '0% 50%' },
    to: { backgroundPosition: '100% 50%' },
    config: { duration: 20000 },
    loop: { reverse: true },
  });

  // New function to handle logo click
  const handleLogoClick = () => {
    navigate('/dashboards/modern');
  };

  return (
    <PageContainer title="Login" description="this is Login page">
      <Grid container sx={{ height: '100vh', position: 'relative' }}>
        <AnimatedBox
          component="video"
          src={videoBg}
          autoPlay
          muted
          loop
          playsInline
          style={bgAnimation}
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            zIndex: -1,
          }}
        />
        <Grid
          item
          xs={12}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100vh',
          }}
        >
          <AnimatedBox 
            p={isMobile ? 2 : 3} 
            style={logoAnimation} 
            onClick={handleLogoClick}
            sx={{ cursor: 'pointer' }}
          >
            <Logo />
          </AnimatedBox>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              pb: isMobile ? 2 : 5,
            }}
          >
            <AnimatedBox
              style={formAnimation}
              sx={{
                width: isMobile ? '90%' : isTablet ? '70%' : '400px',
                maxWidth: '400px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                p: isMobile ? 2 : 4,
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <AuthLogin
                title="WELCOME TO SFC PC SYSTEM"
                subtext={
                  <Typography 
                    variant={isMobile ? "body2" : "subtitle1"} 
                    color="textSecondary" 
                    mb={1}
                  >
                    SFC PRECAST SYSTEM
                  </Typography>
                }
              />
            </AnimatedBox>
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Login;