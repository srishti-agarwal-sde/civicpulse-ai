import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import issueService from '../services/issueService';
import MapView from '../components/MapView';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Grid,
  Autocomplete,
} from '@mui/material';
import { MyLocation, Map, CloudUpload, Warning, Close, ThumbUp, HowToReg } from '@mui/icons-material';

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

const getAddressParts = (option) => {
  if (!option) return { title: '', subtitle: '' };
  if (typeof option === 'string') return { title: option, subtitle: '' };

  const addr = option.address || {};

  // Extract main name
  const title = option.name || addr.residential || addr.building || addr.amenity || addr.road || option.display_name.split(',')[0];

  // Extract subtitle components
  const subtitleParts = [];
  if (addr.neighbourhood || addr.suburb) subtitleParts.push(addr.neighbourhood || addr.suburb);
  if (addr.city_district) subtitleParts.push(addr.city_district);
  if (addr.city || addr.town || addr.village || addr.municipality) {
    subtitleParts.push(addr.city || addr.town || addr.village || addr.municipality);
  }
  if (addr.county || addr.district || addr.state_district) {
    subtitleParts.push(addr.county || addr.district || addr.state_district);
  }
  if (addr.state) subtitleParts.push(addr.state);
  if (addr.country) subtitleParts.push(addr.country);

  // Filter out the title name if it's duplicated in the subtitle parts
  const subtitle = subtitleParts.filter(part => part && part !== title).join(', ');

  return { title, subtitle };
};

const ReportIssue = () => {
  const navigate = useNavigate();

  // Wizard state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null); // [lat, lng]
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  // Status state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Autocomplete Suggestions State
  const [options, setOptions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Duplicate Check state
  const [duplicates, setDuplicates] = useState([]);
  const [openDuplicateDialog, setOpenDuplicateDialog] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  // Get current browser position
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      return setError('Geolocation is not supported by your browser');
    }

    setLoadingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation([latitude, longitude]);
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();
          if (data && data.display_name) {
            const { title, subtitle } = getAddressParts(data);
            setAddress(subtitle ? `${title}, ${subtitle}` : title);
          } else {
            setAddress(`Near Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (err) {
          setAddress(`Near Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        console.error('GPS fetch error:', err);
        setError('Unable to retrieve location. Please click on the map manually.');
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleMapPick = async (coords) => {
    setLocation(coords);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.display_name) {
        const { title, subtitle } = getAddressParts(data);
        setAddress(subtitle ? `${title}, ${subtitle}` : title);
      } else {
        setAddress(`Coordinates: ${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`);
      }
    } catch (err) {
      setAddress(`Coordinates: ${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`);
    }
  };

  // Fetch address options from geocoding proxy endpoint
  useEffect(() => {
    if (
      !address ||
      address.length < 3 ||
      address.startsWith('Near Coordinates:') ||
      address.startsWith('Map Marker Selection:')
    ) {
      setOptions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await issueService.getAddressSuggestions(address);
        if (res.success) {
          setOptions(res.data || []);
        }
      } catch (err) {
        console.error('Error fetching address suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 600); // 600ms debounce to limit API load

    return () => clearTimeout(timer);
  }, [address]);

  const handleAddressSelect = async (event, newValue) => {
    if (newValue) {
      if (typeof newValue === 'string') {
        setAddress(newValue);
      } else {
        const fullAddr = newValue.subtitle ? `${newValue.title}, ${newValue.subtitle}` : newValue.title;
        setAddress(fullAddr);
        
        if (newValue.source === 'google') {
          setLoadingLocation(true);
          try {
            const res = await issueService.getPlaceDetails(newValue.id);
            if (res.success && res.data) {
              setLocation([res.data.lat, res.data.lng]);
            }
          } catch (err) {
            console.error('Error fetching Google Place details:', err);
          } finally {
            setLoadingLocation(false);
          }
        } else {
          const lat = parseFloat(newValue.lat);
          const lon = parseFloat(newValue.lon);
          setLocation([lat, lon]);
        }
      }
    }
  };

  const handleAddressInputChange = (event, newInputValue) => {
    setAddress(newInputValue);
  };

  // Trigger duplicate check when coordinates or category/description change
  useEffect(() => {
    if (!location) return;

    const runDuplicateCheck = async () => {
      try {
        const res = await issueService.checkDuplicate(
          location[0],
          location[1],
          category,
          description
        );
        if (res.success && res.duplicates.length > 0) {
          // If similarity index is high, show the prompt
          const highConfidenceDups = res.duplicates.filter(d => d.similarityScore >= 0.3);
          if (highConfidenceDups.length > 0) {
            setDuplicates(highConfidenceDups);
            setOpenDuplicateDialog(true);
          }
        }
      } catch (err) {
        console.error('Duplicate checking failed:', err.message);
      }
    };

    // Debounce duplicate check slightly to avoid spamming calls
    const delayDebounce = setTimeout(() => {
      runDuplicateCheck();
    }, 800);

    return () => clearTimeout(delayDebounce);
  }, [location, category, description]);

  const handleConfirmExistingIssue = async (issueId) => {
    setOpenDuplicateDialog(false);
    setSubmitting(true);
    try {
      const res = await issueService.confirmIssue(issueId);
      if (res.success) {
        navigate(`/issues/${issueId}`);
      } else {
        setError(res.message);
        setSubmitting(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to validate existing issue');
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!title || !description || !location || !address || !mediaFile) {
      return setError('Please fill out all required fields and upload media evidence');
    }

    setError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('address', address);
    formData.append('lat', location[0]);
    formData.append('lng', location[1]);
    formData.append('media', mediaFile);

    try {
      const res = await issueService.createIssue(formData);
      if (res.success) {
        navigate(`/issues/${res.data._id}`);
      } else {
        setError(res.message || 'Report creation failed.');
        setSubmitting(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error creating issue report. Please check sizes.');
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={900} mb={1}>
        Submit Civic Report
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={4}>
        Contribute to community health by reporting issues. AI will analyze details automatically.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            {/* Step 1: Text inputs */}
            <Typography variant="h6" fontWeight={700} mb={2}>
              Issue Overview
            </Typography>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={8}>
                <TextField
                  required
                  fullWidth
                  label="Report Title"
                  placeholder="e.g. Overflowing garbage bins in community park"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
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
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="Problem Description"
                  placeholder="Provide precise details to help municipal services address this issue."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>

            {/* Step 2: Upload File */}
            <Typography variant="h6" fontWeight={700} mb={2}>
              Attach Evidence
            </Typography>
            <Box
              sx={{
                border: '2px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: 4,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                mb: 4,
                bgcolor: 'rgba(255,255,255,0.01)',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(0, 229, 255, 0.02)',
                },
              }}
              component="label"
            >
              <input type="file" accept="image/*,video/*" hidden onChange={handleFileChange} />
              <CloudUpload color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" fontWeight={600} display="block">
                Drag and drop or click to upload image/video
              </Typography>
              <Typography variant="caption" color="textSecondary">
                JPEG, PNG, WEBP or MP4 up to 50MB
              </Typography>
              {mediaFile && (
                <Typography variant="body2" color="success.main" fontWeight={700} sx={{ mt: 1.5 }}>
                  Successfully attached: {mediaFile.name}
                </Typography>
              )}
            </Box>

            {mediaPreview && (
              <Box display="flex" justifyContent="center" mb={4}>
                {mediaFile.type.startsWith('video/') ? (
                  <video src={mediaPreview} controls style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 12 }} />
                ) : (
                  <img src={mediaPreview} alt="preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 12 }} />
                )}
              </Box>
            )}

            {/* Step 3: Location Pick */}
            <Typography variant="h6" fontWeight={700} mb={2}>
              Geospatial Coordinates
            </Typography>
            <Stack direction="row" spacing={2} mb={3}>
              <Button
                variant="outlined"
                onClick={handleGetCurrentLocation}
                disabled={loadingLocation}
                startIcon={loadingLocation ? <CircularProgress size={16} /> : <MyLocation />}
              >
                Use Device GPS
              </Button>
              <Typography variant="caption" color="textSecondary" sx={{ alignSelf: 'center' }}>
                Or click on the map grid below to place a pin marker.
              </Typography>
            </Stack>

            <Box mb={3}>
              <MapView
                clickToPickMode={true}
                onLocationPick={handleMapPick}
                pickedLocation={location}
                zoom={14}
                center={location || [40.7128, -74.0060]}
                height="300px"
              />
            </Box>

            <Autocomplete
              freeSolo
              id="address-autocomplete"
              options={options}
              loading={loadingSuggestions}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return option.subtitle ? `${option.title}, ${option.subtitle}` : option.title;
              }}
              value={address}
              onChange={handleAddressSelect}
              inputValue={address}
              onInputChange={handleAddressInputChange}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={key || option.id} {...optionProps}>
                    <Box sx={{ py: 0.5, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" fontWeight={700}>
                        {option.title}
                      </Typography>
                      {option.subtitle && (
                        <Typography variant="caption" color="textSecondary" display="block">
                          {option.subtitle}
                        </Typography>
                      )}
                    </Box>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  fullWidth
                  label="Location / Nearby Address Reference"
                  placeholder="Type address (e.g. Vars Parkwood, Bangalore) or click on the map"
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingSuggestions ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                    inputLabel: { shrink: true }
                  }}
                />
              )}
              sx={{ mb: 4 }}
            />

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ px: 4 }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Report'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Duplicate Dialog Modal */}
      <Dialog
        open={openDuplicateDialog}
        onClose={() => setOpenDuplicateDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 4, p: 1 } },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning color="warning" />
            <Typography variant="h6" fontWeight={800}>
              Similar Issues Found Nearby
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenDuplicateDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Our geospatial intelligence system detected similar active issue reports within 500 meters. Upvoting or confirming an existing issue awards you validation points and resolves issues faster!
          </Typography>
          <Stack spacing={2}>
            {duplicates.map((dup) => (
              <Card
                key={dup.issue._id}
                variant="outlined"
                sx={{
                  borderColor: 'rgba(255, 109, 0, 0.3)',
                  bgcolor: 'rgba(255, 109, 0, 0.02)',
                  '&:hover': { transform: 'none', boxShadow: 'none' },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" justifyContent="space-between" mb={1} flexWrap="wrap" gap={1}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {dup.issue.title}
                    </Typography>
                    <Chip
                      label={`${dup.distance}m away`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ fontSize: 10, height: 18 }}
                    />
                  </Box>
                  <Typography variant="caption" color="textSecondary" display="block" mb={2}>
                    {dup.issue.description}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" gap={1.5}>
                      <Chip label={dup.issue.status.toUpperCase()} size="small" sx={{ fontSize: 9, height: 16 }} />
                      <Typography variant="caption" color="textSecondary">
                        Reports: {dup.issue.confirmations + 1}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      startIcon={<HowToReg />}
                      onClick={() => handleConfirmExistingIssue(dup.issue._id)}
                    >
                      Join & Confirm
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="text" onClick={() => setOpenDuplicateDialog(false)}>
            Close & Review
          </Button>
          <Button variant="contained" onClick={() => { setOpenDuplicateDialog(false); handleSubmit(); }}>
            Continue Submitting New Report
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReportIssue;
