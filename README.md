# SAFENET
### Real-Time Public Safety & Emergency Coordination Platform

> **"One Network. One Response. Safer Communities."**  
> *Deployment Benchmark: Dhammachakra Pravartan Din (500,000+ Attendees), Deekshabhoomi, Nagpur*

🌐 **Live Application Deployment:** [https://securitymanagement0.netlify.app/](https://securitymanagement0.netlify.app/)  
📦 **Source Code Repository:** [https://github.com/vanshikameshram104-source/BUILDX_002](https://github.com/vanshikameshram104-source/BUILDX_002)

---

## 📌 Executive Summary

**SafeNet** is an enterprise-grade, real-time public safety command and emergency coordination platform engineered for massive public gatherings, religious pilgrimages, smart cities, and university campuses. 

During large-scale events, conventional emergency response mechanisms break down due to:
* **Delayed Missing Person Reporting** and chaotic manual paper lookout records.
* **Cellular Carrier Network Saturation** making cloud-only applications crash or freeze.
* **Fragmented Communication** between police officers, medical teams, and volunteer marshals.
* **Unmonitored Bottlenecks** causing sudden crowd surges and stampede risks.
* **Hesitant Citizen Reporting** due to complex forms and lack of feedback tracking.

SafeNet unifies **Citizens & Students**, **Families**, **Volunteer Marshals**, **Police Personnel**, and the **Central Security Control Room** into a single, high-speed, offline-resilient digital safety network.

---

## 🤖 Chatbase AI Security Assistant (Integrated 24/7 Chatbot)

SafeNet features a 24/7 AI-powered safety and navigation assistant powered by **Chatbase**, accessible as a floating widget across the entire platform:

* **Direct Embed Integration:** Configured via Chatbase (`embed.min.js`, Bot ID: `SldNpHpxXX2byxv6Yf4g2`).
* **Emergency Guidance:** Instant step-by-step guidance for citizens, students, and attendees in high-stress situations.
* **Natural Language Queries:**
  * *"Where is the closest medical first aid desk from Exit B?"*
  * *"How do I report a lost child or elderly family member?"*
  * *"What is the safest evacuation route if Gate 2 is congested?"*
  * *"How does the 1-Tap SOS feature share my location?"*
* **Multilingual & Accessible:** Ready to assist multi-lingual event attendees with instant conversational responses.

---

## 🗄️ Hybrid Database Architecture (Supabase PostgreSQL + IndexedDB)

SafeNet is architected with a **Dual-Tier Hybrid Database Engine** providing real-time cloud synchronization while remaining **100% operational offline** during cellular blackouts:

```
┌─────────────────────────────────────────────────────────────┐
│                    SAFENET APPLICATION                      │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
       (Dual-Write Replication)        (Live WebSocket Sync)
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│   Native IndexedDB Engine    │ │   Supabase PostgreSQL Cloud  │
│  (safenet_security_db v1)    │ │ (PostgreSQL 15 + RLS + WS)  │
├──────────────────────────────┤ ├─────────────────────────────┤
│ • 0ms Local Read/Write       │ │ • Live Cloud Sync           │
│ • 100% Offline-First         │ │ • Realtime Subscriptions    │
│ • 7 Section 26 Object Stores │ │ • Row Level Security (RLS)  │
│ • ACID Transaction Logs      │ │ • Neon DDL Compatible       │
│ • Zero Network Dependency    │ │ • Remote WAN Replication    │
└──────────────────────────────┘ └─────────────────────────────┘
```

### 1. Supabase PostgreSQL Cloud Engine
* **Hosted Cloud Instance:** Live PostgreSQL database cluster connected via `@supabase/supabase-js`.
* **7 Normalized Core Relational Tables:**
  1. `users` — Authentication, roles, badge numbers, sector assignments, and coordinates.
  2. `incidents` — Real-time emergency reports with geocodes, categories, priority triage, and assigned units.
  3. `missing_persons` — Missing children/elderly records, photos, clothing, and AI biometric match vectors.
  4. `responders` — Police, medical personnel, and volunteer marshals with live availability and sector assignments.
  5. `alerts` — Zone-targeted emergency broadcasts, evacuation advisories, and audio siren triggers.
  6. `crowd_zones` — Real-time sensor density percentages, capacity limits, and crowd compaction risk levels.
  7. `safety_journeys` — Live GPS route monitoring, waypoints, and automated deviation countdown timers.
* **Row-Level Security (RLS):** Policies enforcing least-privilege data access per role (Citizens, Police, Marshals, Admins).
* **Supabase Realtime:** Instant WebSocket broadcast of new incidents, missing persons, and crowd alerts across all connected devices.

### 2. Client-Side IndexedDB Engine (`safenet_security_db`)
* Built with native browser `idb` storage. If cellular towers fail due to 500,000+ attendees transmitting data simultaneously, SafeNet continues reading and writing with **0ms latency**.
* **Automatic Queue & Reconnect:** When internet reconnects, queued records synchronize seamlessly with Supabase.
* **Disaster Recovery Console:** Located in the Control Room with 1-click JSON backup export and transactional restore.

---

## 🛡️ Security Challenge Scenarios (Evaluation Suite)

SafeNet features a dedicated **"Security Challenge Scenarios"** evaluation section (`/challenges`) built for cybersecurity hackathons, technical juries, and defense evaluations.

Each scenario provides an interactive, safe demo sandbox:

### 1. Live Cyber Attack Simulation (Threat Severity: CRITICAL)
* **Problem:** Active multi-vector cyberattack involving simulated ransomware, phishing, or unauthorized ingress on Port 443.
* **Visual 5-Step Attack-Response Flow:**
  $$\text{ATTACK DETECTED} \longrightarrow \text{THREAT IDENTIFIED} \longrightarrow \text{COMPROMISED COMPONENT ISOLATED} \longrightarrow \text{INCIDENT CONTAINED} \longrightarrow \text{SYSTEM RESTORED}$$
* **Interactive Controls:** **"Simulate Attack"** runs real-time MITRE ATT&CK mitigation with live SOC terminal telemetry logging and clean rollback verification.

### 2. Zero Trust Implementation Challenge (Threat Severity: HIGH)
* **Problem:** Government cybersecurity mandate requiring continuous identity, device, and policy validation before accessing system assets.
* **7-Step Zero Trust Pipeline:**
  $$\text{USER} \longrightarrow \text{IDENTITY VERIFICATION} \longrightarrow \text{MFA} \longrightarrow \text{DEVICE VERIFICATION} \longrightarrow \text{POLICY CHECK} \longrightarrow \text{LEAST-PRIVILEGE ACCESS} \longrightarrow \text{RESOURCE}$$
* **Core Indicators:** Multi-Factor Authentication, Role-Based Access Control, Continuous Verification, Least Privilege, Device Trust, and Session Monitoring.
* **Interactive Tester:** Real-time token validation and geofence verification across Police Dispatcher and Citizen personas.

### 3. Critical Infrastructure Protection Challenge (Threat Severity: CRITICAL)
* **Problem:** Coordinated attacks targeting smart city municipal digital infrastructure during massive public events.
* **Monitored Municipal Nodes:** `POWER GRID`, `WATER SUPPLY`, `TRANSPORTATION`, `PUBLIC SERVICES`, `COMMUNICATION NETWORK`.
* **Resilience Workflow:** Threat Detection $\rightarrow$ Infrastructure Monitoring $\rightarrow$ Threat Isolation $\rightarrow$ Service Protection $\rightarrow$ Recovery.
* **Interactive Controls:** **"Simulate Grid Threat"** triggers automated SCADA air-gap isolation and auxiliary microgrid failover with 1-click grid restoration.

### 4. High-Traffic & DDoS Defense Challenge (Threat Severity: CRITICAL)
* **Problem:** Distributed Denial-of-Service flood exceeding millions of requests per second intended to overwhelm incident reporting.
* **6-Stage Traffic Pipeline:**
  $$\text{INCOMING TRAFFIC} \longrightarrow \text{TRAFFIC ANALYSIS} \longrightarrow \text{MALICIOUS TRAFFIC DETECTION} \longrightarrow \text{TRAFFIC FILTERING} \longrightarrow \text{LOAD BALANCING} \longrightarrow \text{LEGITIMATE USERS}$$
* **Interactive Controls:** **"Run Traffic Simulation"** tests an instant 1.25M req/sec flood, showing edge proof-of-work challenge filtering and 100.00% legitimate SOS uptime.

---

## 📍 Student & Citizen Location Tracking Architecture

SafeNet provides privacy-conscious, battery-optimized location awareness:

```
┌───────────────────────────┐      High-Accuracy Geolocation API
│   Student's Smartphone    │ <───────────────────────────────────────────
│   (Browser: Chrome/Safari)│       (GPS + Cell Triangulation + Wi-Fi)
└─────────────┬─────────────┘
              │  User Consent: "Allow SafeNet to access your location"
              ▼
    navigator.geolocation.getCurrentPosition()
    navigator.geolocation.watchPosition()
              │
              │  Captures: Lat (21.1290° N), Lng (79.0660° E), Accuracy (±4m)
              ▼
┌───────────────────────────┐
│     SafeNet Frontend      │ ──> Encrypted HTTPS & WebSockets
└─────────────┬─────────────┘
              ▼
┌───────────────────────────────────────────────────────────┐
│  • Tactical Security Map (Nagpur Grid)                    │
│  • Automated Campus Geofencing (e.g. Sector 1, Main Gate) │
│  • Safety Journey: Real-Time Route Deviation Detection    │
│  • Emergency SOS: 1-Tap Beacon Dispatch                   │
└───────────────────────────────────────────────────────────┘
```

1. **Emergency SOS (1-Tap Beacon):** Transmits exact GPS coordinates to the Control Room, rings an audible siren on patrol terminals, and plots walking directions for nearby officers.
2. **Safety Journey Tracking:** Tracks student movement when traveling alone at night. If unauthorized path deviation or stoppage is detected, an automated 45-second safety timer is triggered before auto-alerting contacts and security.
3. **Campus & Sector Geofencing:** Matches raw GPS coordinates against polygonal crowd zones (e.g. *"Hostel Block C"*, *"Gate 2 Exit"*).
4. **AI Face Biometric Matching:** CCTV surveillance feed analysis with similarity scoring (e.g. 91% match) and mandatory officer-in-the-loop verification.

---

## 👥 Five Unified Stakeholder Experiences

1. **Citizen Portal (`CitizenView`):**
   * Instant incident reporting (harassment, medical, theft, fire) with auto-captured GPS.
   * Safety Journey route tracking with route deviation alerts.
   * Nearby emergency infrastructure map (medical stations, water desks, police posts).
2. **Family Portal (`FamilyDashboard`):**
   * 4-step Missing Person registration wizard with photo upload and clothing description.
   * Live 5-stage case lifecycle tracker (`REPORTED` $\rightarrow$ `SEARCHING` $\rightarrow$ `POSSIBLE MATCH` $\rightarrow$ `FOUND` $\rightarrow$ `CLOSED`).
3. **Volunteer Marshal Portal (`VolunteerDashboard`):**
   * Duty availability switch (`Available`, `On Scene`, `Offline`).
   * Sector-based task assignments and localized crowd assistance queue.
4. **Police Tactical Dashboard (`PoliceDashboard`):**
   * Law enforcement triage feed with priority escalation controls.
   * AI facial biometric verification interface.
   * Unit dispatch and encrypted operational log.
5. **Central Control Room HQ (`ControlRoomView`):**
   * Real-time tactical map with interactive layers.
   * AI Crowd Monitoring with simulated YOLOv8 computer vision feeds and surge warnings.
   * 4-step targeted Emergency Broadcast transmitter.
   * Current Security Challenge benchmark card with 1-click simulation launcher.
   * Section 26 Database Manager with live Supabase ping latency and backup tools.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript (Strict Mode) |
| **Styling & Theme** | Tailwind CSS v4, Lucide Icons, Custom Cybersecurity Glassmorphism |
| **Build & Bundler** | Vite 8, Rollup, Oxlint |
| **AI Chatbot** | Chatbase Embedded Intelligent Assistant |
| **Cloud Database** | Supabase PostgreSQL (Compatible with Neon SQL), Supabase Realtime |
| **Offline Storage** | IndexedDB (via `idb` v8) with cross-tab BroadcastChannel sync |
| **Mapping & GIS** | Interactive Tactical Grid with Leaflet / SVG Geofencing |
| **Audio Engine** | Web Audio API Synthetic Sirens and Emergency Chimes |
| **Hosting & CI/CD** | Netlify (Continuous Deployment from GitHub `main` branch) |

---

## 🚀 Getting Started Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* `npm` or `pnpm`

### Installation & Run

```bash
# 1. Clone repository
git clone https://github.com/vanshikameshram104-source/BUILDX_002.git
cd BUILDX_002

# 2. Install dependencies
npm install

# 3. Configure Environment Variables (Optional - runs offline by default!)
# Create a .env file with your Supabase credentials:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# 4. Start Development Server
npm run dev
```

The application will be accessible at: `http://localhost:5173`.

### Production Build

```bash
# Run type check and create production bundle
npm run build

# Preview build locally
npm run preview
```

---

## 🌐 Live Deployment on Netlify

SafeNet is deployed live on Netlify with automated continuous integration:
* **Production URL:** [https://securitymanagement0.netlify.app/](https://securitymanagement0.netlify.app/)
* **Build Command:** `npm run build`
* **Publish Directory:** `dist`

---

## 📄 License

Developed for public safety management, community protection, and municipal emergency coordination.
All rights reserved © 2026 SafeNet Platform Team.
