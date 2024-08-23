import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  useTheme,
  useMediaQuery,
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Dialog,
  IconButton,
} from '@mui/material';
import { styled, alpha } from '@mui/system';
import ReactImageMagnify from 'react-image-magnify';
import api from 'src/utils/api';
import { 
  CloudUpload as CloudUploadIcon, 
  ChevronLeft, 
  ChevronRight, 
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '90%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
}));

const StyledImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  cursor: 'pointer',
});

const NavigationButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  minWidth: '30px',
  width: '30px',
  height: '30px',
  padding: 0,
  backgroundColor: alpha(theme.palette.primary.main, 0.7),
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.dark, 0.9),
  },
  zIndex: 1,
}));

const ImageCounter = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  bottom: '10px',
  right: '10px',
  padding: '4px 8px',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: theme.palette.common.white,
  borderRadius: '4px',
  fontSize: '0.875rem',
  zIndex: 1,
}));

const UploadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.7),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.dark, 0.9),
  },
}));

const EnlargedImageContainer = styled(Box)({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'black',
  overflow: 'hidden',
  position: 'relative',
});

const FullSizeImageContainer = styled(Box)({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'black',
  overflow: 'auto',
});

const FullSizeImage = styled('img')({
  maxWidth: 'none',
  maxHeight: 'none',
});

const ZoomButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: 16,
  right: 16,
  backgroundColor: alpha(theme.palette.primary.main, 0.7),
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.dark, 0.9),
  },
}));

const WeeklyStats = ({ projectId, projectName }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

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

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setOpen(true);
    setIsZoomed(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
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

  return (
    <Grid
      item
      xs={12}
      lg={8}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: alpha(theme.palette.background.paper, 0.7),
          overflow: 'hidden',
          boxSizing: 'border-box',
          flexGrow: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            padding: theme.spacing(2),
            color: theme.palette.text.primary,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {projectName}
        </Typography>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box',
            backgroundColor: '#f0f0f0',
          }}
        >
          {images.length > 0 ? (
            <ImageContainer>
              <StyledImage
                src={images[currentIndex].image_url}
                alt={`Project ${currentIndex + 1}`}
                onClick={() => handleImageClick(currentIndex)}
              />
              <NavigationButton onClick={handlePrevious} style={{ left: '10px' }}>
                <ChevronLeft />
              </NavigationButton>
              <NavigationButton onClick={handleNext} style={{ right: '10px' }}>
                <ChevronRight />
              </NavigationButton>
              <ImageCounter>
                {currentIndex + 1} / {images.length}
              </ImageCounter>
            </ImageContainer>
          ) : (
            <Typography
              align="center"
              color={theme.palette.text.secondary}
              sx={{ wordWrap: 'break-word' }}
            >
              No images available for this project.
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', padding: theme.spacing(2) }}>
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
            {uploading ? <CircularProgress size={24} /> : 'Upload Image'}
          </UploadButton>
        </Box>

        {error && (
          <Typography color="error" align="center" sx={{ marginTop: 2 }}>
            {error}
          </Typography>
        )}
      </Paper>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <IconButton
          onClick={handleClose}
          aria-label="close"
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            zIndex: 2,
          }}
        >
          <CloseIcon />
        </IconButton>
        {isZoomed ? (
          <EnlargedImageContainer>
            {images.length > 0 && (
              <ReactImageMagnify
                {...{
                  smallImage: {
                    alt: `Enlarged Project ${selectedImageIndex + 1}`,
                    isFluidWidth: true,
                    src: images[selectedImageIndex].image_url,
                  },
                  largeImage: {
                    src: images[selectedImageIndex].image_url,
                    width: 1600,
                    height: 2400,
                  },
                  enlargedImageContainerDimensions: {
                    width: '150%',
                    height: '150%',
                  },
                  isHintEnabled: true,
                  shouldHideHintAfterFirstActivation: false,
                  enlargedImagePosition: 'over',
                  hintTextMouse: 'Hover to zoom',
                  hintTextTouch: 'Long-touch to zoom',
                }}
              />
            )}
          </EnlargedImageContainer>
        ) : (
          <FullSizeImageContainer>
            {images.length > 0 && (
              <FullSizeImage
                src={images[selectedImageIndex].image_url}
                alt={`Full-size Project ${selectedImageIndex + 1}`}
              />
            )}
          </FullSizeImageContainer>
        )}
        <ZoomButton onClick={handleZoomToggle}>
          {isZoomed ? <ZoomOutIcon /> : <ZoomInIcon />}
        </ZoomButton>
      </Dialog>
    </Grid>
  );
};

export default WeeklyStats;