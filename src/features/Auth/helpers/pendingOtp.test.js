import { afterEach, expect, test, setSystemTime } from 'bun:test';
import { readPendingOtp, savePendingOtp, clearPendingOtp } from './pendingOtp';

const originalWindow = globalThis.window;
afterEach(() => { globalThis.window = originalWindow; setSystemTime(); });

function tab() {
 const values = new Map();
 globalThis.window = { sessionStorage: {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: key => values.delete(key),
 }};
 return values;
}

test('OTP display survives reload without retaining password or code; Back and success can clear it', () => {
 const values = tab();
 setSystemTime(new Date('2026-10-21T14:00:00Z'));
 const pending = savePendingOtp('test@example.com');
 expect(readPendingOtp()).toEqual(pending);
 expect([...values.values()].map(JSON.parse)).toEqual([{email:'test@example.com', expiresAt:Date.now()+600000}]);
 setSystemTime(new Date('2026-10-21T14:09:59Z'));
 expect(readPendingOtp()).toEqual(pending);
 clearPendingOtp();
 expect(readPendingOtp()).toBeNull();
 expect(values.size).toBe(0);
});

test('reload never extends expiration and an expired or malformed request is discarded', () => {
 const values = tab();
 setSystemTime(new Date('2026-10-21T14:00:00Z'));
 savePendingOtp('test@example.com');
 const key = [...values.keys()][0];
 setSystemTime(new Date('2026-10-21T14:10:00Z'));
 expect(readPendingOtp()).toBeNull();
 expect(values.size).toBe(0);
 for(const value of ['{', JSON.stringify({email:'invalid',expiresAt:Date.now()+600000})]) {
  values.set(key,value);
  expect(readPendingOtp()).toBeNull();
  expect(values.size).toBe(0);
 }
});

test('unavailable browser storage does not prevent the existing in-memory login flow', () => {
 globalThis.window = {get sessionStorage(){throw Error('Storage denied')}};
 expect(savePendingOtp('test@example.com').email).toBe('test@example.com');
 expect(readPendingOtp()).toBeNull();
 expect(() => clearPendingOtp()).not.toThrow();
 globalThis.window = undefined;
 expect(readPendingOtp()).toBeNull();
});
