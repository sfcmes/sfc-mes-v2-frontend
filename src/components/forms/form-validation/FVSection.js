import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Button, Stack, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import CustomTextField from '../theme-elements/CustomTextField';
import CustomFormLabel from '../theme-elements/CustomFormLabel';

const validationSchema = yup.object({
  projectCode: yup
    .string()
    .required('กรุณาเลือกโครงการ'),
  sectionName: yup
    .string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('กรุณาใส่ชื่อชั้น'),
  components: yup
    .number()
    .integer('Components must be an integer')
    .min(1, 'Components must be at least 1')
    .max(100, 'Components must be less than or equal to 100')
    .required('กรุณาใส่จำนวน Component'),
  status: yup
    .string()
    .oneOf(["Planning", "In Progress", "Completed", "On Hold"])
    .required('กรุณาเลือกสถานะของ Section'),
});

const FVSection = ({ onAddSection }) => {
  const [projects, setProjects] = useState([]);
  const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []); // Ensure data is an array
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, [token]);

  const formik = useFormik({
    initialValues: {
      projectCode: '',
      sectionName: '',
      components: '',
      status: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      const newSection = {
        project_id: values.projectCode,
        name: values.sectionName,
        components: values.components,
        status: values.status,
      };
      onAddSection(newSection);
      formik.resetForm();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack>
        <Box>
          <CustomFormLabel>ชื่อโครงการ</CustomFormLabel>
          <FormControl fullWidth>
            <InputLabel id="projectCode-label">เลือกชื่อโครงการ</InputLabel>
            <Select
              labelId="projectCode-label"
              id="projectCode"
              name="projectCode"
              value={formik.values.projectCode}
              onChange={formik.handleChange}
              error={formik.touched.projectCode && Boolean(formik.errors.projectCode)}
            >
              <MenuItem value="">เลือกโครงการ</MenuItem>
              {projects.length > 0 && projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box>
          <CustomFormLabel>ชื่อชั้นในโครงการ</CustomFormLabel>
          <CustomTextField
            fullWidth
            id="sectionName"
            name="sectionName"
            value={formik.values.sectionName}
            onChange={formik.handleChange}
            error={formik.touched.sectionName && Boolean(formik.errors.sectionName)}
            helperText={formik.touched.sectionName && formik.errors.sectionName}
          />
        </Box>
        <Box>
          <CustomFormLabel>จำนวนชั้นของโครงการ</CustomFormLabel>
          <CustomTextField
            fullWidth
            id="components"
            name="components"
            type="number"
            value={formik.values.components}
            onChange={formik.handleChange}
            error={formik.touched.components && Boolean(formik.errors.components)}
            helperText={formik.touched.components && formik.errors.components}
            placeholder="10"
          />
        </Box>
        <Box>
          <CustomFormLabel>สถานะของชั้นในโครงการ</CustomFormLabel>
          <FormControl fullWidth>
            <InputLabel id="status-label">เลือกสถานะของชั้นในโครงการ</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              error={formik.touched.status && Boolean(formik.errors.status)}
            >
              <MenuItem value="">เลือกสถานะของ Section</MenuItem>
              <MenuItem value="Planning">Planning</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>
      <Button color="primary" variant="contained" type="submit">
        บันทึก Section เข้าระบบ
      </Button>
    </form>
  );
};

export default FVSection;
