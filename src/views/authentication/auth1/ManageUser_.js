import React from 'react';
import { Box } from '@mui/material';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from 'src/components/container/PageContainer';
import UserList from './UserList';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Manage Users' },
];

const ManageUser = () => {
  return (
    <PageContainer title="Manage Users" description="Manage user roles and projects">
      <Breadcrumb title="Manage Users" items={BCrumb} />
      <Box>
        <UserList />
      </Box>
    </PageContainer>
  );
};

export default ManageUser;
