import { Alert, CrowdZone, Incident, MissingPerson, Responder, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-citizen-1',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'citizen',
    currentLocation: { lat: 21.1278, lng: 79.0669, zoneName: 'Stage Area' },
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-family-1',
    name: 'Rajesh Verma',
    email: 'rajesh.verma@example.com',
    phone: '+91 98230 11223',
    role: 'family',
    currentLocation: { lat: 21.1275, lng: 79.0685, zoneName: 'Exit B' },
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-vol-1',
    name: 'Amit Patil',
    email: 'amit.patil@safenet-vol.org',
    phone: '+91 94221 55667',
    role: 'volunteer',
    badgeNumber: 'VOL-042',
    organization: 'Nagpur Youth Safety Corps',
    currentLocation: { lat: 21.1276, lng: 79.0688, zoneName: 'Exit B' },
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-police-1',
    name: 'Inspector S. Deshmukh',
    email: 's.deshmukh@nagpurpolice.gov.in',
    phone: '+91 98220 99881',
    role: 'police',
    badgeNumber: 'MH-NGP-4019',
    organization: 'Nagpur Police Control',
    currentLocation: { lat: 21.1290, lng: 79.0660, zoneName: 'Main Gate' },
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-admin-1',
    name: 'Chief Controller K. Roy',
    email: 'k.roy@safenet.gov.in',
    phone: '+91 99220 00111',
    role: 'admin',
    badgeNumber: 'CTRL-001',
    organization: 'Emergency Operations Command',
    currentLocation: { lat: 21.1285, lng: 79.0665, zoneName: 'Help Desk / Control Center' },
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_CROWD_ZONES: CrowdZone[] = [
  {
    id: 'zone-exit-b',
    zoneName: 'Exit B (East)',
    description: 'Main pedestrian egress towards Wardha Road metro link',
    latitude: 21.1275,
    longitude: 79.0690,
    crowdCount: 2450,
    capacity: 2800,
    density: 87,
    riskLevel: 'CRITICAL',
    trend: '+18% in last 5 min',
    trendDirection: 'up',
    history: [
      { time: '17:15', density: 42 },
      { time: '17:20', density: 48 },
      { time: '17:25', density: 59 },
      { time: '17:30', density: 72 },
      { time: '17:35', density: 87 }
    ],
    recommendedAction: 'Rapid surge detected. Divert flow to Exit C and hold entry at East Cross.',
    alertIssued: false,
    updatedAt: 'Just now'
  },
  {
    id: 'zone-main-gate',
    zoneName: 'Main Gate',
    description: 'Primary ceremonial entrance and security baggage scanners',
    latitude: 21.1290,
    longitude: 79.0660,
    crowdCount: 1820,
    capacity: 3500,
    density: 52,
    riskLevel: 'MODERATE',
    trend: '+4% in last 5 min',
    trendDirection: 'up',
    history: [
      { time: '17:15', density: 45 },
      { time: '17:20', density: 47 },
      { time: '17:25', density: 50 },
      { time: '17:30', density: 51 },
      { time: '17:35', density: 52 }
    ],
    updatedAt: '1 min ago'
  },
  {
    id: 'zone-stage-area',
    zoneName: 'Stage / Stupa Plaza',
    description: 'Central memorial plaza surrounding the historic dome',
    latitude: 21.1278,
    longitude: 79.0669,
    crowdCount: 3400,
    capacity: 4000,
    density: 85,
    riskLevel: 'CRITICAL',
    trend: '+7% in last 5 min',
    trendDirection: 'up',
    history: [
      { time: '17:15', density: 70 },
      { time: '17:20', density: 74 },
      { time: '17:25', density: 78 },
      { time: '17:30', density: 82 },
      { time: '17:35', density: 85 }
    ],
    recommendedAction: 'Stage perimeter near capacity. Regulate internal queue barricades.',
    updatedAt: '2 min ago'
  },
  {
    id: 'zone-exit-a',
    zoneName: 'Exit A (North)',
    description: 'Secondary exit opening to North Garden promenade',
    latitude: 21.1300,
    longitude: 79.0675,
    crowdCount: 940,
    capacity: 2500,
    density: 37,
    riskLevel: 'NORMAL',
    trend: '-5% in last 5 min',
    trendDirection: 'down',
    history: [
      { time: '17:15', density: 45 },
      { time: '17:20', density: 42 },
      { time: '17:25', density: 40 },
      { time: '17:30', density: 39 },
      { time: '17:35', density: 37 }
    ],
    updatedAt: '1 min ago'
  },
  {
    id: 'zone-parking',
    zoneName: 'Parking Area (West)',
    description: 'Multi-tiered vehicular parking & public bus terminal',
    latitude: 21.1270,
    longitude: 79.0645,
    crowdCount: 1150,
    capacity: 2000,
    density: 57,
    riskLevel: 'MODERATE',
    trend: '+2% in last 5 min',
    trendDirection: 'stable',
    history: [
      { time: '17:15', density: 53 },
      { time: '17:20', density: 55 },
      { time: '17:25', density: 56 },
      { time: '17:30', density: 56 },
      { time: '17:35', density: 57 }
    ],
    updatedAt: '3 min ago'
  },
  {
    id: 'zone-exit-c',
    zoneName: 'Exit C (South Egress)',
    description: 'Designated alternate wide evacuation route',
    latitude: 21.1255,
    longitude: 79.0680,
    crowdCount: 410,
    capacity: 2800,
    density: 15,
    riskLevel: 'NORMAL',
    trend: 'Clear & Flowing',
    trendDirection: 'stable',
    history: [
      { time: '17:15', density: 12 },
      { time: '17:20', density: 13 },
      { time: '17:25', density: 14 },
      { time: '17:30', density: 15 },
      { time: '17:35', density: 15 }
    ],
    updatedAt: 'Just now'
  }
];

export const INITIAL_RESPONDERS: Responder[] = [
  {
    id: 'resp-1',
    userId: 'usr-police-1',
    name: 'Insp. S. Deshmukh',
    role: 'police',
    badge: 'MH-NGP-4019',
    phone: '+91 98220 99881',
    latitude: 21.1290,
    longitude: 79.0660,
    zone: 'Main Gate',
    availability: 'available'
  },
  {
    id: 'resp-2',
    userId: 'usr-police-2',
    name: 'SI Rohit Gaikwad',
    role: 'police',
    badge: 'MH-NGP-5120',
    phone: '+91 98220 77665',
    latitude: 21.1300,
    longitude: 79.0675,
    zone: 'Exit A',
    availability: 'available'
  },
  {
    id: 'resp-3',
    userId: 'usr-police-3',
    name: 'HC Anita More',
    role: 'police',
    badge: 'MH-NGP-6091',
    phone: '+91 98220 33441',
    latitude: 21.1275,
    longitude: 79.0690,
    zone: 'Exit B',
    availability: 'busy',
    currentAssignment: 'INC-2026-00483'
  },
  {
    id: 'resp-4',
    userId: 'usr-vol-1',
    name: 'Amit Patil (Vol)',
    role: 'volunteer',
    badge: 'VOL-042',
    phone: '+91 94221 55667',
    latitude: 21.1276,
    longitude: 79.0688,
    zone: 'Exit B',
    availability: 'available'
  },
  {
    id: 'resp-5',
    userId: 'usr-vol-2',
    name: 'Sneha Joshi (Vol)',
    role: 'volunteer',
    badge: 'VOL-088',
    phone: '+91 94221 33221',
    latitude: 21.1285,
    longitude: 79.0665,
    zone: 'Help Desk',
    availability: 'available'
  },
  {
    id: 'resp-6',
    userId: 'usr-med-1',
    name: 'Dr. Neha Rao (Medical)',
    role: 'medical',
    badge: 'MED-104',
    phone: '+91 98900 12345',
    latitude: 21.1278,
    longitude: 79.0669,
    zone: 'Stage Area',
    availability: 'busy',
    currentAssignment: 'INC-2026-00481'
  },
  {
    id: 'resp-7',
    userId: 'usr-med-2',
    name: 'Paramedic Vikas Shinde',
    role: 'medical',
    badge: 'MED-209',
    phone: '+91 98900 67890',
    latitude: 21.1265,
    longitude: 79.0660,
    zone: 'Medical Zone',
    availability: 'available'
  },
  {
    id: 'resp-8',
    userId: 'usr-vol-3',
    name: 'Pooja Nair (Vol)',
    role: 'volunteer',
    badge: 'VOL-112',
    phone: '+91 94221 88990',
    latitude: 21.1278,
    longitude: 79.0669,
    zone: 'Stage Area',
    availability: 'available'
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-00481',
    category: 'Medical Emergency',
    description: 'Elderly attendee feeling dizzy and collapsed due to heat exhaustion in the prayer queue.',
    location: 'Stage Area / Stupa Plaza',
    latitude: 21.1278,
    longitude: 79.0669,
    priority: 'CRITICAL',
    status: 'RESPONDING',
    reporterId: 'usr-citizen-1',
    reporterName: 'Priya Sharma',
    reporterPhone: '+91 98765 43210',
    assignedResponderId: 'resp-6',
    assignedResponderName: 'Dr. Neha Rao (Medical)',
    assignedResponderRole: 'medical',
    createdAt: '10 mins ago',
    updatedAt: '3 mins ago'
  },
  {
    id: 'INC-2026-00482',
    category: 'Chain Snatching',
    description: 'Gold chain snatched by suspect wearing dark jacket who fled towards Gate 2 / Main Gate perimeter.',
    location: 'Main Gate Perimeter',
    latitude: 21.1290,
    longitude: 79.0660,
    priority: 'HIGH',
    status: 'ASSIGNED',
    reporterId: 'usr-citizen-2',
    reporterName: 'Sunil Thakre',
    reporterPhone: '+91 98222 44331',
    assignedResponderId: 'resp-1',
    assignedResponderName: 'Insp. S. Deshmukh',
    assignedResponderRole: 'police',
    createdAt: '18 mins ago',
    updatedAt: '12 mins ago'
  },
  {
    id: 'INC-2026-00483',
    category: 'Crowd Emergency',
    description: 'Bottleneck congestion forming at Exit B. Pedestrians unable to move forward.',
    location: 'Exit B (East Gate)',
    latitude: 21.1275,
    longitude: 79.0690,
    priority: 'CRITICAL',
    status: 'RESPONDING',
    reporterId: 'usr-vol-1',
    reporterName: 'Amit Patil (Volunteer)',
    assignedResponderId: 'resp-3',
    assignedResponderName: 'HC Anita More',
    assignedResponderRole: 'police',
    createdAt: '7 mins ago',
    updatedAt: '2 mins ago'
  },
  {
    id: 'INC-2026-00484',
    category: 'Suspicious Activity',
    description: 'Unattended blue duffel bag resting beside pillar #4 in West Parking without claimant.',
    location: 'Parking Area (West)',
    latitude: 21.1270,
    longitude: 79.0645,
    priority: 'MEDIUM',
    status: 'ACKNOWLEDGED',
    reporterId: 'usr-vol-2',
    reporterName: 'Sneha Joshi',
    createdAt: '25 mins ago',
    updatedAt: '20 mins ago'
  },
  {
    id: 'INC-2026-00480',
    category: 'Harassment',
    description: 'Individual making inappropriate remarks towards female volunteers near water kiosk.',
    location: 'Exit A (North)',
    latitude: 21.1300,
    longitude: 79.0675,
    priority: 'HIGH',
    status: 'RESOLVED',
    reporterId: 'usr-citizen-3',
    reporterName: 'Kavita M.',
    assignedResponderId: 'resp-2',
    assignedResponderName: 'SI Rohit Gaikwad',
    assignedResponderRole: 'police',
    createdAt: '1 hour ago',
    updatedAt: '15 mins ago'
  }
];

export const INITIAL_MISSING_PERSONS: MissingPerson[] = [
  {
    id: 'MSP-2026-00124',
    name: 'Ananya Verma',
    age: 6,
    gender: 'Female',
    personType: 'child',
    photo: 'https://images.unsplash.com/photo-1595454223600-91fbdd774780?w=300&auto=format&fit=crop&q=80',
    clothing: 'Bright yellow floral frock, red hairband, white sandals',
    identifyingFeatures: 'Small scar near left eyebrow, carrying a pink water pouch',
    lastSeenLocation: 'Exit B (East)',
    latitude: 21.1275,
    longitude: 79.0690,
    lastSeenTime: '5:32 PM',
    status: 'SEARCHING',
    reporterId: 'usr-family-1',
    reporterName: 'Rajesh Verma (Father)',
    emergencyContact: '+91 98230 11223',
    createdAt: '22 mins ago',
    updatedAt: '5 mins ago'
  },
  {
    id: 'MSP-2026-00098',
    name: 'Devendra Kulkarni',
    age: 72,
    gender: 'Male',
    personType: 'elderly',
    photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
    clothing: 'White cotton kurta-pajama, black framed spectacles, brown slip-on slippers',
    identifyingFeatures: 'Silver wristwatch, walks with a slight limp',
    medicalNotes: 'Diabetic, mild dementia/memory fog in crowded places',
    lastSeenLocation: 'Medical Zone / West Corridor',
    latitude: 21.1265,
    longitude: 79.0660,
    lastSeenTime: '4:15 PM',
    status: 'SEARCHING',
    reporterId: 'usr-citizen-4',
    reporterName: 'Suresh Kulkarni (Son)',
    emergencyContact: '+91 98811 22334',
    createdAt: '1 hr 15 mins ago',
    updatedAt: '30 mins ago'
  }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'ALT-101',
    type: 'CRITICAL',
    title: '⚠️ CROWD CONGESTION AT EXIT B',
    message: 'Exit B is currently congested (87% capacity). Please use Exit C for a smooth and safer exit.',
    targetZone: 'Exit B (East)',
    targetRole: 'all',
    priority: 'CRITICAL',
    createdBy: 'Control Room Admin',
    createdAt: '5 mins ago'
  },
  {
    id: 'ALT-102',
    type: 'WARNING',
    title: 'High Footfall Advisory: Stupa Central Plaza',
    message: 'Central stupa perimeter is near 85% density. Keep children close and hold hands at all times.',
    targetZone: 'Stage / Stupa Plaza',
    targetRole: 'citizens',
    priority: 'HIGH',
    createdBy: 'Control Room Admin',
    createdAt: '15 mins ago'
  },
  {
    id: 'ALT-103',
    type: 'INFO',
    title: 'Medical Post & Lost Child Desk Active',
    message: 'First Aid Post #2 and Child Safety Help Desk operational near Central Lawn 24/7.',
    targetZone: 'Entire Event',
    targetRole: 'all',
    priority: 'NORMAL',
    createdBy: 'Operations Chief',
    createdAt: '45 mins ago'
  }
];
