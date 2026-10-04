import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';
import { initialAdvisors, initialClients, initialAppointments, initialDocuments } from './mockData.ts';
import { Appointment, Client, Advisor, AppointmentDocument, AppointmentStatus, AdminAvailability, DayAvailabilityStatus, CustomTimeSlot, UserProfile } from '../types.ts';

// Check if SQL database connection is configured
const databaseUrl = process.env.DATABASE_URL;
const hasIndividualConfig = Boolean(
  process.env.SQL_HOST &&
  process.env.SQL_USER &&
  process.env.SQL_PASSWORD &&
  process.env.SQL_DB_NAME
);

const hasSqlConfig = Boolean(databaseUrl || hasIndividualConfig);

export const createPool = () => {
  if (databaseUrl) {
    return new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' || databaseUrl.includes('supabase')
        ? { rejectUnauthorized: false }
        : false,
      connectionTimeoutMillis: 10000,
    });
  }

  return new Pool({
    host: process.env.SQL_HOST || 'localhost',
    user: process.env.SQL_USER || 'postgres',
    password: process.env.SQL_PASSWORD || '',
    database: process.env.SQL_DB_NAME || 'postgres',
    port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT) : 5432,
    connectionTimeoutMillis: 10000,
  });
};

let dbInstance: any = null;
if (hasSqlConfig) {
  try {
    const pool = createPool();
    pool.on('error', (err) => {
      console.warn('PostgreSQL Pool connection warning (using mock storage as fallback):', err.message);
    });
    dbInstance = drizzle(pool, { schema });
  } catch (err) {
    console.warn('Could not initialize PostgreSQL client, using in-memory store.');
  }
}

export const db = dbInstance;
export const isSqlActive = Boolean(dbInstance);

// In-Memory Data Store
class InMemoryStore {
  private advisors: Advisor[] = [...initialAdvisors];
  private clients: Client[] = [...initialClients];
  private appointments: Appointment[] = [...initialAppointments];
  private documents: AppointmentDocument[] = [...initialDocuments];
  private userCredentials: Map<string, { passwordHash: string; profile: UserProfile }> = new Map();
  private availabilities: Map<string, AdminAvailability> = new Map();

  constructor() {
    // Fresh start: initialized with zero static mock user data
  }

  getAdvisors(): Advisor[] {
    return [...this.advisors];
  }

  getAdvisorById(id: number): Advisor | undefined {
    return this.advisors.find(a => a.id === id);
  }

  getClients(search?: string): Client[] {
    if (!search) return [...this.clients].sort((a, b) => a.name.localeCompare(b.name));
    const term = search.toLowerCase();
    return this.clients
      .filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.email.toLowerCase().includes(term) || 
        (c.company && c.company.toLowerCase().includes(term))
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getClientById(id: number): Client | undefined {
    return this.clients.find(c => c.id === id);
  }

  getClientByEmail(email: string): Client | undefined {
    return this.clients.find(c => c.email.toLowerCase() === email.toLowerCase());
  }

  getClientByPhone(phone: string): Client | undefined {
    const clean = phone.replace(/\D/g, '');
    return this.clients.find(c => c.phone && c.phone.replace(/\D/g, '') === clean);
  }

  addClient(data: { name: string; email: string; phone?: string; company?: string; homeAddress?: string; sinceYear?: number }): Client {
    const existing = this.clients.find(c => c.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      if (data.phone) existing.phone = data.phone;
      if (data.company) existing.company = data.company;
      if (data.homeAddress) existing.homeAddress = data.homeAddress;
      return existing;
    }

    const newClient: Client = {
      id: this.clients.length > 0 ? Math.max(...this.clients.map(c => c.id)) + 1 : 1,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      homeAddress: data.homeAddress || null,
      sinceYear: data.sinceYear || new Date().getFullYear(),
    };
    this.clients.push(newClient);
    return newClient;
  }

  // User Auth & Credentials
  findUserByEmail(email: string) {
    const normalized = email.toLowerCase().trim();
    return this.userCredentials.get(normalized);
  }

  findUserByPhone(phone: string) {
    const clean = phone.replace(/\D/g, '');
    for (const [_, entry] of this.userCredentials.entries()) {
      if (entry.profile.phone.replace(/\D/g, '') === clean) {
        return entry;
      }
    }
    return null;
  }

  registerUser(password: string, profile: UserProfile) {
    const normalized = profile.email.toLowerCase().trim();
    this.userCredentials.set(normalized, {
      passwordHash: password,
      profile,
    });
    // Also sync to clients list
    this.addClient({
      name: `${profile.firstName} ${profile.lastName}`,
      email: profile.email,
      phone: profile.phone,
      homeAddress: profile.homeAddress,
      company: profile.companyName || undefined,
      sinceYear: new Date().getFullYear(),
    });
    return profile;
  }

  getAppointments(options: { search?: string; date?: string; status?: string; advisorId?: number } = {}): Appointment[] {
    let list = [...this.appointments];

    if (options.search) {
      const q = options.search.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.client.name.toLowerCase().includes(q) ||
        (a.client.email && a.client.email.toLowerCase().includes(q)) ||
        (a.advisor && a.advisor.name.toLowerCase().includes(q)) ||
        (a.taskReason && a.taskReason.toLowerCase().includes(q)) ||
        (a.notes && a.notes.toLowerCase().includes(q))
      );
    }

    if (options.date) {
      list = list.filter(a => a.date === options.date);
    }

    if (options.status && options.status !== 'Alle') {
      list = list.filter(a => a.status === options.status);
    }

    if (options.advisorId) {
      list = list.filter(a => a.advisor?.id === options.advisorId);
    }

    return list.sort((a, b) => {
      const dateDiff = a.date.localeCompare(b.date);
      if (dateDiff !== 0) return dateDiff;
      return a.startTime.localeCompare(b.startTime);
    });
  }

  getAppointmentById(id: number): Appointment | undefined {
    return this.appointments.find(a => a.id === id);
  }

  addAppointment(data: {
    clientId: number;
    advisorId?: number | null;
    title: string;
    taskReason?: string;
    date: string;
    startTime: string;
    endTime: string;
    status?: AppointmentStatus;
    notes?: string;
    serviceCategory?: string;
    isGuest?: boolean;
    guestFirstName?: string;
    guestLastName?: string;
    guestPhone?: string;
    guestEmail?: string;
    userId?: string | null;
  }): Appointment {
    const client = this.getClientById(data.clientId) || {
      id: data.clientId,
      name: 'Mandant',
      email: 'mandant@aus-beratung.de',
      phone: null,
      sinceYear: new Date().getFullYear()
    };

    const advisor = data.advisorId ? this.getAdvisorById(data.advisorId) || null : null;
    const newId = this.appointments.length > 0 ? Math.max(...this.appointments.map(a => a.id)) + 1 : 1;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    const newApt: Appointment = {
      id: newId,
      title: data.title,
      taskReason: data.taskReason || 'Erstberatung',
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status || 'Scheduled',
      notes: data.notes || '',
      client,
      advisor,
      isGuest: data.isGuest || false,
      userId: data.userId || null,
      bookingRef: `AuS-${new Date().getFullYear()}-${randomSuffix}`,
      serviceCategory: data.serviceCategory || 'tax',
      createdAt: new Date().toISOString()
    };

    this.appointments.unshift(newApt);
    return newApt;
  }

  updateAppointment(id: number, updates: Partial<{
    title: string;
    taskReason: string;
    date: string;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    notes: string;
    advisorId: number | null;
  }>): Appointment | null {
    const idx = this.appointments.findIndex(a => a.id === id);
    if (idx === -1) return null;

    const apt = this.appointments[idx];

    let advisor = apt.advisor;
    if (updates.advisorId !== undefined) {
      advisor = updates.advisorId ? this.getAdvisorById(updates.advisorId) || null : null;
    }

    const updated: Appointment = {
      ...apt,
      title: updates.title !== undefined ? updates.title : apt.title,
      taskReason: updates.taskReason !== undefined ? updates.taskReason : apt.taskReason,
      date: updates.date !== undefined ? updates.date : apt.date,
      startTime: updates.startTime !== undefined ? updates.startTime : apt.startTime,
      endTime: updates.endTime !== undefined ? updates.endTime : apt.endTime,
      status: updates.status !== undefined ? updates.status : apt.status,
      notes: updates.notes !== undefined ? updates.notes : apt.notes,
      advisor
    };

    this.appointments[idx] = updated;
    return updated;
  }

  deleteAppointment(id: number): boolean {
    const lenBefore = this.appointments.length;
    this.appointments = this.appointments.filter(a => a.id !== id);
    return this.appointments.length < lenBefore;
  }

  getDocuments(appointmentId: number): AppointmentDocument[] {
    return this.documents.filter(d => d.appointmentId === appointmentId);
  }

  addDocument(
    appointmentId: number, 
    fileName: string, 
    fileSize = '1.2 MB', 
    fileUrl = '#', 
    label = 'Dokument', 
    documentDate?: string
  ): AppointmentDocument {
    const newDoc: AppointmentDocument = {
      id: this.documents.length > 0 ? Math.max(...this.documents.map(d => typeof d.id === 'number' ? d.id : 0)) + 1 : 1,
      appointmentId,
      fileName,
      fileSize,
      fileUrl,
      label,
      documentDate: documentDate || new Date().toISOString().split('T')[0],
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    this.documents.push(newDoc);
    return newDoc;
  }

  // Admin Availability Management
  getAvailability(date: string): AdminAvailability | undefined {
    return this.availabilities.get(date);
  }

  getAllAvailabilities(): AdminAvailability[] {
    return Array.from(this.availabilities.values());
  }

  setAvailability(date: string, status: DayAvailabilityStatus, customSlots?: CustomTimeSlot[], notes?: string): AdminAvailability {
    const existing = this.availabilities.get(date);
    const item: AdminAvailability = {
      id: existing?.id || this.availabilities.size + 1,
      date,
      status,
      customSlots: customSlots || [],
      notes: notes || '',
      updatedAt: new Date().toISOString(),
    };
    this.availabilities.set(date, item);
    return item;
  }

  deleteAvailability(date: string): boolean {
    return this.availabilities.delete(date);
  }
}

export const memoryStore = new InMemoryStore();
