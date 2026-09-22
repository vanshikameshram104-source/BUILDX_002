# SAFENET
### Real-Time Public Safety & Emergency Coordination Platform

> **"One Network. One Response. Safer Communities."**  
> *Deployment Scenario: Dhammachakra Pravartan Din at Deekshabhoomi, Nagpur*
live demonstration : https://securitymanagement0.netlify.app/
---

## 📌 Project Overview

**SafeNet** is a unified real-time public safety command and citizen coordination platform designed for large public gatherings, cultural festivals, and crowded urban spaces.

During massive events (such as 500,000+ attendees at Deekshabhoomi, Nagpur), public safety faces severe challenges:
- Delayed missing-person reporting and chaotic manual search records
- Cellular network congestion rendering cloud-only tools unreliable
- Paper-based, scattered incident communication between police and volunteer marshals
- Lack of real-time crowd surge detection leading to bottleneck stampedes
- Hesitant citizen reporting and lack of transparent status tracking

SafeNet unites **Citizens**, **Families**, **Volunteer Marshals**, **Police Officers**, and **Central Command HQ** into a single, cohesive, offline-resilient digital safety network.

---

## 👥 Five Unified Stakeholder Experiences

1. **Citizen Portal (`CitizenView`)**
   - Clean, human-centered *"How can we help?"* interface.
   - **4 Primary Action Cards**: Report Incident, Report Missing Person, 1-Tap Emergency SOS, Safety Journey.
   - **Category-First Incident Reporting**: Captures chain snatching, suspicious activity, medical emergencies, fires, and harassment with GPS coordinates.
   - **Safety Journey Tracker**: Destination waypoint tracking with automatic route deviation detection and 45-second auto-alert countdown.
   - **Nearby Tactical Safety Map**: Live GPS pulse with distances to nearest exits, police posts, and medical desks.

2. **Family Member Portal (`FamilyDashboard`)**
   - **4-Step Missing Child/Elderly Wizard**:
     $$\text{Basic Details} \longrightarrow \text{Appearance \& Photos} \longrightarrow \text{Last Seen Location} \longrightarrow \text{Review \& Transmit}$$
   - **5-Stage Live Case Tracker**:
     $$\text{REPORTED} \longrightarrow \text{SEARCHING} \longrightarrow \text{POSSIBLE MATCH} \longrightarrow \text{FOUND} \longrightarrow \text{CLOSED}$$
   - **Sensitive Contact Privacy Shield**: Protects contact numbers and medical history from unauthorized public access.

3. **Volunteer Sector Marshals (`VolunteerDashboard`)**
   - Instant duty status toggle: `Available` • `On Scene` • `Offline`.
   - Priority and distance-sorted lookout feeds.
   - **4-Stage Response Lifecycle**: `[Accept]` → `[Responding]` → `[On Scene]` → `[Resolved]`.

4. **Police Tactical Dashboard (`PoliceDashboard`)**
   - Triage queue with priority overrides and unit assignments.
   - **AI CCTV Biometric Matcher**: Facial similarity matching against surveillance feeds with confidence scores (e.g. 91%) and mandatory human verification.
   - Encrypted UHF radio net log.

5. **Central Control Room HQ (`ControlRoomView`)**
   - **8 Command Tabs**:
     - **Overview**: Central tactical map of Deekshabhoomi with compact incident stream and Exit B crowd surge alerts.
     - **Live Map**: Fullscreen tactical grid with layered filters (Incidents, Missing Persons, Responders, Crowd Zones).
     - **Cases**: Unified incident and missing person triage.
     - **Crowd AI**: Simulated YOLOv8 CCTV feeds with crowd density heatmaps and automated surge diversion recommendations.
     - **Responders**: Live GPS positions and availability roster of all field personnel.
     - **Broadcast**: Geofenced 4-step emergency broadcast console (`Select Zone` → `Target Audience` → `Write Message` → `Preview` → `Transmit`).
     - **Analytics**: Real-time response times, crowd compaction curves, and case resolution rates.
     - **Database (IndexedDB)**: Section 26 data governance console with store browsing, JSON document inspection, disaster recovery backups, and ACID transaction audit streaming.

---

## 🗄️ Database Architecture (Section 26 & Section 36)

SafeNet uses a **high-resilience, offline-first dual-tier storage engine**:

### Primary Engine: Native IndexedDB v1 (`safenet_security_db`)
- **Congestion-Proof**: Runs directly client-side with **0ms query latency**—unaffected by mobile network congestion or carrier tower failure during massive events.
- **ACID Transactions**: Full transactional safety across all operations.
- **7 Section 26 Object Stores**:
  - `users` (Accounts, Roles, Session States)
  - `incidents` (Emergency dispatches, Status pipelines, Geocodes)
  - `missing_persons` (Lost child/elderly records, Biometric vectors)
  - `responders` (Field marshals, Police units, Sector allocations)
  - `alerts` (Zone-targeted emergency broadcasts, Evacuation advisories)
  - `crowd_zones` (Sensor density percentages, Bottleneck risks)
  - `safety_journeys` (Solo attendee route tracking, Deviation alerts)

### Secondary Layer: Cloud Firestore Sync Adapter
- Configurable adapter (`src/services/db/firebaseConfig.ts`) allowing WAN cloud replication across distributed command rooms when internet connectivity is available.

### Enterprise Data Governance & Disaster Recovery
- **One-Click Backup Export**: Downloads complete JSON dump with platform version and timestamp.
- **Transactional Backup Import**: Restores all 7 stores from backup files with schema validation.
- **Live ACID Transaction Stream**: Real-time audit log tracking every `READ`, `WRITE`, `DELETE`, `RESET`, `BACKUP`, and `RESTORE` operation.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd "security management"

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will be running at `http://localhost:5173`.

### Production Build

```bash
# Type check and build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🧪 Evaluator & Demonstration Tour

SafeNet includes a built-in **11-Step Guided Demo Flow** and a floating **Quick Sim Controls** bar:
1. Family reports missing 6-year-old child near Exit B.
2. Case ID `MSP-2026-00124` generated and synchronized across tabs in real time.
3. Volunteer marshals receive instant lookout alerts.
4. AI crowd sensors detect 87% density surge at Exit B.
5. Automated predictive risk alert recommends diversion to Exit C.
6. Control Room transmits targeted geofenced broadcast.
7. Citizen reports chain snatching at Main Gate.
8. Police officer dispatched; incident lifecycle progresses to `RESOLVED`.
9. Safety Journey detects unauthorized route deviation with 45s countdown.
10. CCTV camera registers 91% biometric match with mandatory officer verification.
11. Section 26 Database Governance: Inspect live IndexedDB stores, run JSON backups, and review real-time ACID logs.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite, Oxlint
- **Styling**: Tailwind CSS, Lucide Icons
- **Client Storage Engine**: IndexedDB (via `idb` v8)
- **Cloud Adapter**: Firebase Firestore configuration adapter
- **Real-Time Replication**: Browser `BroadcastChannel` API (`safenet_cross_tab_sync`)
- **Audio Synthesizer**: Web Audio API sirens and chimes

---

## 📄 License

Developed for public safety coordination and emergency response management.
