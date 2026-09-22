import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, UserRole, AppView, Incident, MissingPerson, Responder, 
  Alert, CrowdZone, SafetyJourney, NotificationItem, IncidentPriority
} from '../types';
import { 
  INITIAL_USERS, INITIAL_INCIDENTS, INITIAL_MISSING_PERSONS, 
  INITIAL_RESPONDERS, INITIAL_CROWD_ZONES, INITIAL_ALERTS 
} from '../data/initialData';
import { audioAlerts } from '../utils/audioAlerts';
import { safenetDB } from '../services/db/safenetDB';
import { supabaseDB, testSupabaseConnection, getStoredSupabaseConfig } from '../services/db/supabaseClient';

interface AppContextType {
  // Database Operations (Section 26 & Supabase/Neon Cloud)
  isSupabaseConnected: boolean;
  reconnectSupabase: () => Promise<boolean>;
  exportDatabaseBackup: () => Promise<string>;
  importDatabaseBackup: (jsonString: string) => Promise<boolean>;
  getDatabaseStats: () => Promise<{ users: number; incidents: number; missingPersons: number; responders: number; alerts: number; crowdZones: number }>;

  // Navigation & View
  currentView: AppView;
  setCurrentView: (val: AppView) => void;
  navigateTo: (view: AppView, targetRole?: UserRole) => void;

  // Theme & Sound
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;

  // Auth & Roles
  currentUser: User;
  switchRole: (role: UserRole) => void;
  allUsers: User[];

  // Incidents
  incidents: Incident[];
  reportIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Incident;
  updateIncidentStatus: (id: string, status: Incident['status'], responderId?: string) => void;
  updateIncidentPriority: (id: string, priority: IncidentPriority) => void;
  assignResponder: (incidentId: string, responderId: string) => void;

  // Missing Persons
  missingPersons: MissingPerson[];
  reportMissingPerson: (person: Omit<MissingPerson, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => MissingPerson;
  updateMissingPersonStatus: (id: string, status: MissingPerson['status']) => void;
  verifyAIMatch: (id: string, isMatch: boolean) => void;

  // Responders
  responders: Responder[];
  updateResponderStatus: (id: string, availability: Responder['availability'], zone?: string) => void;

  // Crowd Zones
  crowdZones: CrowdZone[];
  updateZoneDensity: (zoneId: string, newDensity: number) => void;
  approveCrowdRecommendation: (zoneId: string) => void;

  // Alerts & Broadcasts
  alerts: Alert[];
  broadcastAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => Alert;

  // Safety Journey
  activeJourney: SafetyJourney | null;
  startSafetyJourney: (destination: string, trustedContacts: { name: string; phone: string }[]) => void;
  endSafetyJourney: () => void;
  respondToDeviation: (safe: boolean) => void;
  triggerEmergencySOS: (locationName?: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Demo Mode Simulation Triggers
  simulateMissingPersonDemo: () => void;
  simulateIncidentDemo: () => void;
  simulateCrowdSurgeDemo: () => void;
  simulateBroadcastDemo: () => void;
  simulateRouteDeviationDemo: () => void;
  simulateAIMatchDemo: () => void;
  resetToDemoData: () => void;

  // Guided Walkthrough
  demoTourStep: number;
  setDemoTourStep: (step: number) => void;
  isTourActive: boolean;
  setIsTourActive: (active: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'safenet_app_state_v1';
const SYNC_CHANNEL_NAME = 'safenet_cross_tab_sync';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<AppView>('landing');

  const navigateTo = (view: AppView, targetRole?: UserRole) => {
    if (targetRole) {
      const matched = allUsers.find(u => u.role === targetRole);
      if (matched) setCurrentUser(matched);
    }
    setCurrentView(view);
    audioAlerts.playDispatchTone();
  };

  // Theme state
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('safenet_theme');
    if (saved) return saved === 'dark';
    return true; // Default to dark command center theme
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);

  // Users & Auth
  const [allUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() => INITIAL_USERS[4]); // default to Admin for first impression

  // Core entities
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_incidents');
    return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
  });

  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_missing');
    return saved ? JSON.parse(saved) : INITIAL_MISSING_PERSONS;
  });

  const [responders, setResponders] = useState<Responder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_responders');
    return saved ? JSON.parse(saved) : INITIAL_RESPONDERS;
  });

  const [crowdZones, setCrowdZones] = useState<CrowdZone[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_crowdzones');
    return saved ? JSON.parse(saved) : INITIAL_CROWD_ZONES;
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [activeJourney, setActiveJourney] = useState<SafetyJourney | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_journey');
    return saved ? JSON.parse(saved) : null;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Command Network Active',
      message: 'SafeNet deployed for Deekshabhoomi Annual Gathering. 8 Responders active.',
      type: 'system',
      severity: 'info',
      timestamp: '17:30',
      read: false
    },
    {
      id: 'notif-2',
      title: 'High Density Alert at Exit B',
      message: 'Automated crowd sensor reports 87% capacity at East egress.',
      type: 'crowd',
      severity: 'critical',
      timestamp: '17:35',
      read: false
    }
  ]);

  // Guided Tour
  const [demoTourStep, setDemoTourStep] = useState<number>(0);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);

  // Sync with HTML class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('safenet_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const setDarkMode = (val: boolean) => setDarkModeState(val);
  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    audioAlerts.enabled = val;
  };

  // Initial Load from IndexedDB
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const [dbInc, dbMis, dbResp, dbZones, dbAlerts] = await Promise.all([
          safenetDB.incidents.getAll(),
          safenetDB.missingPersons.getAll(),
          safenetDB.responders.getAll(),
          safenetDB.crowdZones.getAll(),
          safenetDB.alerts.getAll()
        ]);
        if (dbInc && dbInc.length > 0) setIncidents(dbInc);
        if (dbMis && dbMis.length > 0) setMissingPersons(dbMis);
        if (dbResp && dbResp.length > 0) setResponders(dbResp);
        if (dbZones && dbZones.length > 0) setCrowdZones(dbZones);
        if (dbAlerts && dbAlerts.length > 0) setAlerts(dbAlerts);
      } catch (err) {
        console.warn('IndexedDB initial sync fallback to memory:', err);
      }
    };
    initDatabase();
  }, []);

  // Supabase (PostgreSQL Cloud Engine) Connection & Realtime Sync
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  const reconnectSupabase = useCallback(async (): Promise<boolean> => {
    const config = getStoredSupabaseConfig();
    if (config.url && config.anonKey && config.url !== 'https://your-project.supabase.co') {
      const res = await testSupabaseConnection(config.url, config.anonKey);
      setIsSupabaseConnected(res.success);
      if (res.success) {
        const [sbInc, sbMis, sbZones, sbAlerts] = await Promise.all([
          supabaseDB.incidents.getAll(),
          supabaseDB.missingPersons.getAll(),
          supabaseDB.crowdZones.getAll(),
          supabaseDB.alerts.getAll()
        ]);
        if (sbInc && sbInc.length > 0) setIncidents(sbInc);
        if (sbMis && sbMis.length > 0) setMissingPersons(sbMis);
        if (sbZones && sbZones.length > 0) setCrowdZones(sbZones);
        if (sbAlerts && sbAlerts.length > 0) setAlerts(sbAlerts);
      }
      return res.success;
    }
    setIsSupabaseConnected(false);
    return false;
  }, []);

  useEffect(() => {
    reconnectSupabase();

    const unsubRealtime = supabaseDB.subscribeToChanges(async () => {
      const [sbInc, sbMis, sbZones, sbAlerts] = await Promise.all([
        supabaseDB.incidents.getAll(),
        supabaseDB.missingPersons.getAll(),
        supabaseDB.crowdZones.getAll(),
        supabaseDB.alerts.getAll()
      ]);
      if (sbInc && sbInc.length > 0) setIncidents(sbInc);
      if (sbMis && sbMis.length > 0) setMissingPersons(sbMis);
      if (sbZones && sbZones.length > 0) setCrowdZones(sbZones);
      if (sbAlerts && sbAlerts.length > 0) setAlerts(sbAlerts);
    });

    return () => unsubRealtime();
  }, [reconnectSupabase]);

  // Cross-tab Broadcast Channel
  const broadcastCrossTab = useCallback((action: string, payload: unknown) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
        bc.postMessage({ action, payload });
        bc.close();
      }
    } catch {
      // Fallback
    }
  }, []);

  // Listen to cross-tab updates
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
    bc.onmessage = (event) => {
      const { action, payload } = event.data;
      if (action === 'NEW_INCIDENT') {
        setIncidents(prev => [payload as Incident, ...prev.filter(i => i.id !== (payload as Incident).id)]);
        audioAlerts.playEmergencyAlert();
      } else if (action === 'NEW_MISSING') {
        setMissingPersons(prev => [payload as MissingPerson, ...prev.filter(m => m.id !== (payload as MissingPerson).id)]);
        audioAlerts.playEmergencyAlert();
      } else if (action === 'NEW_ALERT') {
        setAlerts(prev => [payload as Alert, ...prev]);
        audioAlerts.playEmergencyAlert();
      } else if (action === 'UPDATE_INCIDENTS') {
        setIncidents(payload as Incident[]);
      } else if (action === 'UPDATE_MISSING') {
        setMissingPersons(payload as MissingPerson[]);
      } else if (action === 'UPDATE_ZONES') {
        setCrowdZones(payload as CrowdZone[]);
      } else if (action === 'RESET_ALL') {
        setIncidents(INITIAL_INCIDENTS);
        setMissingPersons(INITIAL_MISSING_PERSONS);
        setResponders(INITIAL_RESPONDERS);
        setCrowdZones(INITIAL_CROWD_ZONES);
        setAlerts(INITIAL_ALERTS);
        setActiveJourney(null);
      }
    };
    return () => {
      bc.close();
    };
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_missing', JSON.stringify(missingPersons));
  }, [missingPersons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_responders', JSON.stringify(responders));
  }, [responders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_crowdzones', JSON.stringify(crowdZones));
  }, [crowdZones]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_journey', JSON.stringify(activeJourney));
  }, [activeJourney]);

  // Switch role handler
  const switchRole = (role: UserRole) => {
    const matched = allUsers.find(u => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      audioAlerts.playDispatchTone();
      if (currentView !== 'landing') {
        if (role === 'citizen') setCurrentView('citizen');
        else if (role === 'family') setCurrentView('family');
        else if (role === 'volunteer') setCurrentView('volunteer');
        else if (role === 'police') setCurrentView('police');
        else if (role === 'admin') setCurrentView('control_room');
      }
    }
  };

  // Incident reporting
  const reportIncident = (incidentData: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Incident => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newId = `INC-2026-${randomNum}`;
    const newIncident: Incident = {
      ...incidentData,
      id: newId,
      status: 'REPORTED',
      createdAt: 'Just now',
      updatedAt: 'Just now'
    };

    setIncidents(prev => [newIncident, ...prev]);
    
    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `🚨 New ${newIncident.priority} Incident: ${newIncident.category}`,
      message: `${newIncident.location} - ${newIncident.description.slice(0, 70)}...`,
      type: 'incident',
      severity: newIncident.priority === 'CRITICAL' ? 'critical' : 'high',
      timestamp: 'Just now',
      read: false,
      relatedId: newId
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (newIncident.priority === 'CRITICAL') {
      audioAlerts.playEmergencyAlert();
    } else {
      audioAlerts.playDispatchTone();
    }

    safenetDB.incidents.save(newIncident);
    supabaseDB.incidents.insertOrUpdate(newIncident);
    broadcastCrossTab('NEW_INCIDENT', newIncident);
    return newIncident;
  };

  const updateIncidentStatus = (id: string, status: Incident['status'], responderId?: string) => {
    let assignedName: string | undefined;
    setIncidents(prev => {
      const updated = prev.map(inc => {
        if (inc.id === id) {
          const resp = responderId ? responders.find(r => r.id === responderId) : undefined;
          assignedName = resp?.name;
          return {
            ...inc,
            status,
            assignedResponderId: responderId || inc.assignedResponderId,
            assignedResponderName: resp ? resp.name : inc.assignedResponderName,
            assignedResponderRole: resp ? resp.role : inc.assignedResponderRole,
            updatedAt: 'Just now'
          };
        }
        return inc;
      });
      broadcastCrossTab('UPDATE_INCIDENTS', updated);
      return updated;
    });

    safenetDB.incidents.updateStatus(id, status, responderId, assignedName);
    supabaseDB.incidents.updateStatus(id, status, responderId, assignedName);

    if (status === 'RESOLVED') {
      audioAlerts.playSuccessTone();
    } else {
      audioAlerts.playDispatchTone();
    }
  };

  const updateIncidentPriority = (id: string, priority: IncidentPriority) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, priority, updatedAt: 'Just now' } : inc));
  };

  const assignResponder = (incidentId: string, responderId: string) => {
    const resp = responders.find(r => r.id === responderId);
    if (!resp) return;

    // Update responder availability
    setResponders(prev => prev.map(r => r.id === responderId ? { ...r, availability: 'busy', currentAssignment: incidentId } : r));

    // Update incident
    updateIncidentStatus(incidentId, 'ASSIGNED', responderId);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Responder Dispatched`,
      message: `${resp.name} (${resp.role.toUpperCase()}) assigned to ${incidentId}`,
      type: 'incident',
      severity: 'info',
      timestamp: 'Just now',
      read: false,
      relatedId: incidentId
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Missing person reporting
  const reportMissingPerson = (data: Omit<MissingPerson, 'id' | 'createdAt' | 'updatedAt' | 'status'>): MissingPerson => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newId = `MSP-2026-${randomNum}`;
    const newPerson: MissingPerson = {
      ...data,
      id: newId,
      status: 'REPORTED',
      createdAt: 'Just now',
      updatedAt: 'Just now'
    };

    setMissingPersons(prev => [newPerson, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `🔵 MISSING PERSON: ${newPerson.name} (${newPerson.age}y)`,
      message: `Last seen at ${newPerson.lastSeenLocation} at ${newPerson.lastSeenTime}. Case #${newId}`,
      type: 'missing_person',
      severity: 'critical',
      timestamp: 'Just now',
      read: false,
      relatedId: newId
    };
    setNotifications(prev => [newNotif, ...prev]);

    safenetDB.missingPersons.save(newPerson);
    supabaseDB.missingPersons.insertOrUpdate(newPerson);
    audioAlerts.playEmergencyAlert();
    broadcastCrossTab('NEW_MISSING', newPerson);
    return newPerson;
  };

  const updateMissingPersonStatus = (id: string, status: MissingPerson['status']) => {
    setMissingPersons(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, status, updatedAt: 'Just now' } : m);
      broadcastCrossTab('UPDATE_MISSING', updated);
      return updated;
    });

    safenetDB.missingPersons.updateStatus(id, status);
    supabaseDB.missingPersons.updateStatus(id, status);

    if (status === 'FOUND' || status === 'CLOSED') {
      audioAlerts.playSuccessTone();
    } else {
      audioAlerts.playDispatchTone();
    }
  };

  const verifyAIMatch = (id: string, isMatch: boolean) => {
    setMissingPersons(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          aiMatchVerified: isMatch,
          status: isMatch ? 'FOUND' : 'SEARCHING',
          updatedAt: 'Just now'
        };
      }
      return m;
    }));

    if (isMatch) {
      audioAlerts.playSuccessTone();
      setNotifications(prev => [{
        id: `notif-${Date.now()}`,
        title: `✅ Missing Person Verified Found!`,
        message: `Case ${id} successfully verified by security officers on site.`,
        type: 'missing_person',
        severity: 'success',
        timestamp: 'Just now',
        read: false,
        relatedId: id
      }, ...prev]);
    } else {
      audioAlerts.playWarningBeep();
    }
  };

  // Responder status
  const updateResponderStatus = (id: string, availability: Responder['availability'], zone?: string) => {
    setResponders(prev => prev.map(r => r.id === id ? {
      ...r,
      availability,
      zone: zone || r.zone
    } : r));

    safenetDB.responders.updateAvailability(id, availability, zone);
    supabaseDB.responders.updateAvailability(id, availability, zone);
  };

  // Crowd zone density
  const updateZoneDensity = (zoneId: string, newDensity: number) => {
    setCrowdZones(prev => {
      const updated = prev.map(z => {
        if (z.id === zoneId) {
          const riskLevel: CrowdZone['riskLevel'] = newDensity >= 80 ? 'CRITICAL' : newDensity >= 50 ? 'MODERATE' : 'NORMAL';
          const count = Math.round((newDensity / 100) * z.capacity);
          const history = [...z.history.slice(1), { time: 'Now', density: newDensity }];
          return {
            ...z,
            density: newDensity,
            crowdCount: count,
            riskLevel,
            trend: newDensity > z.density ? `+${newDensity - z.density}% in last 5 min` : `-${z.density - newDensity}% in last 5 min`,
            trendDirection: (newDensity > z.density ? 'up' : newDensity < z.density ? 'down' : 'stable') as 'up' | 'stable' | 'down',
            history,
            updatedAt: 'Just now'
          };
        }
        return z;
      });
      broadcastCrossTab('UPDATE_ZONES', updated);
      return updated;
    });

    safenetDB.crowdZones.updateDensity(zoneId, newDensity);
    supabaseDB.crowdZones.updateDensity(zoneId, newDensity);
  };

  const approveCrowdRecommendation = (zoneId: string) => {
    const zone = crowdZones.find(z => z.id === zoneId);
    if (!zone) return;

    // Create emergency broadcast
    const newAlert: Alert = {
      id: `ALT-CROWD-${Date.now()}`,
      type: 'CRITICAL',
      title: `⚠️ TRAFFIC DIVERSION: ${zone.zoneName}`,
      message: `${zone.zoneName} is heavily congested (${zone.density}%). Please follow security marshals and redirect toward Exit C.`,
      targetZone: zone.zoneName,
      targetRole: 'all',
      priority: 'CRITICAL',
      createdBy: 'Control Room Admin',
      createdAt: 'Just now'
    };

    setAlerts(prev => [newAlert, ...prev]);
    setCrowdZones(prev => prev.map(z => z.id === zoneId ? { ...z, alertIssued: true } : z));

    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: `Crowd Alert Broadcast Dispatched`,
      message: `Diversion recommendation approved and pushed to all screens at ${zone.zoneName}.`,
      type: 'broadcast',
      severity: 'critical',
      timestamp: 'Just now',
      read: false
    }, ...prev]);

    safenetDB.alerts.save(newAlert);
    supabaseDB.alerts.insert(newAlert);
    audioAlerts.playEmergencyAlert();
    broadcastCrossTab('NEW_ALERT', newAlert);
  };

  // Broadcast
  const broadcastAlert = (alertData: Omit<Alert, 'id' | 'createdAt'>): Alert => {
    const newAlert: Alert = {
      ...alertData,
      id: `ALT-${Date.now().toString().slice(-4)}`,
      createdAt: 'Just now'
    };

    setAlerts(prev => [newAlert, ...prev]);
    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: `📢 Broadcast: ${newAlert.title}`,
      message: `${newAlert.targetZone} (${newAlert.targetRole.toUpperCase()}) - ${newAlert.message}`,
      type: 'broadcast',
      severity: newAlert.type === 'CRITICAL' ? 'critical' : 'high',
      timestamp: 'Just now',
      read: false
    }, ...prev]);

    safenetDB.alerts.save(newAlert);
    supabaseDB.alerts.insert(newAlert);
    audioAlerts.playEmergencyAlert();
    broadcastCrossTab('NEW_ALERT', newAlert);
    return newAlert;
  };

  // Safety Journey
  const startSafetyJourney = (destination: string, trustedContacts: { name: string; phone: string }[]) => {
    const journey: SafetyJourney = {
      id: `JRN-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      destination,
      trustedContacts,
      startLocation: 'Stage Area / Stupa Gate',
      currentLocation: { lat: 21.1278, lng: 79.0669, address: 'Near Stupa Plaza' },
      routeStatus: 'ON_ROUTE',
      startedAt: 'Just now'
    };
    setActiveJourney(journey);
    audioAlerts.playDispatchTone();
  };

  const endSafetyJourney = () => {
    setActiveJourney(null);
    audioAlerts.playSuccessTone();
  };

  const respondToDeviation = (safe: boolean) => {
    if (!activeJourney) return;
    if (safe) {
      setActiveJourney({
        ...activeJourney,
        routeStatus: 'ON_ROUTE',
        deviationCountdown: undefined
      });
      audioAlerts.playSuccessTone();
    } else {
      setActiveJourney({
        ...activeJourney,
        routeStatus: 'SOS_TRIGGERED'
      });
      triggerEmergencySOS('Safety Journey Route Deviation - Wardha Bypass');
    }
  };

  const triggerEmergencySOS = (locationName?: string) => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const loc = locationName || (currentUser.currentLocation ? currentUser.currentLocation.zoneName : 'Current Location');
    const newIncident: Incident = {
      id: `INC-2026-${randomNum}`,
      category: 'Medical Emergency',
      description: `EMERGENCY SOS TRIGGERED by ${currentUser.name} (${currentUser.phone}). Immediate response required.`,
      location: loc,
      latitude: currentUser.currentLocation?.lat || 21.1278,
      longitude: currentUser.currentLocation?.lng || 79.0669,
      priority: 'CRITICAL',
      status: 'REPORTED',
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterPhone: currentUser.phone,
      createdAt: 'Just now',
      updatedAt: 'Just now'
    };

    setIncidents(prev => [newIncident, ...prev]);
    audioAlerts.playEmergencyAlert();

    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: `🚨 CITIZEN SOS TRIGGERED!`,
      message: `${currentUser.name} triggered SOS at ${loc}. Nearby responders dispatched.`,
      type: 'incident',
      severity: 'critical',
      timestamp: 'Just now',
      read: false,
      relatedId: newIncident.id
    }, ...prev]);

    broadcastCrossTab('NEW_INCIDENT', newIncident);
  };

  // Notification helpers
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // -------------------------------------------------------------
  // DEMO SIMULATION FUNCTIONS FOR HACKATHON JURORS
  // -------------------------------------------------------------
  const simulateMissingPersonDemo = () => {
    const caseId = 'MSP-2026-00124';
    // Ensure Ananya Verma is in the list
    const existing = missingPersons.find(m => m.id === caseId);
    if (!existing) {
      const childCase: MissingPerson = {
        id: caseId,
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
        createdAt: 'Just now',
        updatedAt: 'Just now'
      };
      setMissingPersons(prev => [childCase, ...prev]);
    } else {
      setMissingPersons(prev => prev.map(m => m.id === caseId ? { ...m, status: 'SEARCHING', updatedAt: 'Just now' } : m));
    }

    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: '🔵 Demo: Missing Child Report Triggered',
      message: 'Case MSP-2026-00124 (6yo Ananya Verma) at Exit B generated and sent to Control Room.',
      type: 'missing_person',
      severity: 'critical',
      timestamp: 'Just now',
      read: false
    }, ...prev]);

    audioAlerts.playEmergencyAlert();
  };

  const simulateIncidentDemo = () => {
    const inc = reportIncident({
      category: 'Chain Snatching',
      description: 'Gold chain snatched by suspect in dark jacket fleeing towards Gate 2 / Main Gate.',
      location: 'Main Gate Perimeter',
      latitude: 21.1290,
      longitude: 79.0660,
      priority: 'HIGH',
      reporterId: 'usr-citizen-2',
      reporterName: 'Sunil Thakre',
      reporterPhone: '+91 98222 44331'
    });
    return inc;
  };

  const simulateCrowdSurgeDemo = () => {
    updateZoneDensity('zone-exit-b', 89);
    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: '⚠️ Demo: Rapid Crowd Surge at Exit B',
      message: 'Sensors detect 89% density (+21% in 5 min). Recommendation generated: Redirect to Exit C.',
      type: 'crowd',
      severity: 'critical',
      timestamp: 'Just now',
      read: false
    }, ...prev]);
    audioAlerts.playWarningBeep();
  };

  const simulateBroadcastDemo = () => {
    broadcastAlert({
      type: 'CRITICAL',
      title: '⚠️ CROWD CONGESTION AT EXIT B',
      message: 'Exit B is currently congested (87% capacity). Please use Exit C for safer exit.',
      targetZone: 'Exit B (East)',
      targetRole: 'all',
      priority: 'CRITICAL',
      createdBy: 'Control Room Admin'
    });
  };

  const simulateRouteDeviationDemo = () => {
    if (!activeJourney) {
      startSafetyJourney('Metro Station Pillar 124', [
        { name: 'Papa (Home)', phone: '+91 98230 11223' },
        { name: 'Aarav (Friend)', phone: '+91 98900 12345' }
      ]);
    }
    setActiveJourney(prev => {
      if (!prev) return null;
      return {
        ...prev,
        routeStatus: 'DEVIATION_DETECTED',
        deviationCountdown: 45,
        currentLocation: {
          lat: 21.1240,
          lng: 79.0710,
          address: 'Unplanned detour: Wardha Outer Bypass (Dark Alley)'
        }
      };
    });
    audioAlerts.playWarningBeep();
  };

  const simulateAIMatchDemo = () => {
    // Attach AI match to Ananya Verma (MSP-2026-00124)
    setMissingPersons(prev => prev.map(m => {
      if (m.id === 'MSP-2026-00124' || m.personType === 'child') {
        return {
          ...m,
          status: 'POSSIBLE MATCH',
          aiMatchConfidence: 91,
          aiMatchLocation: 'CCTV Camera #04 - Exit B Corridor',
          aiMatchTime: '5:42 PM',
          aiMatchPhoto: 'https://images.unsplash.com/photo-1595454223600-91fbdd774780?w=300&auto=format&fit=crop&q=80',
          aiMatchVerified: false,
          updatedAt: 'Just now'
        };
      }
      return m;
    }));

    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: '🎯 AI Vision Alert: 91% Match Detected',
      message: 'CCTV #04 at Exit B matched missing child Ananya Verma. Awaiting human verification.',
      type: 'missing_person',
      severity: 'critical',
      timestamp: 'Just now',
      read: false,
      relatedId: 'MSP-2026-00124'
    }, ...prev]);

    audioAlerts.playDispatchTone();
  };

  const resetToDemoData = () => {
    safenetDB.resetToDefaults().catch(console.warn);
    setIncidents(INITIAL_INCIDENTS);
    setMissingPersons(INITIAL_MISSING_PERSONS);
    setResponders(INITIAL_RESPONDERS);
    setCrowdZones(INITIAL_CROWD_ZONES);
    setAlerts(INITIAL_ALERTS);
    setActiveJourney(null);
    setDemoTourStep(0);
    setIsTourActive(false);

    localStorage.removeItem(STORAGE_KEY + '_incidents');
    localStorage.removeItem(STORAGE_KEY + '_missing');
    localStorage.removeItem(STORAGE_KEY + '_responders');
    localStorage.removeItem(STORAGE_KEY + '_crowdzones');
    localStorage.removeItem(STORAGE_KEY + '_alerts');
    localStorage.removeItem(STORAGE_KEY + '_journey');

    broadcastCrossTab('RESET_ALL', null);
    audioAlerts.playSuccessTone();
  };

  const exportDatabaseBackup = async (): Promise<string> => {
    return safenetDB.exportBackup();
  };

  const importDatabaseBackup = async (jsonString: string): Promise<boolean> => {
    const success = await safenetDB.importBackup(jsonString);
    if (success) {
      const [dbInc, dbMis, dbResp, dbZones, dbAlerts] = await Promise.all([
        safenetDB.incidents.getAll(),
        safenetDB.missingPersons.getAll(),
        safenetDB.responders.getAll(),
        safenetDB.crowdZones.getAll(),
        safenetDB.alerts.getAll()
      ]);
      setIncidents(dbInc);
      setMissingPersons(dbMis);
      setResponders(dbResp);
      setCrowdZones(dbZones);
      setAlerts(dbAlerts);
      audioAlerts.playSuccessTone();
    }
    return success;
  };

  const getDatabaseStats = async () => {
    return safenetDB.getStats();
  };

  return (
    <AppContext.Provider value={{
      isSupabaseConnected, reconnectSupabase,
      exportDatabaseBackup, importDatabaseBackup, getDatabaseStats,
      currentView, setCurrentView, navigateTo,
      darkMode, setDarkMode,
      soundEnabled, setSoundEnabled,
      currentUser, switchRole, allUsers,
      incidents, reportIncident, updateIncidentStatus, updateIncidentPriority, assignResponder,
      missingPersons, reportMissingPerson, updateMissingPersonStatus, verifyAIMatch,
      responders, updateResponderStatus,
      crowdZones, updateZoneDensity, approveCrowdRecommendation,
      alerts, broadcastAlert,
      activeJourney, startSafetyJourney, endSafetyJourney, respondToDeviation, triggerEmergencySOS,
      notifications, markNotificationRead, clearNotifications,
      simulateMissingPersonDemo, simulateIncidentDemo, simulateCrowdSurgeDemo,
      simulateBroadcastDemo, simulateRouteDeviationDemo, simulateAIMatchDemo, resetToDemoData,
      demoTourStep, setDemoTourStep, isTourActive, setIsTourActive
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
