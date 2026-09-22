import { SecurityChallenge } from '../types';

export const SECURITY_CHALLENGES: SecurityChallenge[] = [
  {
    id: 'challenge-1',
    scenarioNumber: 'SCENARIO 01',
    title: 'LIVE CYBER ATTACK SIMULATION',
    severity: 'CRITICAL',
    iconName: 'attack',
    shortDescription:
      'During the competition, organizers announce that your system is under an active cyberattack involving ransomware, phishing attempts, or unauthorized access.',
    requirements:
      'Teams must immediately demonstrate how their solution detects the threat, isolates compromised components, and restores normal operations without affecting legitimate users.',
    problemStatement:
      'A multi-vector advanced threat adversary initiates credential-stuffing against field responders and deploys simulated ransomware payloads targeting ingress API gateways. The platform must maintain citizen safety lines while neutralizing the attack.',
    requiredCapabilities: [
      'Automated Ingress Anomaly Detection (AI Behavior Modeling)',
      'Sub-second Container / Microservice Isolation',
      'Dynamic Row-Level-Security (RLS) Circuit Breakers',
      'Tamper-Evident Audit Logging with Cryptographic Hashes',
      'Zero-Downtime State Rollback & Clean Snapshot Restoration'
    ],
    detectionProcess: [
      'Network ingestion pipeline flags anomalous burst of brute-force authentication requests (>5,000 req/s) from 18 untrusted egress ASNs.',
      'Heuristic signature detector matches payload fingerprint against MITRE ATT&CK T1486 (Data Encrypted for Impact).',
      'Telemetry alert automatically escalates to Control Room with high-priority audible trigger.'
    ],
    responseProcess: [
      'Automated microsegmentation isolates the affected ingress cluster node immediately.',
      'Active session tokens matching suspect fingerprint revoked across WebSocket mesh.',
      'Critical communication channels failover to air-gapped cryptographic standby replica.',
      'Field units and citizens receive transparent session migration with zero data loss.'
    ],
    recoveryProcess: [
      'Integrity scanner verifies local IndexedDB and cloud PostgreSQL database hashes against baseline.',
      'Clean container image deployed via automated CI/CD immutable rollback pipeline.',
      'Ingress gateway reopened under strict rate-limiting and challenge-response filters.',
      'Post-incident forensic report generated with MITRE ATT&CK mapping.'
    ],
    successCriteria: [
      'Detection Latency: Threat identified within <1.2 seconds of simulated inception.',
      'Containment: Compromised container isolated with 0 lateral movement to incident database.',
      'Citizen Impact: 100% of legitimate emergency SOS and Missing Person transmissions unaffected.',
      'Restoration: Full operational status verified in <15 seconds.'
    ]
  },
  {
    id: 'challenge-2',
    scenarioNumber: 'SCENARIO 02',
    title: 'ZERO TRUST IMPLEMENTATION CHALLENGE',
    severity: 'HIGH',
    iconName: 'zerotrust',
    shortDescription:
      'A new government cybersecurity policy mandates that every user, device, and service must be continuously verified before accessing any system resources.',
    requirements:
      'Teams must redesign their solution based on the Zero Trust Security Model, incorporating multi-factor authentication, role-based access control, continuous verification, and least-privilege principles.',
    problemStatement:
      'Perimeter-only defense is insufficient for mass gathering security where thousands of volunteer devices, citizen terminals, and police radios interface with the central operations center. Every micro-transaction must be authenticated, authorized, and continuously validated.',
    requiredCapabilities: [
      'Continuous Identity Verification & Cryptographic Token Rotation',
      'Adaptive Multi-Factor Authentication (WebAuthn / TOTP / Biometrics)',
      'Granular Role-Based Access Control (RBAC) with Least Privilege',
      'Device Health & Posture Attestation (Zero-Trust Endpoint Assessment)',
      'Dynamic Risk-Scored Session Monitoring & Policy Enforcement'
    ],
    detectionProcess: [
      'Incoming transaction from field officer terminal triggers continuous posture evaluation.',
      'Endpoint attestation inspects device certificate, OS patch level, and geo-fencing bounds (Nagpur Sector).',
      'Identity verification checks temporary JWT token lifetime (<15m) and cryptographic signature.'
    ],
    responseProcess: [
      'Policy decision engine evaluates role attributes against requested resource (e.g. Police accessing Missing Person Biometrics).',
      'Step-up MFA enforced if risk score increases (e.g. access from unrecognized network subnet).',
      'Least-privilege permission token minted strictly for the duration of the requested operation.',
      'Granular audit log recorded to append-only tamper-proof ledger.'
    ],
    recoveryProcess: [
      'Continuous session watcher recalculates trust scores every 60 seconds.',
      'Automated session invalidation if device leaves geofenced operational boundary.',
      'Instant revocation across peer WebSocket nodes on privilege change.'
    ],
    successCriteria: [
      'Verification Coverage: 100% of API endpoints protected behind Zero Trust Policy Gate.',
      'RBAC Segregation: Citizen cannot query unassigned incident data; Volunteer limited to sector bounds.',
      'Token Integrity: Zero trust authorization decisions completed in <8ms.',
      'Compliance: Fully aligned with NIST SP 800-207 Zero Trust Architecture standards.'
    ]
  },
  {
    id: 'challenge-3',
    scenarioNumber: 'SCENARIO 03',
    title: 'CRITICAL INFRASTRUCTURE PROTECTION CHALLENGE',
    severity: 'CRITICAL',
    iconName: 'infrastructure',
    shortDescription:
      'Your solution is now responsible for protecting the digital infrastructure of a smart city, including power grids, water supply systems, transportation networks, and public services.',
    requirements:
      'Organizers introduce multiple simultaneous attacks targeting these essential services. Teams must adapt their solution to secure critical infrastructure, maintain service availability, and ensure rapid recovery from cyber incidents.',
    problemStatement:
      'Coordinated cyber-physical attacks target Nagpur Smart City SCADA grids, metro transit signaling, and municipal water pressure telemetry simultaneously during a 500,000-person pilgrimage gathering at Deekshabhoomi.',
    requiredCapabilities: [
      'Multi-Grid SCADA Telemetry Monitoring (Modbus/DNP3 over TLS)',
      'Autonomous Cross-Sector Threat Correlation & Cascading Failure Prevention',
      'Physical-Cyber Threat Isolation with Automated Air-Gap Switches',
      'Critical Public Service Priority Queueing & Power Load Diversion',
      'Resilient Municipal Mesh Network Fallback'
    ],
    detectionProcess: [
      'SCADA monitoring agent flags anomalous packet frequency targeting East Substation PLC controllers.',
      'Correlated pressure drop telemetry detected on municipal water main feeding Deekshabhoomi central plaza.',
      'Traffic transit signal telemetry reports synchronization drift indicative of timing spoofing.'
    ],
    responseProcess: [
      'SafeNet triggers municipal threat isolation protocol across all 5 core infrastructure nodes.',
      'Auxiliary solar + battery microgrids automatically engage for high-density pedestrian corridors.',
      'Transit routing switches to autonomous failsafe mode, diverting crowd egress smoothly towards Ring Road.',
      'Emergency broadcast channels elevated to priority tier with guaranteed bandwidth.'
    ],
    recoveryProcess: [
      'SCADA telemetry controllers re-seeded with authenticated cryptographic firmware keys.',
      'Smart grid power load dynamically re-balanced from undamaged Western feeders.',
      'Municipal services restored in prioritized sequence: Life Support > Water > Transit > Public Lighting.',
      'Continuous telemetry health status streamed to Control Room video wall.'
    ],
    successCriteria: [
      'Municipal Uptime: 0 blackout duration in high-density pedestrian safety corridors.',
      'Isolation Speed: Breached SCADA node isolated in <450ms before lateral grid cascade.',
      'Public Safety: Continuous 100% availability of emergency SOS and command dispatch.',
      'Failover Verification: Secondary water and transit routing activated automatically.'
    ]
  },
  {
    id: 'challenge-4',
    scenarioNumber: 'SCENARIO 04',
    title: 'HIGH-TRAFFIC & DDoS DEFENSE CHALLENGE',
    severity: 'CRITICAL',
    iconName: 'ddos',
    shortDescription:
      'Moments before the final evaluation, your platform experiences a massive Distributed Denial-of-Service (DDoS) attack, with millions of requests overwhelming the servers.',
    requirements:
      'Teams must explain and demonstrate how their solution identifies malicious traffic, protects legitimate users, distributes system load, and maintains uninterrupted service availability.',
    problemStatement:
      'A massive Layer 7 HTTP/3 flood and Layer 4 SYN flood exceeding 1.2 Million requests per second is unleashed against SafeNet APIs to paralyze incident reporting and crowd monitoring during peak evaluation.',
    requiredCapabilities: [
      'Edge CDN Anycast Ingress Scrubbing & Geo-IP Behavioral Rate Limiting',
      'Cryptographic Client Proof-of-Work (PoW) & Managed Challenge Generation',
      'Dynamic L7 Request Inspection & Botnet Signature Fingerprinting',
      'Elastic Auto-scaling with Smart Health-checked Load Balancing',
      'Offline-First IndexedDB Client Shielding for Uninterrupted Local Operation'
    ],
    detectionProcess: [
      'Edge metrics detect exponential traffic surge from 12,000 requests/sec to 1,250,000 requests/sec within 4 seconds.',
      'Behavioral analyzer identifies non-browser TLS fingerprint patterns and repetitive headless User-Agent clusters.',
      'Origin server health watcher alerts on ingress worker thread saturation threshold (>80%).'
    ],
    responseProcess: [
      'Edge Anycast scrubbing nodes absorb 99.4% of synthetic bot traffic before reaching application origin.',
      'Intelligent rate-limiter imposes transparent proof-of-work challenge on unverified IP clusters.',
      'Legitimate citizen and responder connections prioritized using authenticated cryptographic session tickets.',
      'Load balancers distribute legitimate traffic across 8 redundant worker replicas.'
    ],
    recoveryProcess: [
      'Botnet IP subnets automatically populated into dynamic cloud firewall blackhole rules.',
      'Traffic graph normalizes as attack is safely absorbed and neutralized at edge.',
      'Client applications report zero dropped connections due to seamless local IndexedDB buffering.',
      'Real-time traffic telemetry report published to Central Control Room.'
    ],
    successCriteria: [
      'Peak Scrubbing Volume: 1.25M req/sec mitigated at edge with 0 origin server collapse.',
      'Legitimate Availability: 100.00% uptime for verified citizen SOS and police telemetry.',
      'API Latency: Average legitimate request latency maintained under <45ms throughout peak flood.',
      'Client Resilience: Local offline queue ensures 0 incident reports lost even under severe network congestion.'
    ]
  }
];
