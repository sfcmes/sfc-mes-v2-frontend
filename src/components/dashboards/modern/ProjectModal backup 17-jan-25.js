import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  Button,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close as CloseIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import ComponentDialog from './ComponentDialog';

// CircularProgressWithLabel Component
function CircularProgressWithLabel({ value }) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" value={value} size={68} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="caption" component="div" color="text.secondary">{`${Math.round(
          value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

/** Constants **/
const COLORS = {
  planning: '#64b5f6',
  manufactured: '#82ca9d',
  transported: '#ffc658',
  accepted: '#8e44ad',
  installed: '#27ae60',
  rejected: '#ff6b6b',
};

const STATUS_THAI = {
  planning: 'รอผลิต',
  manufactured: 'ผลิตแล้ว',
  transported: 'ขนส่งสำเร็จ',
  accepted: 'ตรวจรับแล้ว',
  installed: 'ติดตั้งแล้ว',
  rejected: 'ถูกปฏิเสธ',
};

const statusOrder = [
  'planning',
  'manufactured',
  'transported',
  'accepted',
  'installed',
  'rejected',
];

/** Helper Functions **/
const getStatusColor = (status) => {
  return { bg: COLORS[status], color: '#ffffff' };
};

const parseName = (name = '') => {
  if (!name) return { original: '' };

  const matchFRP = name.match(/^(\D+)-(\d+)-(\d+)$/);
  if (matchFRP) {
    const [, prefix, group, number] = matchFRP;
    return {
      prefix,
      group: parseInt(group, 10),
      number: parseInt(number, 10),
    };
  }
  const matchSection = name.match(/^(\d+)-(\d+)$/);
  if (matchSection) {
    const [, group, number] = matchSection;
    return { group: parseInt(group, 10), number: parseInt(number, 10) };
  }
  if (/^\d+$/.test(name)) {
    return { number: parseInt(name, 10) };
  }
  return { original: name };
};

const compareNames = (a = '', b = '') => {
  const aInfo = parseName(a);
  const bInfo = parseName(b);

  if (aInfo.prefix && bInfo.prefix) {
    if (aInfo.prefix !== bInfo.prefix) return aInfo.prefix.localeCompare(bInfo.prefix);
    if (aInfo.group !== bInfo.group) return aInfo.group - bInfo.group;
    return aInfo.number - bInfo.number;
  }
  if ('group' in aInfo && 'group' in bInfo) {
    if (aInfo.group !== bInfo.group) return aInfo.group - bInfo.group;
    return aInfo.number - bInfo.number;
  }
  if ('number' in aInfo && 'number' in bInfo && !('group' in aInfo) && !('group' in bInfo)) {
    return aInfo.number - bInfo.number;
  }
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};

const sortComponents = (components = []) => {
  if (!Array.isArray(components)) return [];

  return components.sort((a, b) => {
    if (!a || !b) return 0;
    return compareNames(a.name, b.name);
  });
};

const getTotalComponentCount = (sections = []) => {
  if (!Array.isArray(sections)) return 0;
  return sections.reduce((total, section) => {
    if (!section?.components) return total;
    return total + section.components.filter(Boolean).length;
  }, 0);
};

const getComponentCountText = (count) => {
  return `(${count} ชิ้นงาน)`;
};

/** StatusChip Component **/
const StatusChip = memo(({ status, label }) => {
  const { bg, color } = getStatusColor(status);
  return (
    <Box
      component="span"
      sx={{
        bgcolor: bg,
        color: color,
        fontWeight: 'bold',
        padding: '4px 8px',
        borderRadius: '16px',
        fontSize: { xs: '0.7rem', sm: '0.9rem' },
        display: 'inline-block',
        margin: '2px',
      }}
    >
      {label}
    </Box>
  );
});

/** ComponentCard Component **/
const ComponentCard = memo(({ component, onOpenDialog }) => {
  if (!component) return null;

  const { bg, color } = getStatusColor(component.status);

  return (
    <Grid item xs={3} sm={1.2} md={0.8} lg={0.6}>
      <Tooltip title={component.name} arrow>
        <Card
          sx={{
            bgcolor: bg,
            height: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: '1px',
            m: '1px',
            border: '1px solid',
            borderColor: bg,
            cursor: 'pointer',
          }}
          onClick={() => onOpenDialog(component)}
        >
          <CardContent
            sx={{
              textAlign: 'center',
              p: '1px',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: color,
                fontSize: { xs: '5px', sm: '6px', md: '7px' },
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {component.name}
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDialog(component);
              }}
              sx={{
                mt: '1px',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: color,
                fontSize: { xs: '4px', sm: '5px', md: '6px' },
                p: '1px 2px',
                minWidth: 'auto',
              }}
            >
              ดูข้อมูล
            </Button>
          </CardContent>
        </Card>
      </Tooltip>
    </Grid>
  );
});

/** SectionAccordion Component **/
const SectionAccordion = memo(({ section, projectCode, onOpenDialog }) => {
  if (!section) return null;

  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const componentCount = section.components?.filter(Boolean).length || 0;

  const statusCounts = useMemo(() => {
    if (!Array.isArray(section.components)) return {};
    return section.components.reduce((acc, component) => {
      if (!component) return acc;
      acc[component.status] = (acc[component.status] || 0) + 1;
      return acc;
    }, {});
  }, [section.components]);

  return (
    <Accordion
      expanded={expanded === `panel${section.id}`}
      onChange={handleChange(`panel${section.id}`)}
      sx={{
        mb: 2,
        boxShadow: 3,
        '&:before': {
          display: 'none',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
            transform: 'rotate(180deg)',
          },
          '& .MuiAccordionSummary-content': {
            flexDirection: 'column',
          },
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6">{section.name || `ชั้นที่ ${section.id}`}</Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            {getComponentCountText(componentCount)}
          </Typography>
        </Box>
        <Box display="flex" flexWrap="wrap" mt={1}>
          {statusOrder.map((status) => {
            const count = statusCounts[status] || 0;
            return (
              <StatusChip key={status} status={status} label={`${STATUS_THAI[status]}: ${count}`} />
            );
          })}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={0.5}>
          {Array.isArray(section.components) &&
            section.components.map(
              (component) =>
                component && (
                  <ComponentCard
                    key={component.id}
                    component={component}
                    onOpenDialog={onOpenDialog}
                  />
                ),
            )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
});

/** Main ProjectModal Component **/
const ProjectModal = memo(
  ({
    project,
    open,
    onClose,
    userRole,
    userProjectIds,
    canEdit: initialCanEdit, // Rename to avoid conflict
    onProjectSelect,
    isLoading: parentIsLoading,
    error: parentError,
  }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.up('md'));
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [localLoading, setLocalLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const hasEditPermission = useMemo(() => {
      return userRole === 'Admin' || userProjectIds?.includes(project?.id);
    }, [userRole, userProjectIds, project?.id]);

    const modalWidth = useMemo(() => {
      if (isLargeScreen) return '95vw';
      if (isMediumScreen) return '90vw';
      return '100vw';
    }, [isLargeScreen, isMediumScreen]);

    const modalHeight = useMemo(() => {
      if (isLargeScreen) return '95vh';
      if (isMediumScreen) return '90vh';
      return '100vh';
    }, [isLargeScreen, isMediumScreen]);

    const totalComponents = useMemo(
      () => getTotalComponentCount(project?.sections),
      [project?.sections],
    );

    useEffect(() => {
      if (localLoading || parentIsLoading) {
        const timer = setInterval(() => {
          setLoadingProgress((prevProgress) => {
            const newProgress = prevProgress + 10;
            if (newProgress >= 90) {
              clearInterval(timer);
              return 90;
            }
            return newProgress;
          });
        }, 200);

        return () => {
          clearInterval(timer);
        };
      } else {
        setLoadingProgress(100);
        const timer = setTimeout(() => {
          setLoadingProgress(0);
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [localLoading, parentIsLoading]);

    const sortedSections = useMemo(() => {
      if (!project?.sections || !Array.isArray(project.sections)) return [];

      return [...project.sections]
        .filter(Boolean)
        .sort((a, b) => compareNames(a?.name || '', b?.name || ''))
        .map((section) => ({
          ...section,
          components: sortComponents(section?.components),
        }));
    }, [project?.sections]);

    const handleComponentUpdate = useCallback(
      (updatedComponent) => {
        if (!project?.sections || !Array.isArray(project.sections)) return;

        // เพิ่มเงื่อนไขเมื่อ component ถูกลบ (updatedComponent เป็น null)
        if (updatedComponent === null) {
          // สร้าง sections ใหม่โดยลบ component ที่ถูกลบออก
          const updatedSections = project.sections.map((section) => {
            if (!section) return section;
            return {
              ...section,
              components: Array.isArray(section.components)
                ? section.components.filter((comp) => comp?.id !== selectedComponent?.id)
                : [],
            };
          });

          // กรองเอาเฉพาะ section ที่มี components ที่ไม่ใช่ array ว่าง
          const filteredSections = updatedSections.filter(
            (section) =>
              section && Array.isArray(section.components) && section.components.length > 0,
          );

          const updatedProject = {
            ...project,
            sections: filteredSections,
          };

          onProjectSelect?.(updatedProject);
          setSelectedComponent(null); // ปิด ComponentDialog
          return;
        }

        // กรณี update ปกติ
        const updatedSections = project.sections.map((section) => {
          if (!section) return section;
          return {
            ...section,
            components: Array.isArray(section.components)
              ? section.components.map((comp) =>
                  comp?.id === updatedComponent?.id ? updatedComponent : comp,
                )
              : [],
          };
        });

        const updatedProject = {
          ...project,
          sections: updatedSections,
        };

        onProjectSelect?.(updatedProject);
      },
      [project, onProjectSelect, selectedComponent],
    );

    useEffect(() => {
      if (open && project) {
        onProjectSelect(project);
      }
    }, [open, project, onProjectSelect]);

    const handleOpenDialog = useCallback((component) => {
      setSelectedComponent(component);
    }, []);

    const handleCloseDialog = useCallback(() => {
      setSelectedComponent(null);
    }, []);

    if (!open) return null;

    const isLoadingState = parentIsLoading || localLoading;

    return (
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={onClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: modalWidth,
            height: modalHeight,
            maxWidth: '98vw',
            maxHeight: '98vh',
            bgcolor: theme.palette.background.default,
          },
        }}
        TransitionProps={{
          onEnter: () => {
            setLocalLoading(true);
            setLoadingProgress(0);
          },
          onEntered: () => setLocalLoading(false),
        }}
      >
        {isLoadingState ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            p={3}
            minHeight="200px"
          >
            <CircularProgressWithLabel value={loadingProgress} />
            <Typography variant="body2" color="text.secondary" mt={2}>
              กำลังโหลดข้อมูล...
            </Typography>
          </Box>
        ) : parentError ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <Alert severity="error">{parentError}</Alert>
          </Box>
        ) : (
          <>
            <DialogTitle
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: { xs: 2, sm: 3 },
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h5" component="div">
                  {project?.name || `โปรเจค ${project?.project_code}`}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {getComponentCountText(totalComponents)}
                </Typography>
              </Box>
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent
              dividers
              sx={{
                p: { xs: 1, sm: 2 },
                overflowY: 'auto',
              }}
            >
              {sortedSections.map(
                (section) =>
                  section && (
                    <SectionAccordion
                      key={section.id}
                      section={section}
                      projectCode={project?.project_code}
                      onOpenDialog={handleOpenDialog}
                    />
                  ),
              )}
            </DialogContent>
          </>
        )}
        {selectedComponent && (
          <ComponentDialog
            open={Boolean(selectedComponent)}
            onClose={handleCloseDialog}
            component={selectedComponent}
            projectCode={project?.project_code}
            onComponentUpdate={handleComponentUpdate}
            canEdit={hasEditPermission} // Use hasEditPermission here
            userRole={userRole}
          />
        )}
      </Dialog>
    );
  },
);

export default ProjectModal;
