import React, { useState, useEffect } from 'react';
import issueService from '../services/issueService';
import MapView from '../components/MapView';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import { FilterList, Search, LocationOn, Error } from '@mui/icons-material';

const CATEGORIES = [
  'All',
  'Waste Management',
  'Water Leakage',
  'Public Safety',
  'Infrastructure Damage',
  'Accessibility Issues',
  'Environmental Hazards',
  'Street Lighting Issues',
  'Other'
];

const STATUSES = ['All', 'reported', 'validated', 'in-progress', 'resolved'];
const SEVERITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];

const getSeverityColor = (score) => {
  if (score >= 80) return 'error';
  if (score >= 60) return 'secondary';
  if (score >= 40) return 'warning';
  return 'success';
};

const IssuesMap = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [severity, setSeverity] = useState('All');
  const [search, setSearch] = useState('');

  // Map focus State
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
  const [mapZoom, setMapZoom] = useState(12);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const filters = { category, status, severity, search };
      const res = await issueService.getIssues(filters);
      if (res.success) {
        setIssues(res.data);
        
        // Auto-focus map center on the first issue if results exist
        if (res.data.length > 0) {
          const firstIssue = res.data[0];
          setMapCenter([
            firstIssue.location.coordinates[1],
            firstIssue.location.coordinates[0]
          ]);
          setMapZoom(13);
        }
      }
    } catch (err) {
      console.error('Error fetching issues for map:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reload issues when filters change
  useEffect(() => {
    loadIssues();
  }, [category, status, severity]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadIssues();
  };

  const handleIssueFocus = (issue) => {
    const lat = issue.location.coordinates[1];
    const lng = issue.location.coordinates[0];
    setMapCenter([lat, lng]);
    setMapZoom(16);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Sidebar Filter Panel */}
      <Box
        sx={{
          width: { xs: '100%', md: '360px' },
          borderRight: (theme) =>
            theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          height: { xs: 'auto', md: '100%' },
          maxHeight: { xs: '400px', md: '100%' },
          overflowY: 'auto',
          p: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <FilterList color="primary" />
          <Typography variant="h6" fontWeight={800}>
            Issue Registry
          </Typography>
        </Box>

        {/* Search */}
        <Box component="form" onSubmit={handleSearchSubmit} display="flex" gap={1} mb={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search keyword or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <Search sx={{ color: 'text.secondary', fontSize: 18, mr: 0.5 }} />,
              }
            }}
          />
          <Button type="submit" variant="contained" size="small">
            Go
          </Button>
        </Box>

        {/* Filter Selection list */}
        <Box display="flex" flexDirection="column" gap={2} mb={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            size="small"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          >
            {STATUSES.map((st) => (
              <MenuItem key={st} value={st}>
                {st.toUpperCase()}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            size="small"
            label="Severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          >
            {SEVERITIES.map((sev) => (
              <MenuItem key={sev} value={sev}>
                {sev}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />

        {/* Results List */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 2 }}>
          <Typography variant="caption" color="textSecondary" display="block" mb={2}>
            Found {issues.length} matching reports
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List disablePadding>
              {issues.map((issue) => (
                <Card
                  key={issue._id}
                  onClick={() => handleIssueFocus(issue)}
                  sx={{
                    mb: 1.5,
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 229, 255, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: '16px !important' }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ flexGrow: 1, pr: 1 }} noWrap>
                        {issue.title}
                      </Typography>
                      <Chip
                        label={issue.severityScore}
                        size="small"
                        color={getSeverityColor(issue.severityScore)}
                        sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                      />
                    </Box>
                    <Box display="flex" gap={0.5} mb={1.5} flexWrap="wrap">
                      <Chip label={issue.category} size="small" variant="outlined" sx={{ height: 18, fontSize: 9 }} />
                      <Chip
                        label={issue.status.toUpperCase()}
                        size="small"
                        sx={{ height: 18, fontSize: 9, fontWeight: 600 }}
                      />
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <LocationOn sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography variant="caption" color="textSecondary" noWrap sx={{ maxWidth: 220 }}>
                        {issue.address}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </List>
          )}
        </Box>
      </Box>

      {/* Map Section */}
      <Box sx={{ flexGrow: 1, height: { xs: '400px', md: '100%' }, position: 'relative' }}>
        <MapView
          issues={issues}
          center={mapCenter}
          zoom={mapZoom}
          height="100%"
        />
      </Box>
    </Box>
  );
};

export default IssuesMap;
