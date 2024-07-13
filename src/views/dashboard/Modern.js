import React, { useState } from 'react';
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

const Modern = () => {
    const [weeklyStats, setWeeklyStats] = useState([
        { title: 'In Shop', subtitle: 'Components', percent: 25, color: '', lightcolor: '', icon: '' },
        { title: 'In Production', subtitle: 'Components', percent: 18, color: '', lightcolor: '', icon: '' },
        { title: 'In Transit', subtitle: 'Components', percent: 12, color: '', lightcolor: '', icon: '' },
        { title: 'Installed', subtitle: 'Components', percent: 35, color: '', lightcolor: '', icon: '' },
        { title: 'Rejected', subtitle: 'Components', percent: 2, color: '', lightcolor: '', icon: '' }
    ]);

    const handleRowClick = (project) => {
        const newStats = fetchWeeklyStatsForProject(project);
        setWeeklyStats(newStats);
    };

    const fetchWeeklyStatsForProject = (project) => {
        // Replace this with actual logic to fetch data
        return [
            { title: 'In Shop', subtitle: 'Components', percent: project.inShop || 0, color: '', lightcolor: '', icon: '' },
            { title: 'In Production', subtitle: 'Components', percent: project.inProduction || 0, color: '', lightcolor: '', icon: '' },
            { title: 'In Transit', subtitle: 'Components', percent: project.inTransit || 0, color: '', lightcolor: '', icon: '' },
            { title: 'Installed', subtitle: 'Components', percent: project.installed || 0, color: '', lightcolor: '', icon: '' },
            { title: 'Rejected', subtitle: 'Components', percent: project.rejected || 0, color: '', lightcolor: '', icon: '' }
        ];
    };

    return (
        <Box>
            <Grid container spacing={3}>
                <Grid item xs={12} lg={4}>
                    <WeeklyStats stats={weeklyStats} />
                </Grid>
                <Grid item xs={12} lg={8}>
                    <TopPerformers onRowClick={handleRowClick} />
                </Grid>
            </Grid>
            <Welcome />
        </Box>
    );
};

export default Modern;
