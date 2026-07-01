# CivicPulse AI

🚀 **Live Production URL:** [https://civicpulse-ai-219290421637.us-central1.run.app/dashboard](https://civicpulse-ai-219290421637.us-central1.run.app/dashboard)

> "Measuring the health of communities through citizen-powered intelligence."

CivicPulse AI is an AI-powered Civic Intelligence Platform designed to help local communities detect, validate, prioritize, and resolve civic infrastructure hazards and municipal issues before they escalate into crises.

The platform integrates geospatial maps, citizen reporting consensus mechanisms, media evidence relevance checks, Google AI Studio's Gemini models, and gamification badge reward networks.

---

## Technical Architecture

```
                                  +-----------------------+
                                  |   React Web App       |
                                  |   (Vite + MUI)        |
                                  +-----------+-----------+
                                              |
                                     JSON REST APIs + JWT
                                              v
+------------------+              +-----------+-----------+              +------------------------+
|  Gemini AI API   | <==========> |    Node.js Backend    | <==========> |   MongoDB Atlas        |
|  (AI Studio)     |   Structured |    (Express MVC)      |  Geospatial  |   (2dsphere Index)     |
+------------------+   JSON       +-----------+-----------+   Queries    +------------------------+
                                              |
                                         File Uploads
                                              v
                                  +-----------+-----------+
                                  |   GCS Bucket          |
                                  |   (Local Fallback)    |
                                  +-----------------------+
```

---

## Key Features

1. **AI-Powered Incident Extraction:** submits issue images/videos and descriptions; Gemini automatically classifies categories, severity level (1-100), urgency level, community impact (1-100), and outputs recommended municipal actions.
2. **Duplicate Proximity Check:** Runs `$near` query within a 500m radius of new report coordinates, matching category/description details. Prompts users to upvote or confirm the existing report rather than duplicating.
3. **Consensus Validation Engine:** Citizen validations (confirmations, upvotes, resolve votes) feed reputation points. Consensus resolves reports automatically when threshold votes are hit.
4. **AI-Verified Evidence:** When users upload additional photos/videos, Gemini verifies matching context with the original issue description, auto-flagging unrelated uploads for moderator review.
5. **Gamification Leaderboard:** Score standing tables showing total reports, validations cast, reputation levels, and unlocked achievement badges.
6. **Civic Health score:** Dynamically calculated metric factoring resolution rates, pending critical threats count, and overall citizen participation.

---

## Environment Setup

Create a `.env` file in the `backend` directory based on the `.env.example` template:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/civicpulse
JWT_SECRET=supersecretjwtkey123456
GEMINI_API_KEY=AIzaSy... (Get key from Google AI Studio)
GCS_BUCKET_NAME=your-gcs-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=path-to-service-account-key.json
```

> [!NOTE]
> **Graceful Fallbacks:** If `GEMINI_API_KEY` is missing or set to placeholder, the server automatically boots in a mock fallback mode, generating realistic analysis data and verification results locally. If `GCS_BUCKET_NAME` is missing, uploads will store in the local server `/uploads` directory.

---

## Quick Start (Local Development)

### 1. Boot Backend:
```bash
cd backend
npm install
npm run dev
```

### 2. Boot Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open browser at `http://localhost:5173`. Register a user with role **Administrator** to access moderator tabs.

---

## API Specifications

### Authentication Routes

#### `POST /api/auth/register`
Creates user profile.
* **Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword",
    "role": "citizen"
  }
  ```
* **Response:** User data with JWT token.

#### `POST /api/auth/login`
Authenticates credentials.
* **Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword"
  }
  ```
* **Response:** User profile metadata and JWT authorization token.

---

### Incident & Evidence Routes

#### `POST /api/issues` (Auth Required)
Submits a new civic report. Send parameters as `multipart/form-data`.
* **Form Parameters:**
  - `title`: String
  - `description`: String
  - `category`: String
  - `address`: String
  - `lat`: Number
  - `lng`: Number
  - `media`: File Attachment (image/video)
* **Response (AI Generated):**
  ```json
  {
    "success": true,
    "data": {
      "title": "...",
      "severityScore": 65,
      "urgencyLevel": "High",
      "aiSummary": "...",
      "recommendedAction": "..."
    }
  }
  ```

#### `GET /api/issues/check-duplicate` (Auth Required)
Checks proximity parameters before submission.
* **Query Parameters:** `lat`, `lng`, `category`, `description`
* **Response:** Array of nearby issues with distance in meters and similarity scores.

#### `POST /api/issues/:id/evidence` (Auth Required)
Upload additional file attachment.
* **Parameters:** `media` (File), `explanation` (Text)
* **Response:** Media details with AI relevance assessment (`Relevant`, `Possibly Relevant`, `Unrelated`).

---

### Consensus & Gamification Routes

#### `POST /api/validation/:id/confirm` (Auth Required)
Confirm incident existence. Awards validator +10 points, reporter +15 points.

#### `POST /api/validation/:id/upvote` (Auth Required)
Upvote priority. Awards +5 points.

#### `POST /api/validation/:id/resolve` (Auth Required)
Mark resolved (consensus at 3 votes or immediate admin resolve). Awards reporter +50 points.

---

## Google Cloud Platform (GCP) Deployment

### 1. Deploy Express Backend to Google Cloud Run
Build the container and deploy to Cloud Run:
```bash
cd backend
gcloud builds submit --tag gcr.io/your-project-id/civicpulse-backend
gcloud run deploy civicpulse-backend --image gcr.io/your-project-id/civicpulse-backend --platform managed --allow-unauthenticated
```
Update server environment variables (`GEMINI_API_KEY`, `MONGODB_URI`) in the Cloud Run Console.

### 2. Deploy React Frontend to Firebase Hosting
Build static files and deploy:
```bash
cd frontend
npm run build
firebase init hosting
# Select build directory: dist
# Select Configure as single page app: Yes
firebase deploy --only hosting
```
