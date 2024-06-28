import React from 'react';
import { Box, Grid } from '@mui/material';
import TopCards from '../../components/dashboards/modern/TopCards';
import RevenueUpdates from '../../components/dashboards/modern/RevenueUpdates';
import YearlyBreakup from '../../components/dashboards/modern/YearlyBreakup';
import MonthlyEarnings from '../../components/dashboards/modern/MonthlyEarnings';
import EmployeeSalary from '../../components/dashboards/modern/EmployeeSalary';
import Customers from '../../components/dashboards/modern/Customers';
import Projects from '../../components/dashboards/modern/Projects';
import SellingProducts from '../../components/dashboards/modern/SellingProducts';
import WeeklyStats from '../../components/dashboards/modern/WeeklyStats';
import TopPerformers from '../../components/dashboards/modern/TopPerformers';
import Welcome from '../../layouts/full/shared/welcome/Welcome';
// import Towers from '../../components/dashboards/modern/Towers';
// import Floors from '../../components/dashboards/modern/Floors';
// import Units from '../../components/dashboards/modern/Units';

const Modern = () => {
  return (
    <Box>
      <Grid container spacing={3}>
        {/* column */}
        <Grid item sm={12} lg={12}>
          <TopCards />
        </Grid>
        {/* column */}
        <Grid item xs={12} lg={8}>
          <RevenueUpdates />
        </Grid>
        {/* column */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={12}>
              <YearlyBreakup />
            </Grid>
            <Grid item xs={12} sm={6} lg={12}>
              <MonthlyEarnings />
            </Grid>
          </Grid>
        </Grid>
        {/* column */}
        <Grid item xs={12} lg={4}>
          <EmployeeSalary />
        </Grid>
        {/* column */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Customers />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Projects />
            </Grid>
          </Grid>
        </Grid>
        {/* column */}
        <Grid item xs={12} lg={4}>
          <SellingProducts />
        </Grid>
        {/* column */}
        <Grid item xs={12} lg={4}>
          <WeeklyStats />
        </Grid>
        {/* column */}
        <Grid item xs={12} lg={8}>
          <TopPerformers />
        </Grid>
        {/* New sections */}
        {/* <Grid item xs={12} lg={4}>
          <Towers />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Floors />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Units />
        </Grid> */}
      </Grid>
      {/* column */}
      <Welcome />
    </Box>
  );
};

export default Modern;
