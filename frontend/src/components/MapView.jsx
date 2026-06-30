import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Button, Chip } from '@mui/material';
import { ArrowForward, LocationOn } from '@mui/icons-material';
import 'leaflet/dist/leaflet.css';

// SVG Color Pin Generator based on Severity Score
const createSeverityIcon = (score) => {
  let color = '#00e676'; // Green = Low
  if (score >= 80) color = '#ff1744'; // Red = Critical
  else if (score >= 60) color = '#ff6d00'; // Orange = High
  else if (score >= 40) color = '#ffea00'; // Yellow = Medium

  const svgHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
      <path fill="${color}" stroke="#111" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-severity-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// Component to handle auto-recentering map when list changes or map target moves
const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

// Component to capture click events for selecting coordinates on reporting
const MapEventsHandler = ({ onClick }) => {
  useMapEvents({
    click(e) {
      if (onClick) {
        onClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
};

const MapView = ({
  issues = [],
  center = [40.7128, -74.0060], // Default center New York
  zoom = 13,
  clickToPickMode = false,
  onLocationPick = null,
  pickedLocation = null,
  height = '400px'
}) => {
  const navigate = useNavigate();

  // If clicked, place a single interactive blue marker in pick mode
  const pickIcon = L.divIcon({
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
        <path fill="#00e5ff" stroke="#000" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `,
    className: 'picked-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 36]
  });

  return (
    <Box sx={{ height, width: '100%', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeMapView center={center} zoom={zoom} />

        {clickToPickMode && onLocationPick && (
          <MapEventsHandler onClick={onLocationPick} />
        )}

        {/* Display issues markers */}
        {!clickToPickMode &&
          issues.map((issue) => {
            // Coordinate structure: [longitude, latitude] in GeoJSON
            const lng = issue.location.coordinates[0];
            const lat = issue.location.coordinates[1];
            
            return (
              <Marker
                key={issue._id}
                position={[lat, lng]}
                icon={createSeverityIcon(issue.severityScore)}
              >
                <Popup>
                  <Box sx={{ p: 0.5, maxWidth: 200 }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      {issue.title}
                    </Typography>
                    <Box display="flex" gap={0.5} mb={1}>
                      <Chip label={issue.category} size="small" sx={{ fontSize: 10, height: 18 }} />
                      <Chip
                        label={issue.status.toUpperCase()}
                        size="small"
                        color={issue.status === 'resolved' ? 'success' : 'default'}
                        sx={{ fontSize: 10, height: 18, fontWeight: 700 }}
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                      {issue.address}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth
                      endIcon={<ArrowForward sx={{ fontSize: 12 }} />}
                      onClick={() => navigate(`/issues/${issue._id}`)}
                      sx={{ py: 0.5, fontSize: 10 }}
                    >
                      Details
                    </Button>
                  </Box>
                </Popup>
              </Marker>
            );
          })}

        {/* Display picked marker if set */}
        {clickToPickMode && pickedLocation && (
          <Marker position={pickedLocation} icon={pickIcon} />
        )}
      </MapContainer>
    </Box>
  );
};

export default MapView;
