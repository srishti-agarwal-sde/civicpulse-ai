# Project Description: CivicPulse AI

## Problem Statement Selected
**Community Hero - Hyperlocal Problem Solver**

Local communities face major challenges in detecting, validating, prioritizing, and resolving civic infrastructure hazards and municipal issues (such as water leakages, waste accumulation, road damage, public safety concerns, and broken street lighting) before they escalate into public safety crises. 

Traditional municipal reporting channels are often slow, lack transparency, suffer from redundant duplicate reports, and fail to engage citizens. CivicPulse AI addresses these gaps by empowering citizens to become **Community Heroes** through collaborative, hyperlocal problem-solving, structured consensus validation, and AI-driven triage.

---

## Solution Overview
**CivicPulse AI** is an AI-powered Civic Intelligence Platform designed to bridge the communication gap between citizens and local municipalities. It enables real-time issue reporting, geospatial tracking, and community validation.

The platform uses **Google AI Studio (Gemini 2.5 Flash)** to analyze reports instantly, assess hazard severity, suggest municipal actions, and audit media evidence. By utilizing MongoDB geospatial indexes, CivicPulse AI detects existing nearby issues to prevent duplicate reporting and encourage consensus. A gamified reputation network rewards citizens for validations and resolutions, while administrative consoles display predictive trends and AI-driven regional insights.

### Platform Architecture

```
                                  +-----------------------+
                                  |     React Web App     |
                                  |     (Vite + MUI)      |
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

1. **AI-Powered Incident Extraction & Triage**
   * When a user submits an issue with a description and category suggestion, the system queries the **Gemini 2.5 Flash** model. 
   * Gemini automatically categorizes the issue, determines its hazard severity score (1-100), maps it to an urgency level, calculates the community impact score (1-100), summarizes the issue in a single sentence, and outputs recommended actions for municipal crews.

2. **Geospatial Duplicate Proximity Check**
   * When a new report is drafted, the backend runs a `$near` geospatial query within a **500-meter radius** of the selected coordinates. 
   * If a matching report already exists, the platform alerts the user and prompts them to upvote or confirm the existing report rather than submitting a duplicate, keeping the database clean.

3. **Consensus Validation Engine**
   * Citizens actively participate in verifying reports. They can upvote reports to flag high urgency, confirm that an issue is real, or vote that an issue has been resolved.
   * A consensus mechanism automatically marks an issue as "Resolved" when a certain threshold of citizen votes is reached, reducing the verification burden on public officials.

4. **AI-Verified Evidence Auditing**
   * Users can upload additional media evidence (photos or videos) to existing reports.
   * Gemini analyzes the new media description alongside the original report description and category to assess relevance, auto-flagging unrelated uploads (e.g., spam, generic images) for moderator review.

5. **Gamification & Leaderboard**
   * Contributions (submitting reports, validating others' submissions, and voting on resolutions) award reputation points.
   * A public leaderboard showcases active citizens, displays achievement badges, and fosters civic participation and pride.

6. **Interactive Live Map**
   * A geospatial Leaflet-based map displays active community reports. Issues are color-coded based on category and severity, providing a visual hot-spot analysis for citizens and municipal teams.

7. **Civic Health Dashboard**
   * Tracks real-time community wellness metrics, including resolution rates, pending critical threats, and active citizen participation.
   * Gemini-driven predictive insights analyze active reports to alert city officials about escalating trends or preventative maintenance options.

---

## Technologies Used

### Frontend
* **React (v19)**: Component-based UI rendering.
* **Vite**: Ultra-fast build tool and local dev server.
* **Material-UI (MUI v6)**: Modern, professional component styling and design language.
* **Leaflet & React Leaflet**: Open-source mapping libraries for displaying geospatial markers and coordinate inputs.
* **Recharts**: Responsive charting library for displaying historical data and civic health metrics.
* **React Router DOM**: Client-side routing for navigating dashboards, maps, profiles, and reporting pages.
* **Axios**: HTTP client for API communication.

### Backend
* **Node.js & Express**: Extensible asynchronous server frameworks.
* **MongoDB Atlas & Mongoose**: NoSQL database utilized for storing reports, user profiles, and validations. Leverages geospatial `2dsphere` indexes.
* **JSON Web Tokens (JWT)**: Secure user authentication and stateless session management.
* **Multer**: Middleware for handling `multipart/form-data` file uploads.

### DevOps & Tooling
* **Docker**: Containerized environment definitions for local development and seamless deployments.
* **Oxlint**: Modern linting engine to ensure frontend code quality.

---

## Google Technologies Utilized

### 1. Google AI Studio & Gemini API
* **Gemini 2.5 Flash Model**: Utilized as the primary intelligence engine across three distinct features:
  * **Triage Analysis**: Automatically processes issue descriptions, classifies reports into category domains, scores hazard severity, and maps operational crew workflows.
  * **Evidence Auditing**: Matches newly uploaded citizen photos/videos against existing issues to prevent spam and verify legitimacy.
  * **Predictive Analytics**: Analyzes batches of reports to identify spatial clusters or municipal trends (e.g., recurring water leaks in a specific neighborhood) and writes actionable intervention plans.

### 2. Google Cloud Run
* Houses the backend server. The Node.js application is packaged into a Docker container and deployed serverlessly, scaling up on-demand to handle citizen reporting traffic spikes.

### 3. Google Cloud Storage (GCS)
* Stored evidence media (images and videos) uploaded by users. Offers scalable, secure, and low-latency asset hosting.

### 4. Firebase Hosting
* Hosts the static React frontend files, ensuring rapid asset delivery via Google's Global CDN.
