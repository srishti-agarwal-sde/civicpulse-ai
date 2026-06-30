import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import issueService from '../services/issueService';
import {
  Container,
  Typography,
  Box,
  Tab,
  Tabs,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  AdminPanelSettings,
  Flag,
  ListAlt,
  People,
  CheckCircle,
  Cancel,
  Edit,
  AutoAwesome,
} from '@mui/icons-material';

const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const backendUrl = import.meta.env.DEV ? 'http://localhost:5000' : '';
  return `${backendUrl}${url}`;
};

const CATEGORIES = [
  'Waste Management',
  'Water Leakage',
  'Public Safety',
  'Infrastructure Damage',
  'Accessibility Issues',
  'Environmental Hazards',
  'Street Lighting Issues',
  'Other'
];

const STATUSES = ['reported', 'validated', 'in-progress', 'resolved'];
const URGENCY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Lists State
  const [flaggedMedia, setFlaggedMedia] = useState([]);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);

  // Modals Override State
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [overrideCategory, setOverrideCategory] = useState('');
  const [overrideSeverity, setOverrideSeverity] = useState(50);
  const [overrideUrgency, setOverrideUrgency] = useState('Medium');
  const [overrideImpact, setOverrideImpact] = useState(50);
  const [overrideStatus, setOverrideStatus] = useState('reported');
  const [openOverrideDialog, setOpenOverrideDialog] = useState(false);

  // Modals User Edit State
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRole, setEditRole] = useState('citizen');
  const [editRep, setEditRep] = useState(0);
  const [editPoints, setEditPoints] = useState(0);
  const [openUserDialog, setOpenUserDialog] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 0) {
        const res = await adminService.getFlaggedMedia();
        if (res.success) setFlaggedMedia(res.data);
      } else if (activeTab === 1) {
        const res = await issueService.getIssues();
        if (res.success) setIssues(res.data);
      } else if (activeTab === 2) {
        const res = await adminService.getUsers();
        if (res.success) setUsers(res.data);
      }
    } catch (err) {
      console.error('Error loading admin panel lists:', err.message);
      setError('Failed to fetch admin controls records. Verify administrative access.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // 1. Moderate media flag
  const handleReviewMedia = async (mediaId, approve) => {
    setSuccessMsg('');
    try {
      const res = await adminService.reviewMedia(mediaId, approve);
      if (res.success) {
        setSuccessMsg(res.message);
        // Reload list
        const updated = flaggedMedia.filter(item => item._id !== mediaId);
        setFlaggedMedia(updated);
      }
    } catch (err) {
      setError('Flag clearing action failed.');
    }
  };

  // 2. Open override modal
  const handleOpenOverride = (issue) => {
    setSelectedIssue(issue);
    setOverrideCategory(issue.category);
    setOverrideSeverity(issue.severityScore);
    setOverrideUrgency(issue.urgencyLevel);
    setOverrideImpact(issue.impactScore);
    setOverrideStatus(issue.status);
    setOpenOverrideDialog(true);
  };

  const handleOverrideSubmit = async () => {
    if (!selectedIssue) return;
    setSuccessMsg('');
    try {
      const res = await adminService.overrideIssueAI(selectedIssue._id, {
        category: overrideCategory,
        severityScore: overrideSeverity,
        urgencyLevel: overrideUrgency,
        impactScore: overrideImpact,
        status: overrideStatus
      });
      if (res.success) {
        setSuccessMsg('Issue AI properties overridden successfully!');
        setOpenOverrideDialog(false);
        // Update local issues list
        const updated = issues.map(iss => (iss._id === selectedIssue._id ? res.data : iss));
        setIssues(updated);
      }
    } catch (err) {
      setError('AI classification override failed.');
    }
  };

  // 3. Open user edit modal
  const handleOpenUserEdit = (userItem) => {
    setSelectedUser(userItem);
    setEditRole(userItem.role);
    setEditRep(userItem.reputationScore);
    setEditPoints(userItem.points);
    setOpenUserDialog(true);
  };

  const handleUserEditSubmit = async () => {
    if (!selectedUser) return;
    setSuccessMsg('');
    try {
      const res = await adminService.updateUser(selectedUser._id, {
        role: editRole,
        reputationScore: editRep,
        points: editPoints
      });
      if (res.success) {
        setSuccessMsg(`User ${selectedUser.name} updated successfully.`);
        setOpenUserDialog(false);
        // Update local users list
        const updated = users.map(u => (u._id === selectedUser._id ? res.data : u));
        setUsers(updated);
      }
    } catch (err) {
      setError('User role update failed.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Page Header */}
      <Box display="flex" alignItems="center" gap={1.5} mb={4}>
        <AdminPanelSettings color="primary" sx={{ fontSize: 38 }} />
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Admin Panel Console
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Override AI predictions, moderate dispute submissions, and manage user parameters
          </Typography>
        </Box>
      </Box>

      {/* Notifications */}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tabs Layout */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="admin-dashboard-tabs">
          <Tab icon={<Flag />} iconPosition="start" label="Flagged Media Queue" />
          <Tab icon={<ListAlt />} iconPosition="start" label="AI Classifications Override" />
          <Tab icon={<People />} iconPosition="start" label="User Registry" />
        </Tabs>
      </Box>

      {/* Tab Contents */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Box>
          {/* Tab 0: Flagged Media Moderation */}
          {activeTab === 0 && (
            <Box>
              {flaggedMedia.length === 0 ? (
                <Typography variant="body1" color="textSecondary" align="center" py={6}>
                  Zero flagged media evidence queue. All items clean.
                </Typography>
              ) : (
                <Grid container spacing={3}>
                  {flaggedMedia.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={getMediaUrl(item.mediaUrl)}
                            alt="flagged content"
                            style={{ width: '100%', height: 180, objectFit: 'cover' }}
                          />
                          <Chip
                            label={item.aiRelevance}
                            size="small"
                            color="error"
                            sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 700 }}
                          />
                        </Box>
                        <CardContent sx={{ p: 3, flexGrow: 1 }}>
                          <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                            Issue context: {item.issue?.title || 'Unknown Issue'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" display="block" mb={2}>
                            Uploader: {item.uploadedBy?.name || 'Unknown'} ({item.uploadedBy?.email})
                          </Typography>
                          <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
                          <Typography variant="caption" color="error" fontWeight={700} display="block" gutterBottom>
                            AI FLAG EXPLANATION:
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                            "{item.aiExplanation || 'Flagged for irrelevance.'}"
                          </Typography>
                        </CardContent>
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />
                        <Box display="flex" justifyContent="space-between" px={3} py={2} bgcolor="rgba(0,0,0,0.05)">
                          <Button
                            size="small"
                            color="success"
                            variant="outlined"
                            startIcon={<CheckCircle />}
                            onClick={() => handleReviewMedia(item._id, true)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={() => handleReviewMedia(item._id, false)}
                          >
                            Reject
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Tab 1: AI Override Console */}
          {activeTab === 1 && (
            <Grid container spacing={2}>
              {issues.map((iss) => (
                <Grid item xs={12} key={iss._id}>
                  <Card sx={{ p: 1 }}>
                    <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {iss.title}
                        </Typography>
                        <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                          <Chip label={iss.category} size="small" variant="outlined" />
                          <Chip label={`Severity: ${iss.severityScore}`} size="small" />
                          <Chip label={`Urgency: ${iss.urgencyLevel}`} size="small" color="secondary" />
                          <Chip label={iss.status.toUpperCase()} size="small" color="primary" />
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleOpenOverride(iss)}
                      >
                        Override AI Parameters
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Tab 2: User management console */}
          {activeTab === 2 && (
            <Card>
              <CardContent sx={{ p: 0 }}>
                <List sx={{ p: 0 }}>
                  {users.map((u, idx) => (
                    <React.Fragment key={u._id}>
                      <ListItem sx={{ py: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: u.role === 'admin' ? 'error.main' : 'primary.main', width: 36, height: 36 }}>
                            {u.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>
                              {u.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" display="block">
                              {u.email}
                            </Typography>
                            <Box display="flex" gap={1} mt={0.5}>
                              <Chip label={u.role.toUpperCase()} size="small" color={u.role === 'admin' ? 'error' : 'default'} sx={{ height: 16, fontSize: 9 }} />
                              <Typography variant="caption" color="textSecondary">
                                Points: {u.points} • Rep: {u.reputationScore}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleOpenUserEdit(u)}
                        >
                          Modify
                        </Button>
                      </ListItem>
                      {idx < users.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* AI Parameter Override Dialog */}
      <Dialog
        open={openOverrideDialog}
        onClose={() => setOpenOverrideDialog(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 4 } },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome color="primary" />
          <Typography variant="h6" fontWeight={800}>
            Override Classification
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
            <TextField
              select
              fullWidth
              label="Civic Category"
              value={overrideCategory}
              onChange={(e) => setOverrideCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>

            <TextField
              type="number"
              fullWidth
              label="Severity Score (1-100)"
              value={overrideSeverity}
              onChange={(e) => setOverrideSeverity(e.target.value)}
              slotProps={{ htmlInput: { min: 1, max: 100 } }}
            />

            <TextField
              select
              fullWidth
              label="Urgency Level"
              value={overrideUrgency}
              onChange={(e) => setOverrideUrgency(e.target.value)}
            >
              {URGENCY_LEVELS.map(u => (
                <MenuItem key={u} value={u}>{u}</MenuItem>
              ))}
            </TextField>

            <TextField
              type="number"
              fullWidth
              label="Impact Score (1-100)"
              value={overrideImpact}
              onChange={(e) => setOverrideImpact(e.target.value)}
              slotProps={{ htmlInput: { min: 1, max: 100 } }}
            />

            <TextField
              select
              fullWidth
              label="Status"
              value={overrideStatus}
              onChange={(e) => setOverrideStatus(e.target.value)}
            >
              {STATUSES.map(st => (
                <MenuItem key={st} value={st}>{st.toUpperCase()}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenOverrideDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleOverrideSubmit}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* User Details Adjustments Dialog */}
      <Dialog
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 4 } },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <People color="primary" />
          <Typography variant="h6" fontWeight={800}>
            Modify User Parameters
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
            <TextField
              select
              fullWidth
              label="Security Role"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
            >
              <MenuItem value="citizen">Citizen</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
            </TextField>

            <TextField
              type="number"
              fullWidth
              label="Reputation Score"
              value={editRep}
              onChange={(e) => setEditRep(e.target.value)}
            />

            <TextField
              type="number"
              fullWidth
              label="Gamified Points"
              value={editPoints}
              onChange={(e) => setEditPoints(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUserEditSubmit}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
