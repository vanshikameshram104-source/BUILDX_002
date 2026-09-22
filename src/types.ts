export type UserRole = 'citizen' | 'family' | 'volunteer' | 'police' | 'admin';
export type AppView = 'landing' | 'citizen' | 'family' | 'volunteer' | 'police' | 'control_room' | 'challenges';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  badgeNumber?: string;
  organization?: string;
  currentLocation?: {
    lat: number;
    lng: number;
    zoneName: string;
  };
  avatarUrl?: string;
}

export type IncidentCategory = 
  | 'Chain Snatching'
  | 'Suspicious Activity'
  | 'Medical Emergency'
  | 'Missing Person'
  | 'Crowd Emergency'
  | 'Fire'
  | 'Accident'
  | 'Harassment'
  | 'Other';

export type IncidentPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus = 
  | 'REPORTED'
  | 'ACKNOWLEDGED'
  | 'ASSIGNED'
  | 'RESPONDING'
  | 'RESOLVED';

export interface Incident {
  id: string; // e.g. INC-2026-00482
  category: IncidentCategory;
  description: string;
  photo?: string;
  location: string;
  latitude: number;
  longitude: number;
  priority: IncidentPriority;
  status: IncidentStatus;
  reporterId: string;
  reporterName: string;
  reporterPhone?: string;
  assignedResponderId?: string;
  assignedResponderName?: string;
  assignedResponderRole?: string;
  createdAt: string;
  updatedAt: string;
}

export type MissingPersonStatus = 
  | 'REPORTED'
  | 'SEARCHING'
  | 'POSSIBLE MATCH'
  | 'FOUND'
  | 'CLOSED';

export type MissingPersonType = 'child' | 'elderly' | 'adult';

export interface MissingPerson {
  id: string; // e.g. MSP-2026-00124
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  personType: MissingPersonType;
  photo: string;
  clothing: string;
  identifyingFeatures: string;
  medicalNotes?: string;
  lastSeenLocation: string;
  latitude: number;
  longitude: number;
  lastSeenTime: string;
  status: MissingPersonStatus;
  reporterId: string;
  reporterName: string;
  emergencyContact: string; // Visible only to family/authorized
  aiMatchConfidence?: number;
  aiMatchLocation?: string;
  aiMatchTime?: string;
  aiMatchPhoto?: string;
  aiMatchVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Responder {
  id: string;
  userId: string;
  name: string;
  role: 'volunteer' | 'police' | 'medical';
  phone: string;
  latitude: number;
  longitude: number;
  zone: string;
  availability: 'available' | 'busy' | 'offline';
  currentAssignment?: string; // Incident or Missing Person ID
  badge?: string;
}

export interface Alert {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  targetZone: string; // 'Entire Event' or specific zone
  targetRole: 'all' | 'citizens' | 'volunteers' | 'police';
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
}

export type ZoneRiskLevel = 'NORMAL' | 'MODERATE' | 'CRITICAL';

export interface CrowdZone {
  id: string;
  zoneName: string;
  description: string;
  latitude: number;
  longitude: number;
  crowdCount: number;
  capacity: number;
  density: number; // percentage 0-100
  riskLevel: ZoneRiskLevel;
  trend: string; // e.g. "+18% in last 5 min"
  trendDirection: 'up' | 'stable' | 'down';
  history: { time: string; density: number }[];
  recommendedAction?: string;
  alertIssued?: boolean;
  updatedAt: string;
}

export interface SafetyJourney {
  id: string;
  userId: string;
  userName: string;
  destination: string;
  trustedContacts: { name: string; phone: string }[];
  startLocation: string;
  currentLocation: { lat: number; lng: number; address: string };
  routeStatus: 'ON_ROUTE' | 'DEVIATION_DETECTED' | 'SAFE_ARRIVED' | 'SOS_TRIGGERED';
  startedAt: string;
  deviationCountdown?: number; // seconds remaining before auto-alerting contacts
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'incident' | 'missing_person' | 'crowd' | 'broadcast' | 'journey' | 'system';
  severity: 'critical' | 'high' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  relatedId?: string;
}

export type ChallengeSeverity = 'CRITICAL' | 'HIGH';
export type ChallengeStage = 'DETECT' | 'ANALYZE' | 'RESPOND' | 'CONTAIN' | 'RECOVER' | 'VERIFY';

export interface SecurityChallenge {
  id: string;
  scenarioNumber: string;
  title: string;
  severity: ChallengeSeverity;
  shortDescription: string;
  requirements: string;
  iconName: 'attack' | 'zerotrust' | 'infrastructure' | 'ddos';
  problemStatement: string;
  requiredCapabilities: string[];
  detectionProcess: string[];
  responseProcess: string[];
  recoveryProcess: string[];
  successCriteria: string[];
}
