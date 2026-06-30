import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { EmojiEvents, Star, Shield, Campaign, MilitaryTech } from '@mui/icons-material';

const getBadgeIcon = (iconName) => {
  switch (iconName) {
    case 'Campaign': return <Campaign sx={{ fontSize: 16 }} />;
    case 'EmojiEvents': return <EmojiEvents sx={{ fontSize: 16 }} />;
    case 'Shield': return <Shield sx={{ fontSize: 16 }} />;
    case 'MilitaryTech': return <MilitaryTech sx={{ fontSize: 16 }} />;
    default: return <MilitaryTech sx={{ fontSize: 16 }} />;
  }
};

const getRankDecoration = (rank) => {
  if (rank === 1) return { color: '#ffd700', icon: <EmojiEvents sx={{ color: '#ffd700' }} /> }; // Gold
  if (rank === 2) return { color: '#c0c0c0', icon: <EmojiEvents sx={{ color: '#c0c0c0' }} /> }; // Silver
  if (rank === 3) return { color: '#cd7f32', icon: <EmojiEvents sx={{ color: '#cd7f32' }} /> }; // Bronze
  return null;
};

const LeaderboardTable = ({ rankings }) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={80} align="center">Rank</TableCell>
            <TableCell>User</TableCell>
            <TableCell align="center">Reputation Score</TableCell>
            <TableCell align="center">Points</TableCell>
            <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>Reports</TableCell>
            <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>Validations</TableCell>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Earned Badges</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rankings.map((row) => {
            const decoration = getRankDecoration(row.rank);
            return (
              <TableRow
                key={row._id}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  backgroundColor: decoration ? 'rgba(0, 229, 255, 0.02)' : 'inherit',
                }}
              >
                {/* Rank */}
                <TableCell align="center">
                  {decoration ? (
                    <Box display="flex" justifyContent="center" alignItems="center">
                      {decoration.icon}
                    </Box>
                  ) : (
                    <Typography variant="body2" fontWeight={700} color="textSecondary">
                      #{row.rank}
                    </Typography>
                  )}
                </TableCell>

                {/* User Info */}
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ bgcolor: row.rank <= 3 ? 'secondary.main' : 'primary.main', width: 34, height: 34 }}>
                      {row.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        {row.name}
                      </Typography>
                      {row.rank <= 3 && (
                        <Typography variant="caption" color="secondary" fontWeight={600}>
                          Top Contributor
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>

                {/* Reputation */}
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" alignItems="center" gap={0.5}>
                    <Star sx={{ color: '#ffea00', fontSize: 16 }} />
                    <Typography variant="body2" fontWeight={700}>
                      {row.reputationScore}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Points */}
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={600} color="primary">
                    {row.points}
                  </Typography>
                </TableCell>

                {/* Reports Count */}
                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Typography variant="body2">{row.reportCount}</Typography>
                </TableCell>

                {/* Validations Count */}
                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Typography variant="body2">{row.validationCount}</Typography>
                </TableCell>

                {/* Badges list */}
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {row.badges && row.badges.length > 0 ? (
                      row.badges.map((badge) => (
                        <Chip
                          key={badge._id}
                          avatar={getBadgeIcon(badge.icon)}
                          label={badge.name}
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ fontWeight: 600, fontSize: 11 }}
                        />
                      ))
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        No badges yet
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LeaderboardTable;
