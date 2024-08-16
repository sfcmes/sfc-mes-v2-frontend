import React, { useState, useEffect, useRef } from 'react';
import { 
  Grid, 
  useTheme, 
  useMediaQuery, 
  Dialog, 
  Box, 
  Button, 
  Typography,
  CircularProgress,
  IconButton
} from '@mui/material';
import { styled } from '@mui/system';
import ChildCard from 'src/components/shared/ChildCard';
import api from 'src/utils/api';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon, ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon } from '@mui/icons-material';

const StyledSlider = styled(Slider)(({ theme }) => ({
  '& .slick-prev, & .slick-next': {
    zIndex: 1,
    width: '40px',
    height: '40px',
    background: theme.palette.primary.main,
    '&:hover, &:focus': {
      background: theme.palette.primary.dark,
    },
    '&::before': {
      color: theme.palette.common.white,
    },
  },
  '& .slick-prev': { left: '10px' },
  '& .slick-next': { right: '10px' },
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& img': {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
}));

const EnlargedImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
}));

const EnlargedImage = styled('img')(({ theme, zoom }) => ({
  maxWidth: zoom ? 'none' : '100%',
  maxHeight: zoom ? 'none' : '100%',
  objectFit: 'contain',
  transition: 'transform 0.3s ease',
  transform: `scale(${zoom ? 2 : 1})`,
  cursor: zoom ? 'zoom-out' : 'zoom-in',
}));

const ControlsOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1),
  display: 'flex',
  justifyContent: 'flex-end',
  background: 'rgba(0, 0, 0, 0.5)',
}));

const UploadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const WeeklyStats = ({ projectId, projectName }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await api.get(`/projects/${projectId}/images`);
        setImages(response.data);
      } catch (error) {
        console.error('Error fetching project images:', error);
        setError('Failed to load images. Please try again later.');
      }
    };

    if (projectId) {
      fetchImages();
    }
  }, [projectId]);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setOpen(true);
    setZoom(false);
  };

  const handleClose = () => {
    setOpen(false);
    setZoom(false);
  };

  const handleZoomToggle = () => {
    setZoom(!zoom);
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/projects/${projectId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages([...images, response.data]);
    } catch (uploadError) {
      setError('Failed to upload image. Please try again.');
      console.error('Error uploading image:', uploadError);
    } finally {
      setUploading(false);
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  return (
    <Grid container spacing={3} sx={{ maxWidth: '1200px', margin: '0 auto', padding: 2 }}>
      <Grid item xs={12}>
        <ChildCard>
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            {projectName}
          </Typography>
          <Box sx={{ height: isSmallScreen ? '300px' : '500px', marginBottom: 2 }}>
            {images.length > 0 ? (
              <StyledSlider {...sliderSettings}>
                {images.map((image, index) => (
                  <ImageContainer key={image.id} onClick={() => handleImageClick(index)}>
                    <img src={image.image_url} alt={`Project ${index + 1}`} />
                  </ImageContainer>
                ))}
              </StyledSlider>
            ) : (
              <Typography align="center">No images available for this project.</Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <UploadButton
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
            >
              {uploading ? <CircularProgress size={24} /> : ''}
            </UploadButton>
          </Box>
          {error && (
            <Typography color="error" align="center" sx={{ marginTop: 2 }}>
              {error}
            </Typography>
          )}
        </ChildCard>
      </Grid>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxWidth: '90vw',
            margin: '0',
          }
        }}
      >
        <EnlargedImageContainer>
          {images.length > 0 && (
            <EnlargedImage 
              src={images[selectedImageIndex].image_url} 
              alt="Enlarged" 
              zoom={zoom}
              onClick={handleZoomToggle}
            />
          )}
          <ControlsOverlay>
            <IconButton onClick={handleZoomToggle} sx={{ color: 'white' }}>
              {zoom ? <ZoomOutIcon /> : <ZoomInIcon />}
            </IconButton>
            <IconButton onClick={handleClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </ControlsOverlay>
        </EnlargedImageContainer>
      </Dialog>
    </Grid>
  );
};

export default WeeklyStats;