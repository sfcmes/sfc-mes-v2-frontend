import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material';
import CustomTextField from '../theme-elements/CustomTextField'; // Ensure this import is correct
import { createPrecastComponent } from 'src/utils/api';

const validationSchema = yup.object({
  projectName: yup.string().required('กรุณาใส่ชื่อโครงการ'),
  sectionId: yup.string().required('กรุณาเลือกส่วน'),
  componentName: yup.string().required('กรุณาใส่ชื่อชิ้นงาน'),
  width: yup.number().positive('ความกว้างต้องเป็นตัวเลข').required('กรุณาใส่ความกว้างของชิ้นงาน'),
  height: yup.number().positive('ความสูงต้องเป็นตัวเลข').required('กรุณาใส่ความสูงของชิ้นงาน'),
  thickness: yup.number().positive('ความหนาต้องเป็นตัวเลข').required('กรุณาใส่ความหนาของชิ้นงาน'),
  extension: yup.number().min(0, 'ส่วนขยายต้องเป็นตัวเลข').required('กรุณาใส่ส่วนขยายของชิ้นงาน'),
  reduction: yup.number().min(0, 'ส่วนลดต้องเป็นตัวเลข').required('กรุณาใส่ส่วนลดของชิ้นงาน'),
  area: yup.number().positive('พื้นที่ต้องเป็นตัวเลข').required('กรุณาใส่พื้นที่ของชิ้นงาน'),
  volume: yup.number().positive('ปริมาตรต้องเป็นตัวเลข').required('กรุณาใส่ปริมาตรของชิ้นงาน'),
  weight: yup.number().positive('น้ำหนักต้องเป็นตัวเลข').required('กรุณาใส่น้ำหนักของชิ้นงาน'),
  status: yup
    .string()
    .oneOf(['planning', 'manufactured', 'in_transit', 'installed', 'rejected'])
    .required('กรุณาเลือกสถานะของชิ้นงาน'),
  file: yup.mixed().required('กรุณาอัพโหลดไฟล์ PDF'),
});

const PrecastComponentForm = ({ projects, sections, onProjectChange }) => {
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      projectName: '',
      sectionId: '',
      componentName: '',
      width: '',
      height: '',
      thickness: '',
      extension: '',
      reduction: '',
      area: '',
      volume: '',
      weight: '',
      status: '',
      file: null,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError('');
      try {
        const formData = new FormData();
        formData.append('section_id', values.sectionId);
        formData.append('name', values.componentName);
        formData.append('width', values.width);
        formData.append('height', values.height);
        formData.append('thickness', values.thickness);
        formData.append('extension', values.extension);
        formData.append('reduction', values.reduction);
        formData.append('area', values.area);
        formData.append('volume', values.volume);
        formData.append('weight', values.weight);
        formData.append('status', values.status);
        formData.append('file', values.file);

        const response = await createPrecastComponent(formData);
        console.log('Precast component created:', response.data);
      } catch (error) {
        console.error('Error creating component:', error);
        if (error.response && error.response.data && error.response.data.error) {
          setError(error.response.data.error);
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={3}>
        {error && <Typography color="error">{error}</Typography>}
        <FormControl fullWidth>
          <InputLabel id="project-name-label">โครงการ</InputLabel>
          <Select
            labelId="project-name-label"
            id="projectName"
            name="projectName"
            value={formik.values.projectName}
            onChange={(event) => {
              formik.setFieldValue('projectName', event.target.value);
              onProjectChange(event); // Ensure this function is passed correctly from the parent component
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

        <FormControl fullWidth>
          <InputLabel id="section-id-label">ชั้น</InputLabel>
          <Select
            labelId="section-id-label"
            id="sectionId"
            name="sectionId"
            value={formik.values.sectionId}
            onChange={formik.handleChange}
            error={formik.touched.sectionId && Boolean(formik.errors.sectionId)}
          >
            {sections.map((section) => (
              <MenuItem key={section.id} value={section.id}>
                {section.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <CustomTextField
          fullWidth
          id="componentName"
          name="componentName"
          label="ชื่อชิ้นงาน"
          value={formik.values.componentName}
          onChange={formik.handleChange}
          error={formik.touched.componentName && Boolean(formik.errors.componentName)}
          helperText={formik.touched.componentName && formik.errors.componentName}
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
          id="extension"
          name="extension"
          label="ส่วนขยาย (ตร.ม.)"
          type="number"
          value={formik.values.extension}
          onChange={formik.handleChange}
          error={formik.touched.extension && Boolean(formik.errors.extension)}
          helperText={formik.touched.extension && formik.errors.extension}
        />
        <CustomTextField
          fullWidth
          id="reduction"
          name="reduction"
          label="ส่วนลด (ตร.ม.)"
          type="number"
          value={formik.values.reduction}
          onChange={formik.handleChange}
          error={formik.touched.reduction && Boolean(formik.errors.reduction)}
          helperText={formik.touched.reduction && formik.errors.reduction}
        />
        <CustomTextField
          fullWidth
          id="area"
          name="area"
          label="พื้นที่ (ตร.ม.)"
          type="number"
          value={formik.values.area}
          onChange={formik.handleChange}
          error={formik.touched.area && Boolean(formik.errors.area)}
          helperText={formik.touched.area && formik.errors.area}
        />
        <CustomTextField
          fullWidth
          id="volume"
          name="volume"
          label="ปริมาตร (ลบ.ม.)"
          type="number"
          value={formik.values.volume}
          onChange={formik.handleChange}
          error={formik.touched.volume && Boolean(formik.errors.volume)}
          helperText={formik.touched.volume && formik.errors.volume}
        />
        <CustomTextField
          fullWidth
          id="weight"
          name="weight"
          label="น้ำหนัก (ตัน)"
          type="number"
          value={formik.values.weight}
          onChange={formik.handleChange}
          error={formik.touched.weight && Boolean(formik.errors.weight)}
          helperText={formik.touched.weight && formik.errors.weight}
        />
        <FormControl fullWidth>
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            id="status"
            name="status"
            value={formik.values.status}
            onChange={formik.handleChange}
            error={formik.touched.status && Boolean(formik.errors.status)}
          >
            <MenuItem value="planning">แผนผลิต</MenuItem>
            <MenuItem value="manufactured">ผลิตแล้ว</MenuItem>
            <MenuItem value="in_transit">อยู่ระหว่างขนส่ง</MenuItem>
            <MenuItem value="installed">ติดตั้งแล้ว</MenuItem>
            <MenuItem value="rejected">ถูกปฏิเสธ</MenuItem>
          </Select>
        </FormControl>
        <TextField
          id="file"
          name="file"
          type="file"
          onChange={(event) => formik.setFieldValue('file', event.currentTarget.files[0])}
          error={formik.touched.file && Boolean(formik.errors.file)}
          helperText={formik.touched.file && formik.errors.file}
        />

        <Box mt={3}>
          <Button color="primary" variant="contained" type="submit">
            บันทึก
          </Button>
        </Box>
      </Stack>
    </form>
  );
};

export default PrecastComponentForm;
