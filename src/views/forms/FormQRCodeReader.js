import React from 'react';
import { Grid } from '@mui/material';

// common components
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';

// custom components
import FVQRCodeReader from '../../components/forms/form-validation/FVQRCodeReader';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'QR Code Reader' },
];

const FormQRCodeReader = () => {
  return (
    <PageContainer title="QR Code Reader" description="This is the QR code reader page">
      <Breadcrumb title="QR Code Reader" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <ParentCard title="QR Code Reader">
            <FVQRCodeReader />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default FormQRCodeReader;