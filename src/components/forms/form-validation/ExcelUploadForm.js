import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import {
  createComponent,
  fetchProjects,
  addComponentHistory,
  fetchSectionsByProjectId,
  fetchSectionByName,
} from 'src/utils/api';
import DataTable from './DataTable';

const columnMapping = {
  ชื่อชั้น: 'section_name',
  ชื่อชิ้นงาน: 'component_name',
  ประเภทชิ้นงาน: 'type',
  'ความกว้าง (มม.)': 'width',
  'ความสูง (มม.)': 'height',
  'ความหนา (มม.)': 'thickness',
  'ส่วนเพิ่ม (ตร.ม.)': 'extension',
  'ส่วนลด (ตร.ม.)': 'reduction',
  'พื้นที่ (ตร.ม.)': 'area',
  'ปริมาตร (ลบ.ม.)': 'volume',
  'น้ำหนัก (ตัน)': 'weight',
  สถานะ: 'status',
};

const excelHeaders = Object.keys(columnMapping);

const ExcelUploadForm = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectResponse = await fetchProjects();
        setProjects(projectResponse.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Error fetching projects. Please check the console for details.');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSections = async () => {
      if (selectedProject) {
        try {
          const sectionResponse = await fetchSectionsByProjectId(selectedProject);
          setSections(sectionResponse.data);
        } catch (error) {
          console.error('Error fetching sections:', error);
          setError('Error fetching sections. Please check the console for details.');
        }
      }
    };
    fetchSections();
  }, [selectedProject]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file.name);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        console.log('Workbook sheets:', workbook.SheetNames);

        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];

        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        console.log('Parsed data (first row):', jsonData[0]);
        console.log('Parsed data (second row):', jsonData[1]);

        if (jsonData.length > 1) {
          const headers = jsonData[0];
          const formattedData = jsonData.slice(1).map((row) => {
            const obj = {};
            headers.forEach((header, index) => {
              const trimmedHeader = header.trim();
              const mappedKey = columnMapping[trimmedHeader] || trimmedHeader;
              obj[mappedKey] = row[index];
            });
            return obj;
          });
          console.log('Converted JSON data (first item):', formattedData[0]);
          setData(formattedData);
          setError(null);
        } else {
          setError('ไม่มีข้อมูลใน Excel ไฟล์.');
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        setError(`Error parsing Excel file: ${error.message}`);
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      setError('Error การอ่านไฟล์ผิดพลาด กรุณาลองใหม่อีกครั้ง');
    };

    reader.readAsArrayBuffer(file);
  };

  const validateExcelData = (data) => {
    const errors = [];
    const warnings = [];

    const parseNumber = (value) => {
      if (value === undefined || value === null || value === '') return null;
      const cleanedValue = String(value).replace(/[^\d.,]/g, '');
      const normalizedValue = cleanedValue.replace(',', '.');
      return parseFloat(normalizedValue);
    };

    const requiredFields = ['section_name', 'component_name', 'width', 'area'];
    const optionalNumericFields = [
      'height',
      'thickness',
      'extension',
      'reduction',
      'volume',
      'weight',
    ];

    data.forEach((component, index) => {
      requiredFields.forEach((field) => {
        if (!component[field]) {
          const thaiFieldName = Object.keys(columnMapping).find(
            (key) => columnMapping[key] === field,
          );
          errors.push(`Row ${index + 2}: Missing required field ${thaiFieldName}`);
        } else if (['width', 'area'].includes(field)) {
          const value = parseNumber(component[field]);
          if (value === null || isNaN(value)) {
            const thaiFieldName = Object.keys(columnMapping).find(
              (key) => columnMapping[key] === field,
            );
            errors.push(`Row ${index + 2}: Invalid ${thaiFieldName} (must be a number)`);
          } else {
            component[field] = value;
          }
        }
      });

      optionalNumericFields.forEach((field) => {
        const value = parseNumber(component[field]);
        if (value !== null) {
          if (isNaN(value)) {
            const thaiFieldName = Object.keys(columnMapping).find(
              (key) => columnMapping[key] === field,
            );
            warnings.push(
              `Row ${index + 2}: Invalid ${thaiFieldName} (must be a number if provided)`,
            );
          } else {
            component[field] = value;
          }
        }
      });
    });

    return { errors, warnings };
  };

  const handleSaveToDatabase = async () => {
    setError(null);
    setSaveMessage('');

    if (!data.length) {
      setError('ไม่มีข้อมูลสำหรับการบันทึก.');
      return;
    }

    if (!selectedProject) {
      setError('กรุณาเลือกชื่อโครงการ.');
      return;
    }

    const validationErrors = validateExcelData(data);
    if (validationErrors.length > 0) {
      setError(
        `Found ${validationErrors.length} error(s) in the Excel data:\n${validationErrors.join(
          '\n',
        )}`,
      );
      return;
    }

    const errors = [];
    const successfulSaves = [];

    for (const component of data) {
      try {
        console.log('Processing component:', component);

        if (!component.section_name) {
          throw new Error(
            `ไม่มีข้อมูลชื่อชั้นในระบบ กรุณาตรวจสอบอีกครั้ง: ${
              component.component_name || 'Unnamed Component'
            }`,
          );
        }

        console.log('Fetching section:', component.section_name);
        const section = await fetchSectionByName(selectedProject, component.section_name);
        if (!section) {
          throw new Error(`ชั้น "${component.section_name}" ไม่มีข้อมูลในโครงการ.`);
        }
        console.log('Section found:', section);

        const componentData = {
          id: uuidv4(),
          section_id: section.id,
          name: component.component_name || '',
          type: component.type || '',
          width: parseFloat(component.width) || 0,
          height: parseFloat(component.height) || 0,
          thickness: parseFloat(component.thickness) || 0,
          extension: parseFloat(component.extension) || 0,
          reduction: parseFloat(component.reduction) || 0,
          area: parseFloat(component.area) || 0,
          volume: parseFloat(component.volume) || 0,
          weight: parseFloat(component.weight) || 0,
          status: component.status || 'Planning',
        };

        console.log('Creating component with data:', componentData);
        const createdComponent = await createComponent(componentData);
        console.log('Component created:', createdComponent);

        // Add component history
        await addComponentHistory({
          component_id: createdComponent.data.id,
          action: 'Created',
          details: 'Component created via Excel upload',
        });
        console.log('Component history added');

        successfulSaves.push(component.component_name || 'Unnamed Component');
      } catch (error) {
        console.error('Error processing component:', error);
        errors.push(
          `Error saving component "${component.component_name || 'Unnamed Component'}": ${
            error.message
          }`,
        );
      }
    }

    if (errors.length > 0) {
      console.error('Errors saving data:', errors);
      setError(`Encountered ${errors.length} error(s) while saving:\n${errors.join('\n')}`);
    }

    if (successfulSaves.length > 0) {
      setSaveMessage(`Successfully saved ${successfulSaves.length} component(s).`);
    } else {
      setSaveMessage('No components were saved successfully.');
    }
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([excelHeaders]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'component_upload_template.xlsx');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        อัปโหลดไฟล์ Excel สำหรับการอัปเดตข้อมูลจำนวนมาก
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="project-select-label">เลือกโครงการ</InputLabel>
        <Select
          labelId="project-select-label"
          id="project-select"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
        <Button variant="contained" color="secondary" onClick={handleDownloadTemplate}>
          ดาวน์โหลดแม่แบบ Excel
        </Button>
        <input
          accept=".xlsx, .xls"
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          onChange={handleFileUpload}
        />
        <label htmlFor="raised-button-file">
          <Button variant="contained" component="span">
            อัปโหลดไฟล์ Excel
          </Button>
        </label>
      </Box>
      {error && (
        <Typography color="error" style={{ marginTop: '10px', whiteSpace: 'pre-line' }}>
          {error}
        </Typography>
      )}
      {data.length > 0 && (
        <>
          <Typography style={{ marginTop: '10px' }}>Loaded {data.length} rows of data.</Typography>
          <DataTable
            data={data}
            columns={excelHeaders.map((header) => ({
              field: columnMapping[header],
              headerName: header,
              flex: 1,
            }))}
          />
          <Button
            variant="contained"
            color="primary"
            style={{ marginTop: '10px' }}
            onClick={handleSaveToDatabase}
          >
            บันทึกในฐานข้อมูล
          </Button>
          {saveMessage && (
            <Typography style={{ marginTop: '10px', color: 'green' }}>{saveMessage}</Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default ExcelUploadForm;
