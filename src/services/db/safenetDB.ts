import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { 
  User, Incident, MissingPerson, Responder, 
  Alert, CrowdZone, SafetyJourney, IncidentStatus, IncidentPriority, MissingPersonStatus 
} from '../../types';
import { 
  INITIAL_USERS, INITIAL_INCIDENTS, INITIAL_MISSING_PERSONS, 
  INITIAL_RESPONDERS, INITIAL_CROWD_ZONES, INITIAL_ALERTS 
} from '../../data/initialData';

const DB_NAME = 'safenet_security_db';
const DB_VERSION = 1;

export interface SafeNetDBSchema extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-role': string; 'by-email': string };
  };
  incidents: {
    key: string;
    value: Incident;
    indexes: { 
      'by-status': IncidentStatus; 
      'by-priority': IncidentPriority; 
      'by-reporter': string;
      'by-category': string;
    };
  };
  missing_persons: {
    key: string;
    value: MissingPerson;
    indexes: { 
      'by-status': MissingPersonStatus; 
      'by-type': string;
      'by-reporter': string;
    };
  };
  responders: {
    key: string;
    value: Responder;
    indexes: { 
      'by-role': string; 
      'by-availability': string; 
      'by-zone': string; 
    };
  };
  alerts: {
    key: string;
    value: Alert;
    indexes: { 
      'by-priority': string; 
      'by-type': string; 
      'by-zone': string; 
    };
  };
  crowd_zones: {
    key: string;
    value: CrowdZone;
    indexes: { 'by-risk': string };
  };
  safety_journeys: {
    key: string;
    value: SafetyJourney;
    indexes: { 'by-user': string; 'by-status': string };
  };
}

export type SafeNetStoreName = 'users' | 'incidents' | 'missing_persons' | 'responders' | 'alerts' | 'crowd_zones' | 'safety_journeys';

class SafeNetDatabase {
  private dbPromise: Promise<IDBPDatabase<SafeNetDBSchema>> | null = null;

  private async getDB(): Promise<IDBPDatabase<SafeNetDBSchema>> {
    if (!this.dbPromise) {
      this.dbPromise = openDB<SafeNetDBSchema>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
          // 1. Users Store
          if (!db.objectStoreNames.contains('users')) {
            const userStore = db.createObjectStore('users', { keyPath: 'id' });
            userStore.createIndex('by-role', 'role');
            userStore.createIndex('by-email', 'email');
          }

          // 2. Incidents Store
          if (!db.objectStoreNames.contains('incidents')) {
            const incStore = db.createObjectStore('incidents', { keyPath: 'id' });
            incStore.createIndex('by-status', 'status');
            incStore.createIndex('by-priority', 'priority');
            incStore.createIndex('by-reporter', 'reporterId');
            incStore.createIndex('by-category', 'category');
          }

          // 3. Missing Persons Store
          if (!db.objectStoreNames.contains('missing_persons')) {
            const mspStore = db.createObjectStore('missing_persons', { keyPath: 'id' });
            mspStore.createIndex('by-status', 'status');
            mspStore.createIndex('by-type', 'personType');
            mspStore.createIndex('by-reporter', 'reporterId');
          }

          // 4. Responders Store
          if (!db.objectStoreNames.contains('responders')) {
            const respStore = db.createObjectStore('responders', { keyPath: 'id' });
            respStore.createIndex('by-role', 'role');
            respStore.createIndex('by-availability', 'availability');
            respStore.createIndex('by-zone', 'zone');
          }

          // 5. Alerts Store
          if (!db.objectStoreNames.contains('alerts')) {
            const alertStore = db.createObjectStore('alerts', { keyPath: 'id' });
            alertStore.createIndex('by-priority', 'priority');
            alertStore.createIndex('by-type', 'type');
            alertStore.createIndex('by-zone', 'targetZone');
          }

          // 6. Crowd Zones Store
          if (!db.objectStoreNames.contains('crowd_zones')) {
            const crowdStore = db.createObjectStore('crowd_zones', { keyPath: 'id' });
            crowdStore.createIndex('by-risk', 'riskLevel');
          }

          // 7. Safety Journeys Store
          if (!db.objectStoreNames.contains('safety_journeys')) {
            const journeyStore = db.createObjectStore('safety_journeys', { keyPath: 'id' });
            journeyStore.createIndex('by-user', 'userId');
            journeyStore.createIndex('by-status', 'routeStatus');
          }
        }
      });
    }

    const db = await this.dbPromise;
    // Check if initial seeding is needed
    await this.seedInitialDataIfEmpty(db);
    return db;
  }

  private async seedInitialDataIfEmpty(db: IDBPDatabase<SafeNetDBSchema>) {
    const userCount = await db.count('users');
    if (userCount === 0) {
      const tx = db.transaction(
        ['users', 'incidents', 'missing_persons', 'responders', 'alerts', 'crowd_zones', 'safety_journeys'], 
        'readwrite'
      );
      
      for (const u of INITIAL_USERS) await tx.objectStore('users').put(u);
      for (const i of INITIAL_INCIDENTS) await tx.objectStore('incidents').put(i);
      for (const m of INITIAL_MISSING_PERSONS) await tx.objectStore('missing_persons').put(m);
      for (const r of INITIAL_RESPONDERS) await tx.objectStore('responders').put(r);
      for (const a of INITIAL_ALERTS) await tx.objectStore('alerts').put(a);
      for (const z of INITIAL_CROWD_ZONES) await tx.objectStore('crowd_zones').put(z);
      await tx.objectStore('safety_journeys').clear();

      await tx.done;
    }
  }

  // -------------------------------------------------------------
  // REPOSITORIES
  // -------------------------------------------------------------

  // Incidents Repository
  public incidents = {
    getAll: async (): Promise<Incident[]> => {
      const db = await this.getDB();
      return db.getAll('incidents');
    },
    get: async (id: string): Promise<Incident | undefined> => {
      const db = await this.getDB();
      return db.get('incidents', id);
    },
    save: async (incident: Incident): Promise<Incident> => {
      const db = await this.getDB();
      await db.put('incidents', incident);
      return incident;
    },
    updateStatus: async (id: string, status: IncidentStatus, responderId?: string, responderName?: string): Promise<void> => {
      const db = await this.getDB();
      const inc = await db.get('incidents', id);
      if (inc) {
        inc.status = status;
        inc.updatedAt = 'Just now';
        if (responderId) inc.assignedResponderId = responderId;
        if (responderName) inc.assignedResponderName = responderName;
        await db.put('incidents', inc);
      }
    },
    updatePriority: async (id: string, priority: IncidentPriority): Promise<void> => {
      const db = await this.getDB();
      const inc = await db.get('incidents', id);
      if (inc) {
        inc.priority = priority;
        inc.updatedAt = 'Just now';
        await db.put('incidents', inc);
      }
    },
    delete: async (id: string): Promise<void> => {
      const db = await this.getDB();
      await db.delete('incidents', id);
    }
  };

  // Missing Persons Repository
  public missingPersons = {
    getAll: async (): Promise<MissingPerson[]> => {
      const db = await this.getDB();
      return db.getAll('missing_persons');
    },
    get: async (id: string): Promise<MissingPerson | undefined> => {
      const db = await this.getDB();
      return db.get('missing_persons', id);
    },
    save: async (person: MissingPerson): Promise<MissingPerson> => {
      const db = await this.getDB();
      await db.put('missing_persons', person);
      return person;
    },
    updateStatus: async (id: string, status: MissingPersonStatus): Promise<void> => {
      const db = await this.getDB();
      const person = await db.get('missing_persons', id);
      if (person) {
        person.status = status;
        person.updatedAt = 'Just now';
        await db.put('missing_persons', person);
      }
    },
    delete: async (id: string): Promise<void> => {
      const db = await this.getDB();
      await db.delete('missing_persons', id);
    }
  };

  // Responders Repository
  public responders = {
    getAll: async (): Promise<Responder[]> => {
      const db = await this.getDB();
      return db.getAll('responders');
    },
    get: async (id: string): Promise<Responder | undefined> => {
      const db = await this.getDB();
      return db.get('responders', id);
    },
    save: async (responder: Responder): Promise<Responder> => {
      const db = await this.getDB();
      await db.put('responders', responder);
      return responder;
    },
    updateAvailability: async (id: string, availability: Responder['availability'], zone?: string): Promise<void> => {
      const db = await this.getDB();
      const resp = await db.get('responders', id);
      if (resp) {
        resp.availability = availability;
        if (zone) resp.zone = zone;
        await db.put('responders', resp);
      }
    }
  };

  // Crowd Zones Repository
  public crowdZones = {
    getAll: async (): Promise<CrowdZone[]> => {
      const db = await this.getDB();
      return db.getAll('crowd_zones');
    },
    get: async (id: string): Promise<CrowdZone | undefined> => {
      const db = await this.getDB();
      return db.get('crowd_zones', id);
    },
    save: async (zone: CrowdZone): Promise<CrowdZone> => {
      const db = await this.getDB();
      await db.put('crowd_zones', zone);
      return zone;
    },
    updateDensity: async (id: string, density: number): Promise<void> => {
      const db = await this.getDB();
      const zone = await db.get('crowd_zones', id);
      if (zone) {
        zone.density = density;
        zone.riskLevel = density >= 80 ? 'CRITICAL' : density >= 50 ? 'MODERATE' : 'NORMAL';
        zone.updatedAt = 'Just now';
        await db.put('crowd_zones', zone);
      }
    }
  };

  // Alerts Repository
  public alerts = {
    getAll: async (): Promise<Alert[]> => {
      const db = await this.getDB();
      const all = await db.getAll('alerts');
      // Sort newest first
      return all.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    },
    save: async (alert: Alert): Promise<Alert> => {
      const db = await this.getDB();
      await db.put('alerts', alert);
      return alert;
    }
  };

  // Safety Journeys Repository
  public safetyJourneys = {
    getActiveForUser: async (userId: string): Promise<SafetyJourney | undefined> => {
      const db = await this.getDB();
      const all = await db.getAllFromIndex('safety_journeys', 'by-user', userId);
      return all.find(j => j.routeStatus === 'ON_ROUTE' || j.routeStatus === 'DEVIATION_DETECTED');
    },
    save: async (journey: SafetyJourney): Promise<SafetyJourney> => {
      const db = await this.getDB();
      await db.put('safety_journeys', journey);
      return journey;
    },
    delete: async (id: string): Promise<void> => {
      const db = await this.getDB();
      await db.delete('safety_journeys', id);
    }
  };

  // Users Repository
  public users = {
    getAll: async (): Promise<User[]> => {
      const db = await this.getDB();
      return db.getAll('users');
    },
    get: async (id: string): Promise<User | undefined> => {
      const db = await this.getDB();
      return db.get('users', id);
    },
    save: async (user: User): Promise<User> => {
      const db = await this.getDB();
      await db.put('users', user);
      return user;
    }
  };

  // Reset to initial baseline data
  public async resetToDefaults(): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(
      ['users', 'incidents', 'missing_persons', 'responders', 'alerts', 'crowd_zones', 'safety_journeys'],
      'readwrite'
    );
    await tx.objectStore('users').clear();
    await tx.objectStore('incidents').clear();
    await tx.objectStore('missing_persons').clear();
    await tx.objectStore('responders').clear();
    await tx.objectStore('alerts').clear();
    await tx.objectStore('crowd_zones').clear();
    await tx.objectStore('safety_journeys').clear();

    for (const u of INITIAL_USERS) await tx.objectStore('users').put(u);
    for (const i of INITIAL_INCIDENTS) await tx.objectStore('incidents').put(i);
    for (const m of INITIAL_MISSING_PERSONS) await tx.objectStore('missing_persons').put(m);
    for (const r of INITIAL_RESPONDERS) await tx.objectStore('responders').put(r);
    for (const a of INITIAL_ALERTS) await tx.objectStore('alerts').put(a);
    for (const z of INITIAL_CROWD_ZONES) await tx.objectStore('crowd_zones').put(z);

    await tx.done;
    this.logTransaction('system', 'RESET', 'Restored 7 baseline stores with Dhammachakra Pravartan Din dataset');
  }

  // Backup & Restore (JSON export / import)
  public async exportBackup(): Promise<string> {
    const db = await this.getDB();
    const data = {
      exportTimestamp: new Date().toISOString(),
      platform: 'SafeNet Public Safety Command',
      version: DB_VERSION,
      users: await db.getAll('users'),
      incidents: await db.getAll('incidents'),
      missing_persons: await db.getAll('missing_persons'),
      responders: await db.getAll('responders'),
      alerts: await db.getAll('alerts'),
      crowd_zones: await db.getAll('crowd_zones'),
      safety_journeys: await db.getAll('safety_journeys')
    };
    this.logTransaction('system', 'BACKUP', 'Exported full JSON snapshot across all 7 Section 26 stores');
    return JSON.stringify(data, null, 2);
  }

  public async importBackup(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      const db = await this.getDB();
      const tx = db.transaction(
        ['users', 'incidents', 'missing_persons', 'responders', 'alerts', 'crowd_zones', 'safety_journeys'],
        'readwrite'
      );

      if (Array.isArray(data.users)) {
        await tx.objectStore('users').clear();
        for (const u of data.users) await tx.objectStore('users').put(u);
      }
      if (Array.isArray(data.incidents)) {
        await tx.objectStore('incidents').clear();
        for (const i of data.incidents) await tx.objectStore('incidents').put(i);
      }
      if (Array.isArray(data.missing_persons)) {
        await tx.objectStore('missing_persons').clear();
        for (const m of data.missing_persons) await tx.objectStore('missing_persons').put(m);
      }
      if (Array.isArray(data.responders)) {
        await tx.objectStore('responders').clear();
        for (const r of data.responders) await tx.objectStore('responders').put(r);
      }
      if (Array.isArray(data.alerts)) {
        await tx.objectStore('alerts').clear();
        for (const a of data.alerts) await tx.objectStore('alerts').put(a);
      }
      if (Array.isArray(data.crowd_zones)) {
        await tx.objectStore('crowd_zones').clear();
        for (const z of data.crowd_zones) await tx.objectStore('crowd_zones').put(z);
      }
      if (Array.isArray(data.safety_journeys)) {
        await tx.objectStore('safety_journeys').clear();
        for (const j of data.safety_journeys) await tx.objectStore('safety_journeys').put(j);
      }

      await tx.done;
      this.logTransaction('system', 'RESTORE', 'Restored 7 object stores from uploaded JSON backup');
      return true;
    } catch {
      return false;
    }
  }

  // Metrics summary
  public async getStats(): Promise<{
    users: number;
    incidents: number;
    missingPersons: number;
    responders: number;
    alerts: number;
    crowdZones: number;
    safetyJourneys: number;
  }> {
    const db = await this.getDB();
    return {
      users: await db.count('users'),
      incidents: await db.count('incidents'),
      missingPersons: await db.count('missing_persons'),
      responders: await db.count('responders'),
      alerts: await db.count('alerts'),
      crowdZones: await db.count('crowd_zones'),
      safetyJourneys: await db.count('safety_journeys'),
    };
  }

  // Store data inspector
  public async getStoreData(storeName: SafeNetStoreName): Promise<unknown[]> {
    const db = await this.getDB();
    this.logTransaction(storeName, 'READ', `Queried full store: ${storeName}`);
    return db.getAll(storeName);
  }

  // Delete item from any store
  public async deleteItem(storeName: SafeNetStoreName, id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete(storeName, id);
    this.logTransaction(storeName, 'DELETE', `Deleted key: ${id}`);
  }

  // Transaction audit logging
  private logs: DBTransactionLog[] = [
    {
      id: 'tx-001',
      timestamp: new Date(Date.now() - 420000).toLocaleTimeString(),
      store: 'system',
      action: 'RESET',
      details: 'Initialized IndexedDB [safenet_security_db v1] with 7 Section 26 stores'
    },
    {
      id: 'tx-002',
      timestamp: new Date(Date.now() - 360000).toLocaleTimeString(),
      store: 'crowd_zones',
      action: 'WRITE',
      details: 'Seeded 6 critical crowd monitoring zones for Deekshabhoomi'
    },
    {
      id: 'tx-003',
      timestamp: new Date(Date.now() - 240000).toLocaleTimeString(),
      store: 'incidents',
      action: 'WRITE',
      details: 'Indexed INC-2026-001 (Priority: CRITICAL, Zone: Exit B)'
    },
    {
      id: 'tx-004',
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
      store: 'missing_persons',
      action: 'WRITE',
      details: 'Indexed MSP-2026-001 (Status: POSSIBLE MATCH, Biometrics: 91%)'
    }
  ];
  private logListeners: ((logs: DBTransactionLog[]) => void)[] = [];

  public logTransaction(
    store: SafeNetStoreName | 'system',
    action: DBTransactionLog['action'],
    details: string
  ) {
    const entry: DBTransactionLog = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      store,
      action,
      details
    };
    this.logs = [entry, ...this.logs.slice(0, 49)];
    this.logListeners.forEach(listener => listener([...this.logs]));
  }

  public getTransactionLogs(): DBTransactionLog[] {
    return [...this.logs];
  }

  public subscribeToLogs(callback: (logs: DBTransactionLog[]) => void): () => void {
    this.logListeners.push(callback);
    callback([...this.logs]);
    return () => {
      this.logListeners = this.logListeners.filter(l => l !== callback);
    };
  }
}

export interface DBTransactionLog {
  id: string;
  timestamp: string;
  store: SafeNetStoreName | 'system';
  action: 'READ' | 'WRITE' | 'DELETE' | 'RESET' | 'BACKUP' | 'RESTORE';
  details: string;
}

export const safenetDB = new SafeNetDatabase();
