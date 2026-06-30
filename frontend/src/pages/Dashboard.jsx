import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import issueService from '../services/issueService';
import MetricCard from '../components/MetricCard';
import IssueCard from '../components/IssueCard';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  AddCircle,
  Campaign,
  CheckCircle,
  ErrorOutline,
  TrendingUp,
  AutoAwesome,
  EmojiEvents,
  InfoOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@mui/icons-material';

const CHART_COLORS = ['#00e5ff', '#ff6d00', '#00e676', '#2979ff', '#ffea00', '#ff1744', '#b388ff', '#eceff1'];

const getHealthColor = (rating) => {
  switch (rating) {
    case 'Excellent': return '#00e676';
    case 'Good': return '#00e5ff';
    case 'Needs Attention': return '#ffea00';
    default: return '#ff1744';
  }
};

const getInsightIcon = (type) => {
  switch (type) {
    case 'warning': return <WarningOutlined sx={{ color: '#ffea00' }} />;
    case 'success': return <CheckCircleOutlined sx={{ color: '#00e676' }} />;
    default: return <InfoOutlined sx={{ color: '#00e5ff' }} />;
  }
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const statsRes = await issueService.getDashboardStats();
        if (statsRes.success) {
          setStats(statsRes.data);
        }

        const issuesRes = await issueService.getIssues();
        if (issuesRes.success) {
          // Show top 3 recent issues
          setRecentIssues(issuesRes.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const { summary = {}, categories = [], topContributors = [], aiInsights = [] } = stats || {};

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Top Banner */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={4} gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={900} gutterBottom>
            Civic Health Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Real-time community health monitoring powered by AI analysis and citizen engagement
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/report"
          variant="contained"
          size="large"
          startIcon={<AddCircle />}
        >
          Report New Issue
        </Button>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Incidents"
            value={summary.activeIssues || 0}
            icon={<Campaign sx={{ fontSize: 24 }} />}
            color="primary.main"
            subtitle="Needs community validation"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Resolved Incidents"
            value={summary.resolvedIssues || 0}
            icon={<CheckCircle sx={{ fontSize: 24 }} />}
            color="success.main"
            subtitle="Fixed by city / citizen votes"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Critical Hazards"
            value={summary.criticalIssues || 0}
            icon={<ErrorOutline sx={{ fontSize: 24 }} />}
            color="error.main"
            subtitle="Immediate priority level"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Citizen Participations"
            value={summary.participationRate || 0}
            icon={<TrendingUp sx={{ fontSize: 24 }} />}
            color="secondary.main"
            subtitle="Total comments and validations"
          />
        </Grid>
      </Grid>

      {/* Health Score Panel & AI Insights */}
      <Grid container spacing={3} mb={4}>
        {/* Civic Health Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 1 }}>
            <CardContent textalign="center" sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" fontWeight={700} color="textSecondary" gutterBottom>
                Civic Health Score
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  my: 3,
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  border: `8px solid ${getHealthColor(summary.civicHealthRating)}`,
                  boxShadow: `0 0 25px ${getHealthColor(summary.civicHealthRating)}50`,
                }}
              >
                <Typography variant="h3" fontWeight={900}>
                  {summary.civicHealthScore || 0}
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ color: getHealthColor(summary.civicHealthRating) }}>
                {summary.civicHealthRating || 'Good'}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Weight calculation based on resolution ratios, active hazards, and community consensus inputs.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Predictive Insights */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AutoAwesome color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  AI Predictive Insights (Gemini Model)
                </Typography>
              </Box>
              <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

              {aiInsights.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  Analyzing current database trends. Check back shortly for insights.
                </Typography>
              ) : (
                <List>
                  {aiInsights.map((insight, idx) => (
                    <ListItem
                      key={idx}
                      sx={{
                        mb: 1.5,
                        borderRadius: 3,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                        borderLeft: `5px solid ${insight.type === 'warning' ? '#ffea00' : insight.type === 'success' ? '#00e676' : '#00e5ff'}`,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {getInsightIcon(insight.type)}
                      </ListItemIcon>
                      <ListItemText
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                        primary={
                          <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
                            <Typography variant="body2" fontWeight={700}>
                              {insight.title}
                            </Typography>
                            <Chip
                              label={insight.affectedArea}
                              size="small"
                              sx={{ fontSize: 10, height: 18 }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box mt={0.5}>
                            <Typography variant="caption" color="textSecondary" display="block">
                              {insight.description}
                            </Typography>
                            <Typography variant="caption" color="primary" fontWeight={600} display="block" mt={0.5}>
                              Recommended Action: {insight.actionPlan}
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
      </Grid>

      {/* Recharts Analytics Displays */}
      <Grid container spacing={3} mb={4}>
        {/* Category breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Incident Categories
              </Typography>
              <Box height={280}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Resolved vs Active statuses */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Resolution Ratio by Category
              </Typography>
              <Box height={280}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categories}>
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <ChartTooltip />
                    <Legend />
                    <Bar dataKey="active" name="Active" fill="#ff6d00" stackId="a" />
                    <Bar dataKey="resolved" name="Resolved" fill="#00e676" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Issues & Leaders Grid */}
      <Grid container spacing={3}>
        {/* Recent Issues list */}
        <Grid item xs={12} lg={8}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={700}>
              Recent Community Incidents
            </Typography>
            <Button component={Link} to="/map" size="small">
              View Map Registry
            </Button>
          </Box>
          {recentIssues.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  No issues reported yet. Be the first to report!
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {recentIssues.map((issue) => (
                <Grid item xs={12} sm={6} md={4} key={issue._id}>
                  <IssueCard issue={issue} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Top Contributors leaderboard card */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <EmojiEvents color="secondary" />
                <Typography variant="h6" fontWeight={700}>
                  Top Community Contributors
                </Typography>
              </Box>
              <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

              <List>
                {topContributors.map((contrib, idx) => (
                  <React.Fragment key={contrib._id}>
                    <ListItem sx={{ py: 1.5 }}>
                      <Box display="flex" alignItems="center" width="100%" gap={2}>
                        <Typography variant="body2" fontWeight={800} color="textSecondary" sx={{ width: 20 }}>
                          #{idx + 1}
                        </Typography>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                          {contrib.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box flexGrow={1}>
                          <Typography variant="body2" fontWeight={700}>
                            {contrib.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {contrib.reportCount} reports • {contrib.validationCount} validations
                          </Typography>
                        </Box>
                        <Chip
                          label={`${contrib.reputationScore} Rep`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>
                    </ListItem>
                    {idx < topContributors.length - 1 && <Divider component="li" sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />}
                  </React.Fragment>
                ))}
              </List>
              <Button component={Link} to="/leaderboard" fullWidth variant="outlined" sx={{ mt: 1 }}>
                View Full Standings
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
