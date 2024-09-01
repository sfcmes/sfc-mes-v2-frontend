import React, { useState, useRef, useEffect } from 'react';
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
  Modal,
  Typography,
  Paper,
  Grid,
  TextField,
} from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';
import CustomTextField from '../theme-elements/CustomTextField';
import {
  fetchProjects,
  fetchSectionsByProjectId,
  fetchProjectById,
  fetchSectionById,
  createComponent,
} from 'src/utils/api';

// Import your logo
import logo from 'F:/project/sfc-mes/frontend/src/assets/images/logos/logo-main.svg'; // Import the logo

const validationSchema = yup.object({
  projectName: yup.string().required('กรุณาใส่ชื่อโครงการ'),
  sectionId: yup.string().required('กรุณาเลือกส่วน'),
  componentName: yup.string().required('กรุณาใส่ชื่อชิ้นงาน'),
  componentType: yup.string().required('กรุณาเลือกประเภทชิ้นงาน'),
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

const FVComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrCodeDetails, setQrCodeDetails] = useState('');
  const [projects, setProjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [error, setError] = useState('');
  const qrCodeRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectResponse = await fetchProjects();
        setProjects(projectResponse.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchData();
  }, []);

  const handleProjectChange = async (event) => {
    const projectId = event.target.value;
    formik.setFieldValue('projectName', projectId);

    try {
      const sectionResponse = await fetchSectionsByProjectId(projectId);
      setSections(sectionResponse.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const handleFileChange = (event) => {
    formik.setFieldValue('file', event.currentTarget.files[0]);
  };

  const handleQRCodeClick = async (formData) => {
    try {
      const projectResponse = await fetchProjectById(formData.projectName);
      const sectionResponse = await fetchSectionById(formData.sectionId);
      const projectName = projectResponse.data.name;
      const sectionName = sectionResponse.data ? sectionResponse.data.name : 'N/A';

      const qrCodeDetails = `บริษัทแสงฟ้าก่อสร้าง จำกัด\nโครงการ: ${projectName}\nชั้น: ${sectionName}\nชื่อชิ้นงาน: ${formData.componentName}`;
      const qrCodeData = {
        project: projectName,
        section: sectionName,
        name: formData.componentName,
        type: formData.componentType,
        status: formData.status,
      };
      setQrCodeData(JSON.stringify(qrCodeData));
      setQrCodeDetails(qrCodeDetails);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching project/section details:', error);
    }
  };

  const handleSave = async () => {
    try {
      const qrCodeElement = await createQRCodeElement();
      if (!qrCodeElement) {
        console.error('Failed to create QR code element');
        return;
      }
      document.body.appendChild(qrCodeElement);

      const canvas = await html2canvas(qrCodeElement, { useCORS: true });
      const link = document.createElement('a');
      link.download = `qr-code-${formik.values.componentName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      document.body.removeChild(qrCodeElement);
    } catch (error) {
      console.error('Error generating QR code: ', error);
    }
  };

  const handlePrint = async () => {
    try {
      const qrCodeElement = await createQRCodeElement();
      if (!qrCodeElement) {
        console.error('Failed to create QR code element');
        return;
      }
      document.body.appendChild(qrCodeElement);

      const canvas = await html2canvas(qrCodeElement, { useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const printWindow = window.open('', '', 'width=600,height=600');
      if (!printWindow) {
        console.error('Failed to open print window');
        return;
      }

      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>Print QR Code</title></head>
        <body>
          <img src="${imgData}" onload="window.focus(); window.print();">
        </body>
        </html>
      `);
      printWindow.document.close();

      document.body.removeChild(qrCodeElement);
    } catch (error) {
      console.error('Error generating QR code: ', error);
    }
  };

  const createQRCodeElement = () => {
    const qrCodeElement = document.createElement('div');
    qrCodeElement.style.backgroundColor = 'white';
    qrCodeElement.style.padding = '20px';
    qrCodeElement.style.display = 'inline-block';
    qrCodeElement.style.textAlign = 'left';
    qrCodeElement.id = 'qrCodeElement';

    const qrCodeContainer = document.createElement('div');
    qrCodeElement.appendChild(qrCodeContainer);

    const qrCodeRoot = createRoot(qrCodeContainer);
    qrCodeRoot.render(
      <QRCodeCanvas
        value={qrCodeData}
        size={256}
        bgColor={'#ffffff'}
        fgColor={'#000000'}
        level={'L'}
        includeMargin={false}
        imageSettings={{
          src: logo,
          x: undefined,
          y: undefined,
          height: 48,
          width: 48,
          excavate: true,
        }}
      />,
    );

    const qrCodeText = document.createElement('p');
    qrCodeText.style.textAlign = 'center';
    qrCodeText.style.marginTop = '10px';
    qrCodeText.innerHTML = qrCodeDetails.replace(/\n/g, '<br />');

    qrCodeElement.appendChild(qrCodeText);

    return new Promise((resolve) => {
      setTimeout(() => resolve(qrCodeElement), 100);
    });
  };

  const renderQRCode = (qrCodeValue, qrCodeDetails, size = 256) => {
    let parsedQRCodeValue = {};
    try {
      parsedQRCodeValue = typeof qrCodeValue === 'string' ? JSON.parse(qrCodeValue) : qrCodeValue;
    } catch (error) {
      console.error('Error parsing QR code value:', error);
    }

    return (
      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Paper elevation={3} sx={{ display: 'inline-block', p: 2 }} ref={qrCodeRef}>
          <QRCodeCanvas
            value={JSON.stringify(parsedQRCodeValue)}
            size={size}
            bgColor={'#ffffff'}
            fgColor={'#000000'}
            level={'L'}
            includeMargin={false}
            imageSettings={{
              src: logo,
              x: undefined,
              y: undefined,
              height: 48,
              width: 48,
              excavate: true,
            }}
          />
          <Typography mt={2} variant="body1" whiteSpace="pre-line">
            {qrCodeDetails}
          </Typography>
        </Paper>
      </Box>
    );
  };

  const formik = useFormik({
    initialValues: {
      projectName: '',
      sectionId: '',
      componentName: '',
      componentType: '',
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
        formData.append('type', values.componentType);
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

        const response = await createComponent(formData);
        console.log('Component created:', response.data);

        // Generate QR Code after successful submission
        handleQRCodeClick(values);
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
            onChange={handleProjectChange}
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
          id="componentType"
          name="componentType"
          label="ประเภทของชิ้นงาน"
          value={formik.values.componentType}
          onChange={formik.handleChange}
          error={formik.touched.componentType && Boolean(formik.errors.componentType)}
          helperText={formik.touched.componentType && formik.errors.componentType}
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
            <MenuItem value="">เลือก Status</MenuItem>
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
          onChange={handleFileChange}
          error={formik.touched.file && Boolean(formik.errors.file)}
          helperText={formik.touched.file && formik.errors.file}
        />
      </Stack>
      <Box mt={3}>
        <Button color="primary" variant="contained" type="submit">
          บันทึกและสร้าง QR Code
        </Button>
      </Box>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="qr-code-modal"
        aria-describedby="qr-code-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="qr-code-modal" variant="h6" component="h2" align="center" gutterBottom>
            บริษัทแสงฟ้าก่อสร้าง จำกัด
          </Typography>
          <div>{renderQRCode(qrCodeData, qrCodeDetails)}</div>
          <Grid container spacing={2} justifyContent="center" mt={2}>
            <Grid item>
              <Button onClick={handleSave} variant="contained" color="primary">
                บันทึก
              </Button>
            </Grid>
            <Grid item>
              <Button onClick={handlePrint} variant="contained" color="secondary">
                พิมพ์
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </form>
  );
};

export default FVComponent;
