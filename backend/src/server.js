require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const connectDB = async () => {
  // Config loader
  const dbConfig = require('./config/db');
  await dbConfig();
};

const Badge = require('./models/Badge');

// Seeder function for standard gamification badges
const seedBadges = async () => {
  try {
    const badgesCount = await Badge.countDocuments({});
    if (badgesCount === 0) {
      console.log('Seeding default gamification badges...');
      const defaultBadges = [
        {
          name: 'First Reporter',
          description: 'Awarded for filing your very first community report.',
          icon: 'Campaign',
          criteria: 'Submit at least 1 issue report',
          badgeKey: 'first_reporter'
        },
        {
          name: 'Community Hero',
          description: 'Awarded for submitting 10 or more active community reports.',
          icon: 'EmojiEvents',
          criteria: 'Submit at least 10 issue reports',
          badgeKey: 'community_hero'
        },
        {
          name: 'Civic Guardian',
          description: 'Awarded for validating 15 or more reported issues.',
          icon: 'Shield',
          criteria: 'Verify or confirm 15 issue reports',
          badgeKey: 'civic_guardian'
        },
        {
          name: 'Local Champion',
          description: 'Awarded to citizens who achieve a reputation score of 500 or more.',
          icon: 'MilitaryTech',
          criteria: 'Reach 500 reputation score points',
          badgeKey: 'local_champion'
        },
        {
          name: 'Truth Seeker',
          description: 'Awarded for validating 5 or more reported issues.',
          icon: 'FactCheck',
          criteria: 'Verify or confirm 5 issue reports',
          badgeKey: 'truth_seeker'
        },
        {
          name: 'Resolution Hero',
          description: 'Awarded for participating in verifying 3 or more resolved issues.',
          icon: 'CheckCircle',
          criteria: 'Help resolve or confirm resolutions for 3 issues',
          badgeKey: 'resolution_hero'
        }
      ];

      await Badge.insertMany(defaultBadges);
      console.log('Badges seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding badges:', error.message);
  }
};

const cleanExistingAddresses = async () => {
  try {
    const Issue = require('./models/Issue');
    const https = require('https');

    const httpsGet = (url) => {
      return new Promise((resolve, reject) => {
        const options = {
          headers: {
            'User-Agent': 'CivicPulseAI-Hackathon'
          }
        };
        https.get(url, options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', (err) => { reject(err); });
      });
    };
    
    const issuesToUpdate = await Issue.find({});

    if (issuesToUpdate.length > 0) {
      console.log(`Checking and backfilling addresses for ${issuesToUpdate.length} issues...`);
      for (const issue of issuesToUpdate) {
        const [lng, lat] = issue.location.coordinates;
        try {
          const data = await httpsGet(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
          );
          if (data && data.display_name) {
            const addr = data.address || {};
            const title = data.name || addr.residential || addr.building || addr.amenity || addr.road || data.display_name.split(',')[0];
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
            const fullAddr = subtitle ? `${title}, ${subtitle}` : title;

            if (issue.address !== fullAddr) {
              issue.address = fullAddr;
              await issue.save();
              console.log(`Updated issue "${issue.title}" address to: ${fullAddr}`);
            }

            // Sleep 1 second to respect Nominatim rate limit
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (err) {
          console.error(`Failed to reverse geocode coordinate [${lat}, ${lng}] for issue "${issue.title}":`, err.message);
        }
      }
    }
  } catch (error) {
    console.error('Error in cleanExistingAddresses:', error.message);
  }
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/validation', require('./routes/validationRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', message: 'CivicPulse AI backend is healthy and responding.' });
});

// Serve frontend if in production (Google Cloud Run static target folder configuration)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Start Server after DB Connection
const startServer = async () => {
  try {
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      await seedBadges();
      await cleanExistingAddresses();
    } else {
      console.warn('Database is not connected. Seeding and migration skipped on boot.');
    }
  } catch (err) {
    console.error('Database connection or seeding failed on startup:', err.message);
  }
  
  app.listen(PORT, () => {
    console.log(`CivicPulse AI Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
