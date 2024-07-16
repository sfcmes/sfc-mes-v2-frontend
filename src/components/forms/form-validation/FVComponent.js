import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Button, Stack, Select, MenuItem, FormControl, InputLabel, Modal, Typography } from '@mui/material';
import CustomTextField from '../theme-elements/CustomTextField';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';

const validationSchema = yup.object({
  componentName: yup
    .string()
    .min(2, 'Too Short!')
    .max(255, 'Too Long!')
    .required('Please enter a component name'),
  componentNumber: yup
    .number()
    .integer('Component number must be an integer')
    .min(1, 'Component number must be at least 1')
    .required('Please enter a component number'),
  componentType: yup
    .string()
    .required('Please select a component type'),
  width: yup
    .number()
    .positive('Width must be a positive number')
    .required('Please enter the component width'),
  height: yup
    .number()
    .positive('Height must be a positive number')
    .required('Please enter the component height'),
  thickness: yup
    .number()
    .positive('Thickness must be a positive number')
    .required('Please enter the component thickness'),
  extension: yup
    .number()
    .positive('Extension must be a positive number')
    .required('Please enter the component extension'),
  reduction: yup
    .number()
    .positive('Reduction must be a positive number')
    .required('Please enter the component reduction'),
  area: yup
    .number()
    .positive('Area must be a positive number')
    .required('Please enter the component area'),
  volume: yup
    .number()
    .positive('Volume must be a positive number')
    .required('Please enter the component volume'),
  weight: yup
    .number()
    .positive('Weight must be a positive number')
    .required('Please enter the component weight'),
  status: yup
    .string()
    .oneOf(["Planning", "Fabrication", "Installed", "Completed", "Reject"])
    .required('Please select a component status'),
  sectionId: yup
    .number()
    .integer('Section ID must be an integer')
    .min(1, 'Section ID must be at least 1')
    .required('Please select a section'),
});

const FVComponent = ({
  componentNamePlaceholder = 'Component A',
  componentNumberPlaceholder = '1',
  componentTypePlaceholder = 'Type A',
  widthPlaceholder = '100',
  heightPlaceholder = '50',
  thicknessPlaceholder = '20',
  extensionPlaceholder = '10.5',
  reductionPlaceholder = '2.3',
  areaPlaceholder = '15.2',
  volumePlaceholder = '0.3',
  weightPlaceholder = '0.5',
  statusPlaceholder = 'Planning',
  sectionIdPlaceholder = '1',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  const formik = useFormik({
    initialValues: {
      componentName: '',
      componentNumber: '',
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
      sectionId: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      // Generate QR code data
      const qrCodeData = JSON.stringify(values);
      setQrCodeData(qrCodeData);
      setIsModalOpen(true);

      // Create and save JSON file
      await createAndSaveJSON(values);
    },
  });

  const createAndSaveJSON = async (data) => {
    // Add a timestamp to simulate a database record
    const record = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  
    try {
      const response = await fetch('http://localhost:3033/save-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });
  
      if (response.ok) {
        setSaveMessage('JSON file saved successfully');
        setTimeout(() => setSaveMessage(''), 1000); // Clear the message after 3 seconds
      } else {
        setSaveMessage('Error saving JSON file');
        setTimeout(() => setSaveMessage(''), 1000);
      }
    } catch (error) {
      console.error('Error saving JSON file:', error);
      setSaveMessage('Error saving JSON file. Please check the console for details.');
      setTimeout(() => setSaveMessage(''), 1000);
    }
  };

  const handleSave = async () => {
    // Save QR code image
    const qrCodeElement = document.getElementById('qr-code');
    if (!qrCodeElement) {
      console.error('QR code element not found');
      return;
    }

    try {
      const canvas = await html2canvas(qrCodeElement);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'qr-code.png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 'image/png');
    } catch (error) {
      console.error('Error saving QR code image:', error);
    }

    setIsModalOpen(false);
  };

  const handlePrint = () => {
    // Print QR code
    const qrCodeElement = document.getElementById('qr-code');
    if (!qrCodeElement) {
      console.error('QR code element not found');
      return;
    }

    html2canvas(qrCodeElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const printWindow = window.open('', '', 'height=400,width=600');
      printWindow.document.write('<html><head><title>QR Code</title>');
      printWindow.document.write('</head><body >');
      printWindow.document.write(`<img src="${imgData}" />`);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    });

    setIsModalOpen(false);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={3}>
        <CustomTextField
          fullWidth
          id="componentName"
          name="componentName"
          label="ชื่อชิ้นงาน"
          value={formik.values.componentName}
          onChange={formik.handleChange}
          error={formik.touched.componentName && Boolean(formik.errors.componentName)}
          helperText={formik.touched.componentName && formik.errors.componentName}
          placeholder={componentNamePlaceholder}
        />
        <CustomTextField
          fullWidth
          id="componentNumber"
          name="componentNumber"
          label="หมายเลขชิ้นงาน"
          type="number"
          value={formik.values.componentNumber}
          onChange={formik.handleChange}
          error={formik.touched.componentNumber && Boolean(formik.errors.componentNumber)}
          helperText={formik.touched.componentNumber && formik.errors.componentNumber}
          placeholder={componentNumberPlaceholder}
        />
        <FormControl fullWidth>
          <InputLabel id="component-type-label">ประเภทชิ้นงาน</InputLabel>
          <Select
            labelId="component-type-label"
            id="componentType"
            name="componentType"
            value={formik.values.componentType}
            onChange={formik.handleChange}
            error={formik.touched.componentType && Boolean(formik.errors.componentType)}
          >
            <MenuItem value="">เลือกประเภทชิ้นงาน</MenuItem>
            <MenuItem value="Type A">Type A-Precast</MenuItem>
            <MenuItem value="Type B">Type B-เสาเอ็น</MenuItem>
            <MenuItem value="Type C">Type C-ลูกขั้นบันได</MenuItem>
            <MenuItem value="Type D">Type D-ท่อ</MenuItem>
          </Select>
        </FormControl>
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
          placeholder={widthPlaceholder}
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
          placeholder={heightPlaceholder}
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
          placeholder={thicknessPlaceholder}
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
          placeholder={extensionPlaceholder}
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
          placeholder={reductionPlaceholder}
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
          placeholder={areaPlaceholder}
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
          placeholder={volumePlaceholder}
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
          placeholder={weightPlaceholder}
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
            <MenuItem value="">เลือกสถานะ</MenuItem>
            <MenuItem value="Planning">แผนผลิต</MenuItem>
            <MenuItem value="Fabrication">ผลิตแล้ว</MenuItem>
            <MenuItem value="Transpotation">กำลังขนส่ง</MenuItem>
            <MenuItem value="Accept">ตรวจรับแล้ว</MenuItem>
            <MenuItem value="Completed">ติดตั้งแล้ว</MenuItem>
            <MenuItem value="Reject">Reject</MenuItem>
          </Select>
        </FormControl>
        <CustomTextField
          fullWidth
          id="sectionId"
          name="sectionId"
          label="รหัสชิ้นงาน"
          type="number"
          value={formik.values.sectionId}
          onChange={formik.handleChange}
          error={formik.touched.sectionId && Boolean(formik.errors.sectionId)}
          helperText={formik.touched.sectionId && formik.errors.sectionId}
          placeholder={sectionIdPlaceholder}
        />
      </Stack>
      <Box mt={3}>
        <Button color="primary" variant="contained" type="submit">
          บันทึกชิ้นงาน
        </Button>
      </Box>
      {saveMessage && (
        <Box mt={2}>
          <Typography color="primary">{saveMessage}</Typography>
        </Box>
      )}

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="qr-code-modal"
        aria-describedby="qr-code-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}>
          <Typography id="qr-code-modal" variant="h6" component="h2">
            QR Code
          </Typography>
          <Box id="qr-code" sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <QRCode value={qrCodeData} size={256} />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleSave} variant="contained" color="primary">
              Save
            </Button>
            <Button onClick={handlePrint} variant="contained" color="secondary">
              Print
            </Button>
          </Box>
        </Box>
      </Modal>
    </form>
  );
};

export default FVComponent;
