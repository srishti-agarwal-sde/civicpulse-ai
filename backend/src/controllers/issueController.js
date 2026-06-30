const Issue = require("../models/Issue");
const IssueMedia = require("../models/IssueMedia");
const User = require("../models/User");
const geminiService = require("../services/geminiService");
const storageService = require("../services/storageService");
const reputationService = require("../services/reputationService");

// Helper to calculate distance in meters between two points
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

function getSearchPattern(search) {
  let pattern = search;
  const synonyms = [
    ["bangalore", "bengaluru"],
    ["mumbai", "bombay"],
    ["chennai", "madras"],
    ["kolkata", "calcutta"],
    ["mysuru", "mysore"],
    ["mangaluru", "mangalore"],
    ["kochi", "cochin"],
    ["puducherry", "pondicherry"],
    ["thiruvananthapuram", "trivandrum"],
    ["varanasi", "benares"],
    ["pune", "poona"],
    ["gurgaon", "gurugram"],
  ];

  for (const pair of synonyms) {
    const esc0 = pair[0].replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const esc1 = pair[1].replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

    const regex0 = new RegExp(esc0, "i");
    const regex1 = new RegExp(esc1, "i");
    if (regex0.test(search) || regex1.test(search)) {
      pattern = pattern.replace(new RegExp(esc0, "gi"), `(${pair[0]}|${pair[1]})`);
      pattern = pattern.replace(new RegExp(esc1, "gi"), `(${pair[0]}|${pair[1]})`);
    }
  }
  return pattern;
}

// @desc    Check for duplicate issues nearby
// @route   GET /api/issues/check-duplicate
// @access  Private
exports.checkDuplicate = async (req, res) => {
  try {
    const { lat, lng, category, description } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude are required",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Find issues within 500m radius using MongoDB GeoSpatial Query
    const nearbyIssues = await Issue.find({
      status: { $ne: "resolved" }, // Only search active issues
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 500, // 500 meters
        },
      },
    }).populate("reporter", "name reputationScore");

    // Filter and score matches
    const results = nearbyIssues
      .map((issue) => {
        const issueLat = issue.location.coordinates[1];
        const issueLng = issue.location.coordinates[0];
        const distance = Math.round(
          getDistanceInMeters(latitude, longitude, issueLat, issueLng),
        );

        // Compute simple similarity score (0 to 1)
        let similarityScore = 0;
        if (issue.category === category) similarityScore += 0.4;

        // Keyword matching
        if (description && issue.description) {
          const words1 = description
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 3);
          const words2 = issue.description
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 3);
          const intersection = words1.filter((w) => words2.includes(w));
          const matchRatio = intersection.length / Math.max(words1.length, 1);
          similarityScore += matchRatio * 0.6;
        }

        return {
          issue,
          distance, // in meters
          similarityScore: Math.min(similarityScore, 1.0),
        };
      })
      .sort((a, b) => b.similarityScore - a.similarityScore);

    res.json({
      success: true,
      count: results.length,
      duplicates: results,
    });
  } catch (error) {
    console.error("Check duplicate error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new civic issue report
// @route   POST /api/issues
// @access  Private
exports.createIssue = async (req, res) => {
  try {
    console.log("Create issue request body:", req.body);
    const { title, description, category, lat, lng, address } = req.body;

    if (!title || !description || !lat || !lng || !address) {
      return res.status(400).json({
        success: false,
        message: "All text fields, address and coordinates are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Issue media attachment is required",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // 1. Upload media file
    const mediaUrl = await storageService.uploadFile(req.file);

    // 2. Trigger Gemini AI analysis
    const aiAnalysis = await geminiService.analyzeIssue(description, category);

    // 3. Save issue in database
    const issue = await Issue.create({
      title,
      description,
      category: aiAnalysis.category || category || "Other",
      address,
      reporter: req.user.id,
      location: {
        type: "Point",
        coordinates: [longitude, latitude], // Longitude first in GeoJSON
      },
      severityScore: aiAnalysis.severityScore || 50,
      urgencyLevel: aiAnalysis.urgencyLevel || "Medium",
      impactScore: aiAnalysis.impactScore || 50,
      aiSummary: aiAnalysis.aiSummary || "Report analyzed.",
      recommendedAction: aiAnalysis.recommendedAction || "Schedule dispatch.",
      confidence: aiAnalysis.confidence || 0.9,
    });

    // 4. Save media associated with issue
    const mediaType = req.file.mimetype.startsWith("video/")
      ? "video"
      : "image";
    await IssueMedia.create({
      issue: issue._id,
      uploadedBy: req.user.id,
      mediaUrl,
      mediaType,
      aiRelevance: "Relevant",
      aiConfidence: 1.0,
      aiExplanation: "Primary issue submission media.",
    });

    // 5. Update user report statistics and reputation points
    const user = await User.findById(req.user.id);
    user.reportCount += 1;
    await user.save();

    await reputationService.awardPoints(
      req.user.id,
      20,
      10,
      "Submitting a new civic issue report",
    );

    res.status(201).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    console.error("Create issue error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all issues with filters
// @route   GET /api/issues
// @access  Public
exports.getIssues = async (req, res) => {
  try {
    const { category, severity, status, search } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (severity) {
      if (severity === "Critical") query.severityScore = { $gte: 80 };
      else if (severity === "High") query.severityScore = { $gte: 60, $lt: 80 };
      else if (severity === "Medium")
        query.severityScore = { $gte: 40, $lt: 60 };
      else if (severity === "Low") query.severityScore = { $lt: 40 };
    }

    if (search) {
      const searchPattern = getSearchPattern(search);
      query.$or = [
        { title: { $regex: searchPattern, $options: "i" } },
        { description: { $regex: searchPattern, $options: "i" } },
        { address: { $regex: searchPattern, $options: "i" } },
      ];
    }

    const issues = await Issue.find(query)
      .populate("reporter", "name reputationScore points")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    console.error("Get issues error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get details of an issue (including comments and evidence)
// @route   GET /api/issues/:id
// @access  Public
exports.getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate(
      "reporter",
      "name reputationScore points role",
    );

    if (!issue) {
      return res
        .status(404)
        .json({ success: false, message: "Issue not found" });
    }

    // Get additional media items
    const media = await IssueMedia.find({ issue: issue._id, flagged: false });

    res.json({
      success: true,
      data: {
        issue,
        media,
      },
    });
  } catch (error) {
    console.error("Get issue details error:", error.message);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Issue not found" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload additional evidence to existing issue
// @route   POST /api/issues/:id/evidence
// @access  Private
exports.addEvidence = async (req, res) => {
  try {
    const { explanation } = req.body;
    const issueId = req.params.id;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Media attachment file is required" });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res
        .status(404)
        .json({ success: false, message: "Issue not found" });
    }

    // 1. Upload media to storage
    const mediaUrl = await storageService.uploadFile(req.file);

    // 2. Perform Gemini AI relevance verification
    const mediaDesc = explanation || `Evidence image for ${issue.category}`;
    const check = await geminiService.verifyMediaRelevance(
      issue.description,
      issue.category,
      mediaDesc,
    );

    // 3. Save file entry in DB
    const mediaType = req.file.mimetype.startsWith("video/")
      ? "video"
      : "image";
    const issueMedia = await IssueMedia.create({
      issue: issueId,
      uploadedBy: req.user.id,
      mediaUrl,
      mediaType,
      aiRelevance: check.relevance || "Possibly Relevant",
      aiConfidence: check.confidence || 0.8,
      aiExplanation: check.explanation || "Analyzed.",
      flagged: check.relevance === "Unrelated", // Auto-flag if AI thinks it's unrelated for admin review
    });

    // 4. Award points if relevant, notify if flagged
    if (check.relevance !== "Unrelated") {
      await reputationService.awardPoints(
        req.user.id,
        10,
        5,
        "Submitting valid issue evidence",
      );
    } else {
      // Create system warning notification for user
      const User = require("../models/User"); // ensure loaded
      await reputationService.awardPoints(
        req.user.id,
        2,
        1,
        "Submitting extra evidence (Pending AI verification)",
      );
    }

    res.status(201).json({
      success: true,
      data: issueMedia,
      relevanceStatus: check.relevance,
      explanation: check.explanation,
    });
  } catch (error) {
    console.error("Add evidence error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get address suggestions via Google Places (fallback: Nominatim)
// @route   GET /api/issues/address-suggestions
// @access  Private
exports.getAddressSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 3) {
      return res.json({ success: true, data: [] });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const https = require('https');

    const httpsGet = (url) => {
      return new Promise((resolve, reject) => {
        const options = {
          headers: { 'User-Agent': 'CivicPulseAI-Hackathon' }
        };
        https.get(url, options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
          });
        }).on('error', (err) => { reject(err); });
      });
    };

    if (apiKey) {
      // 1. Google Places Autocomplete API proxy query
      const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q)}&key=${apiKey}&components=country:in`;
      const result = await httpsGet(googleUrl);

      if (result.status === 'OK' && result.predictions) {
        const suggestions = result.predictions.map(pred => ({
          id: pred.place_id,
          title: pred.structured_formatting ? pred.structured_formatting.main_text : pred.description.split(',')[0],
          subtitle: pred.structured_formatting ? pred.structured_formatting.secondary_text : pred.description.split(',').slice(1).join(',').trim(),
          source: 'google'
        }));
        return res.json({ success: true, data: suggestions });
      } else {
        console.warn('Google Places API status warning:', result.status, result.error_message);
      }
    }

    // 2. Fallback: OpenStreetMap Nominatim API query
    const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;
    const data = await httpsGet(osmUrl);
    
    const suggestions = (data || []).map(item => {
      const addr = item.address || {};
      const title = item.name || addr.residential || addr.building || addr.amenity || addr.road || item.display_name.split(',')[0];
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

      const subtitle = subtitleParts.filter(part => part && part !== title).join(', ');

      return {
        id: item.place_id || item.osm_id,
        title,
        subtitle,
        source: 'nominatim',
        lat: item.lat,
        lon: item.lon
      };
    });

    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Error fetching address suggestions:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Google Places detail coordinates
// @route   GET /api/issues/place-details
// @access  Private
exports.getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.query;
    if (!placeId) {
      return res.status(400).json({ success: false, message: 'Place ID is required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ success: false, message: 'Google Places API is not configured on the backend' });
    }

    const https = require('https');
    const httpsGet = (url) => {
      return new Promise((resolve, reject) => {
        https.get(url, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
          });
        }).on('error', (err) => { reject(err); });
      });
    };

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=geometry&key=${apiKey}`;
    const result = await httpsGet(detailsUrl);

    if (result.status === 'OK' && result.result && result.result.geometry) {
      const loc = result.result.geometry.location;
      return res.json({
        success: true,
        data: {
          lat: loc.lat,
          lng: loc.lng
        }
      });
    }

    res.status(400).json({ success: false, message: 'Failed to retrieve place details coordinates.' });
  } catch (error) {
    console.error('Error fetching place details:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
