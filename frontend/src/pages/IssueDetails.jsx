import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import issueService from '../services/issueService';
import { useAuth } from '../contexts/AuthContext';
import MapView from '../components/MapView';
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import {
  ThumbUp,
  HowToReg,
  CheckCircle,
  AutoAwesome,
  CalendarMonth,
  LocationOn,
  Message,
  CloudUpload,
  VerifiedUser,
  Warning,
} from '@mui/icons-material';

const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const backendUrl = import.meta.env.DEV ? 'http://localhost:5000' : '';
  return `${backendUrl}${url}`;
};

const getSeverityDetails = (score) => {
  if (score >= 80) return { label: 'Critical', color: 'error' };
  if (score >= 60) return { label: 'High', color: 'secondary' };
  if (score >= 40) return { label: 'Medium', color: 'warning' };
  return { label: 'Low', color: 'success' };
};

const getStatusColor = (status) => {
  switch (status) {
    case 'resolved': return 'success';
    case 'in-progress': return 'info';
    case 'validated': return 'primary';
    default: return 'default';
  }
};

const IssueDetails = () => {
  const { id } = useParams();
  const { user, refreshUserProfile } = useAuth();
  
  const [data, setData] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  // Additional Evidence State
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceText, setEvidenceText] = useState('');
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  // AI Verification Dialog State
  const [aiDialog, setAiDialog] = useState({ open: false, status: '', explanation: '' });

  const loadIssueDetails = async () => {
    try {
      const res = await issueService.getIssueById(id);
      if (res.success) {
        setData(res.data);
      }
      
      const commRes = await issueService.getComments(id);
      if (commRes.success) {
        setComments(commRes.data);
      }
    } catch (err) {
      console.error('Error fetching details:', err.message);
      setFeedback({ type: 'error', msg: 'Failed to load issue details' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssueDetails();
  }, [id]);

  const handleAction = async (actionType) => {
    if (!user) {
      return setFeedback({ type: 'warning', msg: 'Please log in to validate issues' });
    }
    
    setActionLoading(true);
    setFeedback({ type: '', msg: '' });
    
    try {
      let res;
      if (actionType === 'confirm') res = await issueService.confirmIssue(id);
      else if (actionType === 'upvote') res = await issueService.upvoteIssue(id);
      else if (actionType === 'resolve') res = await issueService.resolveIssue(id);

      if (res.success) {
        setFeedback({ type: 'success', msg: res.message || 'Action completed successfully!' });
        await loadIssueDetails();
        await refreshUserProfile();
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'Action failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await issueService.addComment(id, newComment);
      if (res.success) {
        setComments([...comments, res.data]);
        setNewComment('');
        await loadIssueDetails(); // Refresh report metrics
        await refreshUserProfile(); // Refresh reputation
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Failed to post comment' });
    }
  };

  const handleEvidenceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingEvidence(true);
    setFeedback({ type: '', msg: '' });

    const formData = new FormData();
    formData.append('media', file);
    formData.append('explanation', evidenceText || 'Evidence uploaded by community member');

    try {
      const res = await issueService.addEvidence(id, formData);
      if (res.success) {
        // Display AI Relevance Dialog
        setAiDialog({
          open: true,
          status: res.relevanceStatus,
          explanation: res.explanation
        });
        
        setEvidenceFile(null);
        setEvidenceText('');
        
        await loadIssueDetails();
        await refreshUserProfile();
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'Evidence upload failed.' });
    } finally {
      setUploadingEvidence(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const { issue = {}, media = [] } = data || {};
  const severity = getSeverityDetails(issue.severityScore);
  const statusColor = getStatusColor(issue.status);

  // Coordinate structure is [longitude, latitude] in GeoJSON
  const issueCoords = issue.location?.coordinates
    ? [issue.location.coordinates[1], issue.location.coordinates[0]]
    : [40.7128, -74.0060];

  // Get primary attachment
  const primaryMedia = media.find(m => m.aiRelevance === 'Relevant' && !m.flagged) || media[0];
  const additionalMedia = media.filter(m => m._id !== primaryMedia?._id);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Back button */}
      <Button component={Link} to="/dashboard" sx={{ mb: 3 }}>
        ← Back to Dashboard
      </Button>

      {feedback.msg && (
        <Alert severity={feedback.type} sx={{ mb: 3, borderRadius: 3 }}>
          {feedback.msg}
        </Alert>
      )}

      {/* Main Grid */}
      <Grid container spacing={4}>
        {/* Left Column: Image, Info & Media uploads */}
        <Grid item xs={12} md={7}>
          {/* Issue Header Card */}
          <Card sx={{ mb: 4 }}>
            {primaryMedia ? (
              primaryMedia.mediaType === 'video' ? (
                <CardMedia
                  component="video"
                  src={getMediaUrl(primaryMedia.mediaUrl)}
                  controls
                  sx={{ height: { xs: 260, md: 360 } }}
                />
              ) : (
                <CardMedia
                  component="img"
                  image={getMediaUrl(primaryMedia.mediaUrl)}
                  alt={issue.title}
                  sx={{ height: { xs: 260, md: 360 }, objectFit: 'cover' }}
                />
              )
            ) : (
              <Box height={240} bgcolor="grey.800" display="flex" alignItems="center" justifyContent="center">
                <Typography color="textSecondary">No primary media uploaded</Typography>
              </Box>
            )}

            <CardContent sx={{ p: 4 }}>
              <Box display="flex" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
                <Chip label={issue.category} color="primary" />
                <Box display="flex" gap={1}>
                  <Chip label={issue.status.toUpperCase()} color={statusColor} sx={{ fontWeight: 700 }} />
                  <Chip label={`${severity.label} Severity`} color={severity.color} sx={{ fontWeight: 700 }} />
                </Box>
              </Box>

              <Typography variant="h4" fontWeight={900} gutterBottom>
                {issue.title}
              </Typography>

              <Box display="flex" gap={3} my={2.5} flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <LocationOn sx={{ color: 'text.secondary', fontSize: 16 }} />
                  <Typography variant="caption" color="textSecondary">
                    {issue.address}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CalendarMonth sx={{ color: 'text.secondary', fontSize: 16 }} />
                  <Typography variant="caption" color="textSecondary">
                    {new Date(issue.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <VerifiedUser sx={{ color: 'primary.main', fontSize: 16 }} />
                  <Typography variant="caption" color="textSecondary">
                    Reporter: {issue.reporter?.name || 'Anonymous'}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.06)' }} />

              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Incident Description
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.7, mb: 3 }}>
                {issue.description}
              </Typography>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<HowToReg />}
                  onClick={() => handleAction('confirm')}
                  disabled={actionLoading || issue.status === 'resolved'}
                >
                  Confirm Existence (+10 pts)
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ThumbUp />}
                  onClick={() => handleAction('upvote')}
                  disabled={actionLoading}
                >
                  Upvote Priority (+5 pts)
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => handleAction('resolve')}
                  disabled={actionLoading || issue.status === 'resolved'}
                >
                  {user?.role === 'admin' ? 'Resolve Now' : 'Vote Resolved (+30 pts)'}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* User comments feed */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Message color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Community Comments & Updates
                </Typography>
              </Box>

              {user ? (
                <Box component="form" onSubmit={handleCommentSubmit} display="flex" gap={2} mb={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Provide updates or constructive coordination..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button type="submit" variant="contained">
                    Comment
                  </Button>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
                  Log in to post comments and earn points.
                </Alert>
              )}

              <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.06)' }} />

              {comments.length === 0 ? (
                <Typography variant="body2" color="textSecondary" align="center" py={2}>
                  No comments posted yet.
                </Typography>
              ) : (
                <List>
                  {comments.map((comment) => (
                    <ListItem key={comment._id} sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 34, height: 34 }}>
                        {comment.user?.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <ListItemText
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                        primary={
                          <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
                            <Typography variant="body2" fontWeight={700}>
                              {comment.user?.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box mt={0.5}>
                            <Typography variant="body2" color="textPrimary">
                              {comment.text}
                            </Typography>
                            <Typography variant="caption" color="secondary" fontWeight={600}>
                              Reputation: {comment.user?.reputationScore || 0}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: AI Analysis, Geospatial Map & Extra Media upload */}
        <Grid item xs={12} md={5}>
          {/* AI Analysis metrics */}
          <Card sx={{ mb: 4, border: '1px solid rgba(0, 229, 255, 0.25)', bgcolor: 'rgba(0, 229, 255, 0.01)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AutoAwesome color="primary" />
                <Typography variant="h6" fontWeight={800}>
                  AI Analysis (Gemini Intelligence)
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.06)' }} />

              <Stack spacing={3}>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" color="textSecondary">Severity score</Typography>
                    <Typography variant="body2" fontWeight={700} color={`${severity.color}.main`}>
                      {issue.severityScore}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={issue.severityScore} color={severity.color} sx={{ borderRadius: 2, height: 6 }} />
                </Box>

                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" color="textSecondary">Community impact score</Typography>
                    <Typography variant="body2" fontWeight={700} color="info.main">
                      {issue.impactScore}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={issue.impactScore} color="info" sx={{ borderRadius: 2, height: 6 }} />
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="textSecondary">Urgency Level</Typography>
                  <Chip label={issue.urgencyLevel} color={issue.urgencyLevel === 'Critical' || issue.urgencyLevel === 'High' ? 'error' : 'default'} size="small" sx={{ fontWeight: 700 }} />
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="textSecondary">Analysis Confidence</Typography>
                  <Typography variant="body2" fontWeight={700}>{(issue.confidence * 100).toFixed(0)}%</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="textSecondary" display="block" gutterBottom fontWeight={700}>
                    AI EXECUTIVE SUMMARY
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', bgcolor: 'rgba(255,255,255,0.02)', p: 2, borderRadius: 2 }}>
                    "{issue.aiSummary || 'Analysis generated upon report submission.'}"
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="textSecondary" display="block" gutterBottom fontWeight={700}>
                    RECOMMENDED MUNICIPAL ACTION
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    {issue.recommendedAction || 'Schedule dispatch inspections.'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Geospatial Map picker */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Incident Coordinates
              </Typography>
              <MapView
                clickToPickMode={false}
                center={issueCoords}
                issues={[issue]}
                zoom={15}
                height="220px"
              />
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1.5, display: 'block' }}>
                Latitude: {issueCoords[0].toFixed(5)}, Longitude: {issueCoords[1].toFixed(5)}
              </Typography>
            </CardContent>
          </Card>

          {/* Upload additional evidence */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={700} mb={1}>
                Upload Additional Evidence
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block" mb={2}>
                Add more photos/videos. Gemini verifies whether evidence is relevant to this issue description.
              </Typography>

              <TextField
                fullWidth
                size="small"
                label="Evidence Description"
                placeholder="Explain what this file shows..."
                value={evidenceText}
                onChange={(e) => setEvidenceText(e.target.value)}
                sx={{ mb: 2 }}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <Box
                sx={{
                  border: '2px dashed rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: 'rgba(255,255,255,0.01)',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
                component="label"
              >
                <input type="file" accept="image/*,video/*" hidden onChange={handleEvidenceUpload} disabled={uploadingEvidence} />
                {uploadingEvidence ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <CloudUpload color="primary" sx={{ fontSize: 28, mb: 0.5 }} />
                    <Typography variant="body2" fontWeight={600} display="block">
                      Attach Image or Video
                    </Typography>
                  </>
                )}
              </Box>

              {/* Display additional attachments */}
              {additionalMedia.length > 0 && (
                <Box mt={3}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                    Submitted Evidence ({additionalMedia.length})
                  </Typography>
                  <Grid container spacing={1}>
                    {additionalMedia.map((m) => (
                      <Grid item xs={4} key={m._id}>
                        {m.mediaType === 'video' ? (
                          <Box
                            component="video"
                            src={getMediaUrl(m.mediaUrl)}
                            controls
                            sx={{ width: '100%', height: 70, borderRadius: 2, objectFit: 'cover' }}
                          />
                        ) : (
                          <Box
                            component="img"
                            src={getMediaUrl(m.mediaUrl)}
                            alt="evidence"
                            sx={{ width: '100%', height: 70, borderRadius: 2, objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => window.open(getMediaUrl(m.mediaUrl), '_blank')}
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Relevance Response Dialog */}
      <Dialog
        open={aiDialog.open}
        onClose={() => setAiDialog({ ...aiDialog, open: false })}
        slotProps={{
          paper: { sx: { borderRadius: 4, p: 1 } },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome color="primary" />
          <Typography variant="h6" fontWeight={800}>
            AI Evidence Evaluation
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
            {aiDialog.status === 'Unrelated' ? (
              <Chip icon={<Warning />} label="AI Detected: Unrelated Content" color="error" sx={{ fontWeight: 700 }} />
            ) : (
              <Chip icon={<CheckCircle />} label={`AI Verified: ${aiDialog.status}`} color={aiDialog.status === 'Relevant' ? 'success' : 'warning'} sx={{ fontWeight: 700 }} />
            )}
          </Box>
          <Typography variant="body2" color="textSecondary" mb={2}>
            {aiDialog.explanation}
          </Typography>
          {aiDialog.status === 'Unrelated' && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              This attachment has been flagged and is pending moderator review. It remains hidden in public directories.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="contained" onClick={() => setAiDialog({ ...aiDialog, open: false })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default IssueDetails;
