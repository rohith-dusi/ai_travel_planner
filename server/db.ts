/**
 * SQLite Database persistence for AI Travel Planner
 * Uses Node's built-in `node:sqlite` (DatabaseSync)
 */
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.resolve(process.cwd(), 'trips.db');

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initTables(dbInstance);
  }
  return dbInstance;
}

function initTables(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      destination TEXT NOT NULL,
      origin TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      budget REAL NOT NULL,
      currency TEXT NOT NULL,
      travelers INTEGER NOT NULL,
      travel_style TEXT NOT NULL,
      interests TEXT NOT NULL,
      transport_mode TEXT NOT NULL,
      accommodation TEXT NOT NULL,
      dietary_accessibility TEXT,
      itinerary_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

export interface TripRecord {
  id: string;
  title: string;
  destination: string;
  origin: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  budget: number;
  currency: string;
  travelers: number;
  travel_style: string;
  interests: string[];
  transport_mode: string;
  accommodation: string;
  dietary_accessibility?: string;
  itinerary: any;
  created_at: string;
}

export function saveTrip(record: TripRecord): TripRecord {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO trips (
      id, title, destination, origin, start_date, end_date, duration_days,
      budget, currency, travelers, travel_style, interests, transport_mode,
      accommodation, dietary_accessibility, itinerary_json, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?
    )
  `);

  stmt.run(
    record.id,
    record.title,
    record.destination,
    record.origin,
    record.start_date,
    record.end_date,
    record.duration_days,
    record.budget,
    record.currency,
    record.travelers,
    record.travel_style,
    JSON.stringify(record.interests),
    record.transport_mode,
    record.accommodation,
    record.dietary_accessibility || '',
    JSON.stringify(record.itinerary),
    record.created_at
  );

  return record;
}

export function getAllTrips(): TripRecord[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM trips ORDER BY created_at DESC');
  const rows = stmt.all() as any[];

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    destination: r.destination,
    origin: r.origin,
    start_date: r.start_date,
    end_date: r.end_date,
    duration_days: Number(r.duration_days),
    budget: Number(r.budget),
    currency: r.currency,
    travelers: Number(r.travelers),
    travel_style: r.travel_style,
    interests: JSON.parse(r.interests || '[]'),
    transport_mode: r.transport_mode,
    accommodation: r.accommodation,
    dietary_accessibility: r.dietary_accessibility,
    itinerary: JSON.parse(r.itinerary_json),
    created_at: r.created_at,
  }));
}

export function getTripById(id: string): TripRecord | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM trips WHERE id = ?');
  const row = stmt.get(id) as any;
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    destination: row.destination,
    origin: row.origin,
    start_date: row.start_date,
    end_date: row.end_date,
    duration_days: Number(row.duration_days),
    budget: Number(row.budget),
    currency: row.currency,
    travelers: Number(row.travelers),
    travel_style: row.travel_style,
    interests: JSON.parse(row.interests || '[]'),
    transport_mode: row.transport_mode,
    accommodation: row.accommodation,
    dietary_accessibility: row.dietary_accessibility,
    itinerary: JSON.parse(row.itinerary_json),
    created_at: row.created_at,
  };
}

export function deleteTrip(id: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM trips WHERE id = ?');
  const result = stmt.run(id);
  return (result as any).changes > 0;
}
