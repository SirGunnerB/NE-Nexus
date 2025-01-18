import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  TextField,
  Divider,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  useTheme,
  alpha,
  Paper
} from '@mui/material';
import {
  Mail as MailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as CompanyIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Note as NoteIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  CalendarMonth as CalendarIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import axios from '../../utils/axios';

const CandidateProfile = () => {
  const { id } = useParams();
  const theme = useTheme();
  const [candidate, setCandidate] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidateDetails();
  }, [id]);

  const fetchCandidateDetails = async () => {
    try {
      const response = await axios.get(`/candidates/${id}`);
      setCandidate(response.data);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStarCandidate = async () => {
    try {
      await axios.put(`/candidates/${id}/star`, {
        starred: !candidate.starred
      });
      setCandidate(prev => ({ ...prev, starred: !prev.starred }));
    } catch (error) {
      console.error('Error starring candidate:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      await axios.post(`/candidates/${id}/notes`, { note: newNote });
      fetchCandidateDetails();
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  if (loading || !candidate) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Avatar
                    src={candidate.avatar}
                    sx={{ width: 120, height: 120 }}
                  >
                    {candidate.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {candidate.name}
                      </Typography>
                      <IconButton onClick={handleStarCandidate}>
                        {candidate.starred ? (
                          <StarIcon sx={{ color: theme.palette.warning.main }} />
                        ) : (
                          <StarBorderIcon />
                        )}
                      </IconButton>
                    </Box>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {candidate.title}
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CompanyIcon color="action" />
                          <Typography>{candidate.currentCompany}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon color="action" />
                          <Typography>{candidate.location}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MailIcon color="action" />
                          <Typography>{candidate.email}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon color="action" />
                          <Typography>{candidate.phone}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                  >
                    Download Resume
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CalendarIcon />}
                  >
                    Schedule Interview
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={4}>
            {/* Skills */}
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Skills</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {candidate.skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Experience</Typography>
                <Timeline>
                  {candidate.experience?.map((exp, index) => (
                    <TimelineItem key={index}>
                      <TimelineOppositeContent sx={{ flex: 0.2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="primary">
                          <WorkIcon />
                        </TimelineDot>
                        {index < candidate.experience.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">{exp.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {exp.company}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Education</Typography>
                <Timeline>
                  {candidate.education?.map((edu, index) => (
                    <TimelineItem key={index}>
                      <TimelineOppositeContent sx={{ flex: 0.2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {edu.year}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="secondary">
                          <SchoolIcon />
                        </TimelineDot>
                        {index < candidate.education.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">{edu.degree}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {edu.school}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={8}>
            {/* Applications */}
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Applications</Typography>
                <Timeline>
                  {candidate.applications?.map((application, index) => (
                    <TimelineItem key={application.id}>
                      <TimelineOppositeContent sx={{ flex: 0.2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot
                          sx={{
                            bgcolor: (() => {
                              switch (application.stage) {
                                case 'new': return theme.palette.info.main;
                                case 'screening': return theme.palette.warning.main;
                                case 'interview': return theme.palette.secondary.main;
                                case 'offer': return theme.palette.success.main;
                                case 'rejected': return theme.palette.error.main;
                                default: return theme.palette.grey[500];
                              }
                            })()
                          }}
                        >
                          <AssignmentIcon />
                        </TimelineDot>
                        {index < candidate.applications.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: 'background.default'
                          }}
                        >
                          <Typography variant="subtitle2">
                            {application.job.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.job.company}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={application.stage}
                              size="small"
                              sx={{
                                backgroundColor: (() => {
                                  switch (application.stage) {
                                    case 'new': return alpha(theme.palette.info.main, 0.1);
                                    case 'screening': return alpha(theme.palette.warning.main, 0.1);
                                    case 'interview': return alpha(theme.palette.secondary.main, 0.1);
                                    case 'offer': return alpha(theme.palette.success.main, 0.1);
                                    case 'rejected': return alpha(theme.palette.error.main, 0.1);
                                    default: return alpha(theme.palette.grey[500], 0.1);
                                  }
                                })(),
                                color: (() => {
                                  switch (application.stage) {
                                    case 'new': return theme.palette.info.main;
                                    case 'screening': return theme.palette.warning.main;
                                    case 'interview': return theme.palette.secondary.main;
                                    case 'offer': return theme.palette.success.main;
                                    case 'rejected': return theme.palette.error.main;
                                    default: return theme.palette.grey[500];
                                  }
                                })()
                              }}
                            />
                          </Box>
                        </Paper>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Notes</Typography>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={handleAddNote}
                          disabled={!newNote.trim()}
                          sx={{ alignSelf: 'flex-end' }}
                        >
                          <SendIcon />
                        </IconButton>
                      )
                    }}
                  />
                </Box>
                <Timeline>
                  {candidate.notes?.map((note, index) => (
                    <TimelineItem key={index}>
                      <TimelineOppositeContent sx={{ flex: 0.2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot>
                          <NoteIcon />
                        </TimelineDot>
                        {index < candidate.notes.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: 'background.default'
                          }}
                        >
                          <Typography>{note.content}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Added by {note.createdBy}
                          </Typography>
                        </Paper>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CandidateProfile; 