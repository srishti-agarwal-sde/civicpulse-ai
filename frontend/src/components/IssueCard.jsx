import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  CalendarMonth,
  LocationOn,
  ThumbUp,
  HowToReg,
  ArrowForward,
} from '@mui/icons-material';

const getSeverityDetails = (score) => {
  if (score >= 80) return { label: 'Critical', color: 'error', value: score };
  if (score >= 60) return { label: 'High', color: 'secondary', value: score };
  if (score >= 40) return { label: 'Medium', color: 'warning', value: score };
  return { label: 'Low', color: 'success', value: score };
};

const getStatusColor = (status) => {
  switch (status) {
    case 'resolved': return 'success';
    case 'in-progress': return 'info';
    case 'validated': return 'primary';
    default: return 'default';
  }
};

const IssueCard = ({ issue }) => {
  const severity = getSeverityDetails(issue.severityScore);
  const statusColor = getStatusColor(issue.status);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Chips Row */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Chip label={issue.category} size="small" variant="outlined" color="primary" />
          <Box display="flex" gap={0.5}>
            <Chip
              label={issue.status.toUpperCase()}
              size="small"
              color={statusColor}
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label={`${severity.label} (${severity.value})`}
              size="small"
              color={severity.color}
              sx={{ fontWeight: 700 }}
            />
          </Box>
        </Box>

        {/* Title */}
        <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
          {issue.title}
        </Typography>

        {/* Description Snippet */}
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{
            mb: 2,
            height: 40,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {issue.description}
        </Typography>

        {/* Info Grid */}
        <Box display="flex" flexDirection="column" gap={1} mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationOn sx={{ color: 'text.secondary', fontSize: 16 }} />
            <Typography variant="caption" color="textSecondary" noWrap>
              {issue.address}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarMonth sx={{ color: 'text.secondary', fontSize: 16 }} />
            <Typography variant="caption" color="textSecondary">
              {new Date(issue.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        {/* Severity Progress indicator bar */}
        <Box sx={{ mt: 1 }}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="textSecondary">Severity Threat Level</Typography>
            <Typography variant="caption" color={`${severity.color}.main`} fontWeight={700}>
              {issue.severityScore}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={issue.severityScore}
            color={severity.color}
            sx={{ borderRadius: 2, height: 6 }}
          />
        </Box>
      </CardContent>

      {/* Footer / actions */}
      <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'space-between' }}>
        <Box display="flex" gap={2}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <ThumbUp sx={{ color: 'primary.main', fontSize: 16 }} />
            <Typography variant="caption" fontWeight={700}>
              {issue.upvotes}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <HowToReg sx={{ color: 'success.main', fontSize: 16 }} />
            <Typography variant="caption" fontWeight={700}>
              {issue.confirmations}
            </Typography>
          </Box>
        </Box>

        <Button
          component={Link}
          to={`/issues/${issue._id}`}
          size="small"
          endIcon={<ArrowForward />}
          variant="text"
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default IssueCard;
