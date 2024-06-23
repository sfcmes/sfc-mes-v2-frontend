import React from 'react'; 
import { CardContent, Grid, Box } from '@mui/material';

// common components
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';

// custom components
import FVProject from '../../components/forms/form-validation/FVProject';
import ProductTableList from '../../components/apps/ecommerce/ProductTableList/ProductTableList';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'สร้างโครงการใหม่' },
];

const FormProject = () => {
  return (
    <PageContainer title="สร้างโครงการใหม่" description="This is the form to create a new project.">
      <Breadcrumb title="สร้างโครงการใหม่" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <ParentCard title="สร้างโครงการใหม่">
            <CardContent>
              <FVProject />
            </CardContent>
          </ParentCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Box>
            <ProductTableList />
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default FormProject;
