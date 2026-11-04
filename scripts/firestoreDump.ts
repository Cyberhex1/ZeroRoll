/**
 * Shared helpers for the Firestore backup and restore scripts.
 * Firestore values that JSON cannot hold (Timestamps, GeoPoints, references,
 * bytes) are written as tagged objects so a restore puts back the same types.
 */
import { Timestamp, GeoPoint, DocumentReference, Firestore } from 'firebase-admin/firestore';

export interface DumpLine {
  path: string;
  data: unknown;
}

export function encode(value: unknown): unknown {
  if (value instanceof Timestamp) return { __type: 'timestamp', seconds: value.seconds, nanoseconds: value.nanoseconds };
  if (value instanceof GeoPoint) return { __type: 'geopoint', latitude: value.latitude, longitude: value.longitude };
  if (value instanceof DocumentReference) return { __type: 'ref', path: value.path };
  if (value instanceof Uint8Array) return { __type: 'bytes', base64: Buffer.from(value).toString('base64') };
  if (Array.isArray(value)) return value.map(encode);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = encode(v);
    return out;
  }
  return value;
}

export function decode(value: unknown, db: Firestore): unknown {
  if (Array.isArray(value)) return value.map((v) => decode(v, db));
  if (value && typeof value === 'object') {
    const v = value as Record<string, any>;
    switch (v.__type) {
      case 'timestamp': return new Timestamp(v.seconds, v.nanoseconds);
      case 'geopoint': return new GeoPoint(v.latitude, v.longitude);
      case 'ref': return db.doc(v.path);
      case 'bytes': return Buffer.from(v.base64, 'base64');
    }
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) out[k] = decode(val, db);
    return out;
  }
  return value;
}

/** Bucket name for a document path: the top collection, plus the last subcollection when nested. */
export function bucketFor(path: string): string {
  const parts = path.split('/');
  const top = parts[0];
  if (parts.length <= 2) return top;
  return `${top}.${parts[parts.length - 2]}`;
}
