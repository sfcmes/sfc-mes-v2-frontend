import React from 'react'; 
import { Grid } from '@mui/material';

// common components
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';

// custom components
import FVSection from '../../components/forms/form-validation/FVSection';

const BCrumb = [
  { to: '/', title: 'Home', },
  { title: 'สร้าง Section แต่ละโครงการ', },
];

const FormSection = () => {
  return (
    <PageContainer title="สร้าง Section แต่ละโครงการ" description="this is Form create new project page">
      <Breadcrumb title="สร้าง Section แต่ละโครงการ" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
            <ParentCard title="สร้าง Section แต่ละโครงการ">
                <FVSection />
            </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default FormSection;