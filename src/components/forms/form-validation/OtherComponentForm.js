import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Typography,
  CircularProgress,
  Select,      // Import Select
  MenuItem,    // Import MenuItem
} from '@mui/material';
import CustomTextField from '../theme-elements/CustomTextField';
import { createOtherComponent } from 'src/utils/api';

const validationSchema = yup.object({
  projectName: yup.string().required('กรุณาใส่ชื่อโครงการ'),
  sizeName: yup.string().required('ชื่อชิ้นงาน'),
  width: yup.number().positive('ความกว้างต้องเป็นตัวเลข').required('กรุณาใส่ความกว้างของชิ้นงาน'),
  height: yup.number().positive('ความสูงต้องเป็นตัวเลข').required('กรุณาใส่ความสูงของชิ้นงาน'),
  thickness: yup.number().positive('ความหนาต้องเป็นตัวเลข').required('กรุณาใส่ความหนาของชิ้นงาน'),
  total: yup.number().positive('จำนวนต้องเป็นตัวเลข').required('กรุณาใส่จำนวนของชิ้นงาน'),
});

const OtherComponentForm = ({ projects, onProjectChange }) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let timer;
    if (success || error) {
      timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [success, error]);

  const formik = useFormik({
    initialValues: {
      projectName: '',
      name: '',
      width: '',
      height: '',
      thickness: '',
      total: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError('');
      setSuccess('');
      setIsSubmitting(true);
      try {
        const data = {
          project_id: values.projectName,
          size_name: values.name,
          width: values.width,
          height: values.height,
          thickness: values.thickness,
          total: values.total,
        };

        const response = await createOtherComponent(data);
        setSuccess('Component has been successfully created.');
      } catch (error) {
        console.error('Error creating component:', error);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={3}>
        {error && <Typography color="error">{error}</Typography>}
        {success && <Typography color="success.main">{success}</Typography>}
        <FormControl fullWidth>
          <InputLabel id="project-name-label">โครงการ</InputLabel>
          <Select
            labelId="project-name-label"
            id="projectName"
            name="projectName"
            value={formik.values.projectName}
            onChange={(event) => {
              formik.setFieldValue('projectName', event.target.value);
              onProjectChange(event);
            }}
            error={formik.touched.projectName && Boolean(formik.errors.projectName)}
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <CustomTextField
          fullWidth
          id="name"
          name="name"
          label="ชื่อชิ้นงาน"
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />

        <CustomTextField
          fullWidth
          id="width"
          name="width"
          label="ความกว้าง (มม.)"
          type="number"
          value={formik.values.width}
          onChange={formik.handleChange}
          error={formik.touched.width && Boolean(formik.errors.width)}
          helperText={formik.touched.width && formik.errors.width}
        />
        <CustomTextField
          fullWidth
          id="height"
          name="height"
          label="ความสูง (มม.)"
          type="number"
          value={formik.values.height}
          onChange={formik.handleChange}
          error={formik.touched.height && Boolean(formik.errors.height)}
          helperText={formik.touched.height && formik.errors.height}
        />
        <CustomTextField
          fullWidth
          id="thickness"
          name="thickness"
          label="ความหนา (มม.)"
          type="number"
          value={formik.values.thickness}
          onChange={formik.handleChange}
          error={formik.touched.thickness && Boolean(formik.errors.thickness)}
          helperText={formik.touched.thickness && formik.errors.thickness}
        />
        <CustomTextField
          fullWidth
          id="total"
          name="total"
          label="จำนวน"
          type="number"
          value={formik.values.total}
          onChange={formik.handleChange}
          error={formik.touched.total && Boolean(formik.errors.total)}
          helperText={formik.touched.total && formik.errors.total}
        />

        <Box mt={3}>
          <Button
            color="primary"
            variant="contained"
            type="submit"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            บันทึก
          </Button>
        </Box>
      </Stack>
    </form>
  );
};

export default OtherComponentForm;
