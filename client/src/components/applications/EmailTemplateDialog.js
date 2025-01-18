import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const defaultTemplates = [
  {
    id: 'interview',
    name: 'Interview Invitation',
    subject: 'Interview Invitation for [Position]',
    body: `Dear [Candidate Name],

Thank you for applying to the [Position] role at [Company]. We were impressed with your application and would like to invite you for an interview.

[Interview Details]

Please let me know if this time works for you, and I'll send a calendar invitation with more details.

Best regards,
[Your Name]`,
  },
  {
    id: 'shortlisted',
    name: 'Application Shortlisted',
    subject: 'Update on Your Application for [Position]',
    body: `Dear [Candidate Name],

Thank you for applying to the [Position] role at [Company]. I'm pleased to inform you that your application has been shortlisted for further consideration.

We will be in touch soon with next steps.

Best regards,
[Your Name]`,
  },
  {
    id: 'rejected',
    name: 'Application Status Update',
    subject: 'Update on Your Application for [Position]',
    body: `Dear [Candidate Name],

Thank you for your interest in the [Position] role at [Company] and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We appreciate your interest in joining our team and wish you the best in your job search.

Best regards,
[Your Name]`,
  },
];

const EmailTemplateDialog = ({ open, onClose, candidate, position, company, onSend }) => {
  const [templates, setTemplates] = useState(() => {
    const savedTemplates = localStorage.getItem('emailTemplates');
    return savedTemplates ? JSON.parse(savedTemplates) : defaultTemplates;
  });
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState(false);

  const handleSaveTemplate = (template) => {
    const updatedTemplates = editingTemplate
      ? templates.map((t) => (t.id === template.id ? template : t))
      : [...templates, { ...template, id: Date.now().toString() }];
    
    setTemplates(updatedTemplates);
    localStorage.setItem('emailTemplates', JSON.stringify(updatedTemplates));
    setEditingTemplate(null);
    setNewTemplate(false);
  };

  const handleDeleteTemplate = (templateId) => {
    const updatedTemplates = templates.filter((t) => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem('emailTemplates', JSON.stringify(updatedTemplates));
  };

  const handleUseTemplate = (template) => {
    const replacements = {
      '[Candidate Name]': candidate.name,
      '[Position]': position,
      '[Company]': company,
    };

    const subject = template.subject.replace(
      /\[(?:Candidate Name|Position|Company)\]/g,
      (match) => replacements[match]
    );
    const body = template.body.replace(
      /\[(?:Candidate Name|Position|Company)\]/g,
      (match) => replacements[match]
    );

    onSend(subject, body);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Email Templates
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingTemplate(null);
            setNewTemplate(true);
          }}
          sx={{ float: 'right' }}
        >
          New Template
        </Button>
      </DialogTitle>
      <DialogContent>
        {(editingTemplate || newTemplate) ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {newTemplate ? 'New Template' : 'Edit Template'}
            </Typography>
            <TextField
              fullWidth
              label="Template Name"
              value={editingTemplate?.name || ''}
              onChange={(e) =>
                setEditingTemplate((prev) => ({ ...prev, name: e.target.value }))
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Subject"
              value={editingTemplate?.subject || ''}
              onChange={(e) =>
                setEditingTemplate((prev) => ({ ...prev, subject: e.target.value }))
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Body"
              value={editingTemplate?.body || ''}
              onChange={(e) =>
                setEditingTemplate((prev) => ({ ...prev, body: e.target.value }))
              }
              sx={{ mb: 2 }}
            />
            <Typography variant="caption" color="text.secondary">
              Available placeholders: [Candidate Name], [Position], [Company], [Your Name]
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setEditingTemplate(null);
                  setNewTemplate(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSaveTemplate(editingTemplate)}
                disabled={!editingTemplate?.name || !editingTemplate?.subject || !editingTemplate?.body}
              >
                Save Template
              </Button>
            </Box>
          </Box>
        ) : (
          <List>
            {templates.map((template) => (
              <React.Fragment key={template.id}>
                <ListItem>
                  <ListItemText
                    primary={template.name}
                    secondary={template.subject}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => setEditingTemplate(template)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteTemplate(template.id)}
                      sx={{ mr: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailTemplateDialog; 