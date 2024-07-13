import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import * as XLSX from 'xlsx';
import DataTable from './DataTable';

const ExcelUploadForm = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

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
          const formattedData = jsonData.slice(1).map(row => {
            return headers.reduce((obj, header, index) => {
              const trimmedHeader = header.trim();
              obj[trimmedHeader] = row[index];
              return obj;
            }, {});
          });
          console.log('Converted JSON data (first item):', formattedData[0]);
          setData(formattedData);
          setError(null);
        } else {
          setError('No data found in the Excel file.');
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        setError(`Error parsing Excel file: ${error.message}`);
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      setError('Error reading the file. Please try again.');
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        อัปโหลดไฟล์ Excel สำหรับการอัปเดตข้อมูลจำนวนมาก
      </Typography>
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
      {error && (
        <Typography color="error" style={{ marginTop: '10px' }}>
          {error}
        </Typography>
      )}
      {data.length > 0 && (
        <>
          <Typography style={{ marginTop: '10px' }}>
            Loaded {data.length} rows of data.
          </Typography>
          <DataTable data={data} />
        </>
      )}
    </Box>
  );
};

export default ExcelUploadForm;