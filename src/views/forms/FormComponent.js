import React from 'react';
import { Grid } from '@mui/material';

// common components
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';

// custom components
import FVComponent from '../../components/forms/form-validation/FVComponent';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Create New Component' },
];

const FormComponent = () => {
  return (
    <PageContainer title="Create New Component" description="This is the form to create a new component">
      <Breadcrumb title="Create New Component" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <ParentCard title="Create New Component">
            <FVComponent />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default FormComponent;