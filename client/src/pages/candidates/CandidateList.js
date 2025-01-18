import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  useTheme,
  alpha,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as CompanyIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from '../../utils/axios';

const stages = [
  { id: 'new', label: 'New', color: 'info' },
  { id: 'screening', label: 'Screening', color: 'warning' },
  { id: 'interview', label: 'Interview', color: 'secondary' },
  { id: 'offer', label: 'Offer', color: 'success' },
  { id: 'rejected', label: 'Rejected', color: 'error' }
];

const CandidateList = () => {
  const theme = useTheme();
  const [candidates, setCandidates] = useState({});
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    experience: '',
    location: '',
    skills: []
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('/candidates');
      // Group candidates by stage
      const grouped = response.data.reduce((acc, candidate) => {
        if (!acc[candidate.stage]) {
          acc[candidate.stage] = [];
        }
        acc[candidate.stage].push(candidate);
        return acc;
      }, {});
      setCandidates(grouped);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Update local state
    const sourceStage = candidates[source.droppableId];
    const destStage = candidates[destination.droppableId];
    const [movedCandidate] = sourceStage.splice(source.index, 1);
    destStage.splice(destination.index, 0, movedCandidate);

    setCandidates({
      ...candidates,
      [source.droppableId]: sourceStage,
      [destination.droppableId]: destStage
    });

    // Update backend
    try {
      await axios.put(`/candidates/${draggableId}/stage`, {
        stage: destination.droppableId
      });
    } catch (error) {
      console.error('Error updating candidate stage:', error);
      // Revert changes on error
      fetchCandidates();
    }
  };

  const handleMenuOpen = (event, candidate) => {
    setAnchorEl(event.currentTarget);
    setSelectedCandidate(candidate);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCandidate(null);
  };

  const handleStarCandidate = async (candidateId, isStarred) => {
    try {
      await axios.put(`/candidates/${candidateId}/star`, { starred: !isStarred });
      fetchCandidates();
    } catch (error) {
      console.error('Error starring candidate:', error);
    }
  };

  const CandidateCard = ({ candidate, index }) => (
    <Draggable draggableId={candidate.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            mb: 2,
            transition: 'transform 0.2s, box-shadow 0.2s',
            transform: snapshot.isDragging ? 'scale(1.02)' : 'none',
            boxShadow: snapshot.isDragging
              ? '0 8px 24px rgba(0,0,0,0.15)'
              : '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Avatar
                src={candidate.avatar}
                sx={{ width: 48, height: 48, mr: 2 }}
              >
                {candidate.name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {candidate.name}
                  </Typography>
                  <Tooltip title={candidate.starred ? 'Remove star' : 'Star candidate'}>
                    <IconButton
                      size="small"
                      onClick={() => handleStarCandidate(candidate.id, candidate.starred)}
                    >
                      {candidate.starred ? (
                        <StarIcon sx={{ color: theme.palette.warning.main }} />
                      ) : (
                        <StarBorderIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {candidate.title}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, candidate)}
              >
                <MoreIcon />
              </IconButton>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <CompanyIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2">{candidate.currentCompany}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2">{candidate.location}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <MailIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2">{candidate.email}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <PhoneIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2">{candidate.phone}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {candidate.skills.slice(0, 3).map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main
                  }}
                />
              ))}
              {candidate.skills.length > 3 && (
                <Chip
                  label={`+${candidate.skills.length - 3}`}
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.grey[500], 0.1),
                    color: theme.palette.grey[500]
                  }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Candidates
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search candidates..."
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                )
              }}
              sx={{ width: 300 }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
            >
              Filter
            </Button>
          </Box>
        </Box>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${stages.length}, 1fr)`,
              gap: 2,
              minHeight: 'calc(100vh - 200px)'
            }}
          >
            {stages.map((stage) => (
              <Box key={stage.id}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {stage.label}
                    </Typography>
                    <Chip
                      label={candidates[stage.id]?.length || 0}
                      size="small"
                      color={stage.color}
                      sx={{
                        minWidth: 30,
                        backgroundColor: alpha(theme.palette[stage.color].main, 0.1),
                        color: theme.palette[stage.color].main
                      }}
                    />
                  </Box>
                </Box>
                <Droppable droppableId={stage.id}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        backgroundColor: theme.palette.background.default,
                        borderRadius: 2,
                        p: 2,
                        minHeight: 200
                      }}
                    >
                      {candidates[stage.id]?.map((candidate, index) => (
                        <CandidateCard
                          key={candidate.id}
                          candidate={candidate}
                          index={index}
                        />
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Box>
            ))}
          </Box>
        </DragDropContext>

        {/* Candidate Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { width: 200 }
          }}
        >
          <MenuItem onClick={handleMenuClose}>View Profile</MenuItem>
          <MenuItem onClick={handleMenuClose}>Schedule Interview</MenuItem>
          <MenuItem onClick={handleMenuClose}>Send Email</MenuItem>
          <MenuItem onClick={handleMenuClose}>Download Resume</MenuItem>
        </Menu>
      </Box>
    </Container>
  );
};

export default CandidateList; 