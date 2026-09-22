import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Incident, MissingPerson, Responder, Alert, CrowdZone, SafetyJourney } from '../../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  enabled: boolean;
}

const SUPABASE_CONFIG_STORAGE_KEY = 'safenet_supabase_credentials';

export const getStoredSupabaseConfig = (): SupabaseConfig => {
  const saved = localStorage.getItem(SUPABASE_CONFIG_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }

  // Fallback to environment variables if available
  const envUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim();
  const envKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();

  return {
    url: envUrl || 'https://your-project.supabase.co',
    anonKey: envKey || '',
    enabled: Boolean(envUrl && envKey)
  };
};

export const saveStoredSupabaseConfig = (config: SupabaseConfig) => {
  localStorage.setItem(SUPABASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  // Reinitialize client instance
  initSupabaseClient();
};

let cachedClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!cachedClient) {
    initSupabaseClient();
  }
  return cachedClient;
};

const initSupabaseClient = () => {
  const config = getStoredSupabaseConfig();
  if (config.url && config.anonKey && config.url !== 'https://your-project.supabase.co') {
    try {
      cachedClient = createClient(config.url, config.anonKey, {
        auth: { persistSession: true },
        realtime: { params: { eventsPerSecond: 10 } }
      });
    } catch (err) {
      console.warn('Could not initialize Supabase client:', err);
      cachedClient = null;
    }
  } else {
    cachedClient = null;
  }
};

// Test Connection & Handshake
export const testSupabaseConnection = async (
  overrideUrl?: string, 
  overrideKey?: string
): Promise<{ success: boolean; latencyMs: number; message: string }> => {
  const startTime = Date.now();
  const url = overrideUrl || getStoredSupabaseConfig().url;
  const key = overrideKey || getStoredSupabaseConfig().anonKey;

  if (!url || !key || url === 'https://your-project.supabase.co') {
    return {
      success: false,
      latencyMs: 0,
      message: 'Please provide a valid Supabase Project URL and Anon API Key.'
    };
  }

  try {
    const tempClient = createClient(url, key);
    // Ping public table or fetch 1 row
    const { error } = await tempClient.from('users').select('id').limit(1);
    const latencyMs = Date.now() - startTime;

    if (error) {
      // If table doesn't exist yet, but connection succeeded
      if (error.code === '42P01') {
        return {
          success: true,
          latencyMs,
          message: 'Connected to PostgreSQL! Tables not created yet. Run supabase_schema.sql in SQL Editor.'
        };
      }
      return {
        success: false,
        latencyMs,
        message: `Connection Error: ${error.message}`
      };
    }

    return {
      success: true,
      latencyMs,
      message: `Successfully connected to Supabase PostgreSQL (${latencyMs}ms latency).`
    };
  } catch (err: any) {
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      message: err?.message || 'Failed to reach Supabase endpoint.'
    };
  }
};

// ------------------------------------------------------------------
// SECTION 26 SUPABASE CRUD ADAPTERS
// ------------------------------------------------------------------

export const supabaseDB = {
  // Incidents
  incidents: {
    getAll: async (): Promise<Incident[] | null> => {
      const client = getSupabaseClient();
      if (!client) return null;
      try {
        const { data, error } = await client.from('incidents').select('*');
        if (error || !data) return null;
        return data.map(row => ({
          id: row.id,
          category: row.category,
          description: row.description,
          location: row.location,
          latitude: row.latitude || row.coordinates?.lat || 21.1278,
          longitude: row.longitude || row.coordinates?.lng || 79.0664,
          priority: row.priority,
          status: row.status,
          reporterName: row.reporter_name || 'Anonymous Citizen',
          reporterPhone: row.reporter_phone,
          reporterId: row.reporter_id || 'usr-anon',
          assignedResponderId: row.assigned_responder_id,
          assignedResponderName: row.assigned_responder_name,
          assignedResponderRole: row.assigned_responder_role,
          photo: row.photo,
          createdAt: row.created_at || 'Just now',
          updatedAt: row.updated_at || 'Just now'
        }));
      } catch {
        return null;
      }
    },
    insertOrUpdate: async (inc: Incident): Promise<boolean> => {
      const client = getSupabaseClient();
      if (!client) return false;
      try {
        const { error } = await client.from('incidents').upsert({
          id: inc.id,
          category: inc.category,
          description: inc.description,
          location: inc.location,
          coordinates: { lat: inc.latitude, lng: inc.longitude },
          priority: inc.priority,
          status: inc.status,
          reporter_name: inc.reporterName,
          reporter_phone: inc.reporterPhone,
          reporter_id: inc.reporterId,
          assigned_responder_id: inc.assignedResponderId,
          assigned_responder_name: inc.assignedResponderName,
          photo: inc.photo,
          updated_at: new Date().toISOString()
        });
        return !error;
      } catch {
        return false;
      }
    },
    updateStatus: async (id: string, status: string, responderId?: string, responderName?: string): Promise<boolean> => {
      const client = getSupabaseClient();
      if (!client) return false;
      try {
        const updates: any = { status, updated_at: new Date().toISOString() };
        if (responderId) updates.assigned_responder_id = responderId;
        if (responderName) updates.assigned_responder_name = responderName;
        const { error } = await client.from('incidents').update(updates).eq('id', id);
        return !error;
      } catch {
        return false;
      }
    }
  },

  // Missing Persons
  missingPersons: {
    getAll: async (): Promise<MissingPerson[] | null> => {
      const client = getSupabaseClient();
      if (!client) return null;
      try {
        const { data, error } = await client.from('missing_persons').select('*');
        if (error || !data) return null;
        return data.map(row => ({
          id: row.id,
          name: row.name,
          age: row.age,
          gender: row.gender || 'Female',
          personType: (row.person_type?.toLowerCase() || 'child') as any,
          clothing: row.clothing || '',
          identifyingFeatures: row.identifying_features || '',
          medicalNotes: row.medical_notes,
          photo: row.photo || '',
          lastSeenLocation: row.last_seen_location,
          lastSeenTime: row.last_seen_time || '10:45 AM',
          latitude: row.latitude || row.coordinates?.lat || 21.1282,
          longitude: row.longitude || row.coordinates?.lng || 79.0691,
          reporterId: row.reporter_id || 'usr-family',
          reporterName: row.reporter_name || 'Family Member',
          emergencyContact: row.emergency_contact || '+91 94221 67890',
          status: row.status || 'REPORTED',
          aiMatchConfidence: row.ai_match_confidence,
          aiMatchLocation: row.ai_match_location || 'Exit B (CCTV #04)',
          aiMatchTime: row.ai_match_time || 'Just now',
          createdAt: row.created_at || 'Just now',
          updatedAt: row.updated_at || 'Just now'
        }));
      } catch {
        return null;
      }
    },
    insertOrUpdate: async (p: MissingPerson): Promise<boolean> => {
      const client = getSupabaseClient();
      if (!client) return false;
      try {
        const { error } = await client.from('missing_persons').upsert({
          id: p.id,
          name: p.name,
          age: p.age,
          gender: p.gender,
          person_type: p.personType,
          clothing: p.clothing,
          identifying_features: p.identifyingFeatures,
          photo: p.photo,
          last_seen_location: p.lastSeenLocation,
          last_seen_time: p.lastSeenTime,
          coordinates: { lat: p.latitude, lng: p.longitude },
          reporter_id: p.reporterId,
          reporter_name: p.reporterName,
          emergency_contact: p.emergencyContact,
          status: p.status,
          ai_match_confidence: p.aiMatchConfidence,
          updated_at: new Date().toISOString()
        });
        return !error;
      } catch {
        return false;
      }
    },
    updateStatus: async (id: string, status: string): Promise<boolean> => {
      const client = getSupabaseClient();
      if (!client) return false;
      try {
        const { error } = await client.from('missing_persons').update({ 
          status, 
          updated_at: new Date().toISOString() 
        }).eq('id', id);
        return !error;
      } catch {
        return false;
      }
    }
  },

  // Crowd Zones
  crowdZones: {
    getAll: async (): Promise<CrowdZone[] | null> => {
      const client = getSupabaseClient();
      if (!client) return null;
      try {
        const { data, error } = await client.from('crowd_zones').select('*');
        if (error || !data) return null;
        return data.map(row => ({
          id: row.id,
          zoneName: row.zone_name,
          description: row.description || `${row.zone_name} Sector`,
          latitude: row.latitude || row.coordinates?.lat || 21.1278,
          longitude: row.longitude || row.coordinates?.lng || 79.0664,
          crowdCount: row.current_count || Math.round((Number(row.density || 0) / 100) * (row.capacity || 5000)),
          capacity: row.capacity || 5000,
          density: Number(row.density || 0),
          riskLevel: row.risk_level || 'NORMAL',
          trend: row.trend || 'STABLE',
          trendDirection: 'stable' as const,
          history: [{ time: 'Now', density: Number(row.density || 0) }],
          alertIssued: Boolean(row.alert_issued),
          updatedAt: row.last_updated || 'Just now'
        }));
      } catch {
        return null;
      }
    },
    updateDensity: async (id: string, density: number): Promise<boolean> => {
      const client = getSupabaseClient();
      if (!client) return false;
      try {
        const riskLevel = density >= 80 ? 'CRITICAL' : density >= 50 ? 'MODERATE' : 'NORMAL';
        const { error } = await client.from('crowd_zones').update({
          density,
          risk_level: riskLevel,
          last_updated: new Date().toISOString()
        }).eq('id', id);
        return !error;
      } catch {
        return false;
      }
    }
  },

  // Alerts
  alerts: {
    getAll: async (): Promise<Alert[] | null> => {
      const client = getSupabaseClient();
      if (!client) return null;
      try {
        const { data, error } = await client.from('alerts').select('*').order('created_at', { ascending: false });
        if (error || !data) return null;
        return data.map(row => ({
          id: row.id,
          type: row.type,
          title: row.title,
          message: row.message,
          targetZone: row.target_zone,
          targetRole: row.target_role,
          priority: row.priority,
          createdBy: row.created_by,
          createdAt: row.created_at
        }));
      } catch {
        return null;
      }
    },
    insert: async (alert: Alert): Promise<boolean> => {
      const client = getSupabaseClient();
      if (!client) return false;
      try {
        const { error } = await client.from('alerts').upsert({
          id: alert.id,
          type: alert.type,
          title: alert.title,
          message: alert.message,
          target_zone: alert.targetZone,
          target_role: alert.targetRole,
          priority: alert.priority,
          created_by: alert.createdBy,
          created_at: new Date().toISOString()
        });
        return !error;
      } catch {
        return false;
      }
    }
  },

  // Responders
  responders: {
    getAll: async (): Promise<Responder[] | null> => {
      const client = getSupabaseClient();
      if (!client) return null;
      try {
        const { data, error } = await client.from('responders').select('*');
        if (error || !data) return null;
        return data.map(row => ({
          id: row.id,
          userId: row.user_id || row.id,
          name: row.name,
          role: row.role as 'volunteer' | 'police' | 'medical',
          badge: row.badge,
          phone: row.phone || '',
          latitude: row.latitude || row.coordinates?.lat || 21.1278,
          longitude: row.longitude || row.coordinates?.lng || 79.0664,
          zone: row.current_zone || 'Exit B (East)',
          availability: row.availability || 'available',
          currentAssignment: row.active_case_id
        }));
      } catch {
        return null;
      }
    },
    updateAvailability: async (id: string, availability: string, zone?: string): Promise<boolean> => {
      const client = getSupabaseClient();
      if (!client) return false;
      try {
        const updates: any = { availability };
        if (zone) updates.current_zone = zone;
        const { error } = await client.from('responders').update(updates).eq('id', id);
        return !error;
      } catch {
        return false;
      }
    }
  },

  // Realtime subscription helper
  subscribeToChanges: (onUpdate: () => void) => {
    const client = getSupabaseClient();
    if (!client) return () => {};

    const channel = client
      .channel('safenet_public_realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        onUpdate();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }
};
