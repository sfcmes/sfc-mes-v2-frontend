import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Button, Stack, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import CustomTextField from '../theme-elements/CustomTextField';
import CustomFormLabel from '../theme-elements/CustomFormLabel';

const validationSchema = yup.object({
  projectName: yup
    .string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('กรุณาเลือกชื่อโครงการ'),
  projectCode: yup
    .string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('กรุณาใส่รหัส Section'),
  section: yup
    .number()
    .integer('Section must be an integer')
    .min(1, 'Section must be at least 1')
    .max(100, 'Section must be less than or equal to 100')
    .required('กรุณาใส่จำนวน Component'),
  status: yup
    .string()
    .oneOf(["Planning", "In Progress", "Completed", "On Hold"])
    .required('กรุณาเลือกสถานะSection'),
});

const FVSection = () => {
  const formik = useFormik({
    initialValues: {
      projectName: '',
      section: '',
      totalComponents: '',
      status: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack>
        {/* <Box>
          <CustomFormLabel>ชื่อโครงการ</CustomFormLabel>
          <CustomTextField
            fullWidth
            id="projectName"
            name="projectName"
            value={formik.values.projectName}
            onChange={formik.handleChange}
            error={formik.touched.projectName && Boolean(formik.errors.projectName)}
            helperText={formik.touched.projectName && formik.errors.projectName}
            placeholder="Skyrise (Tower D)"
          />
        </Box> */}
        <Box>
          <CustomFormLabel>ชื่อโครงการ</CustomFormLabel>
          <FormControl fullWidth>
            <InputLabel id="status-label"></InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={formik.values.projectName}
              onChange={formik.handleChange}
              error={formik.touched.projectName && Boolean(formik.errors.projectName)}
            >
              <MenuItem value="">เลือกโครงการ</MenuItem>
              <MenuItem value="Planning">Planning</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box>
          <CustomFormLabel>รหัสโครงการ</CustomFormLabel>
          <CustomTextField
            fullWidth
            id="projectCode"
            name="projectCode"
            value={formik.values.projectCode}
            onChange={formik.handleChange}
            error={formik.touched.projectCode && Boolean(formik.errors.projectCode)}
            helperText={formik.touched.projectCode && formik.errors.projectCode}
            placeholder="SKD"
          />
        </Box>
        <Box>
          <CustomFormLabel>จำนวนชั้นของโครงการ</CustomFormLabel>
          <CustomTextField
            fullWidth
            id="section"
            name="section"
            type="number"
            value={formik.values.section}
            onChange={formik.handleChange}
            error={formik.touched.section && Boolean(formik.errors.section)}
            helperText={formik.touched.section && formik.errors.section}
            placeholder="99"
          />
        </Box>
        <Box>
          <CustomFormLabel>สถานะโครงการ</CustomFormLabel>
          <FormControl fullWidth>
            <InputLabel id="status-label"></InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              error={formik.touched.status && Boolean(formik.errors.status)}
            >
              <MenuItem value="">เลือกสถานะโครงการ</MenuItem>
              <MenuItem value="Planning">Planning</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>
      <Button color="primary" variant="contained" type="submit">
        บันทึกโครงการเข้าระบบ
      </Button>
    </form>
  );
};

export default FVSection;