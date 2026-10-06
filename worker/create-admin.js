// Usage: node create-admin.js <email> <password>
// Prints SQL to insert an admin user (run it with `wrangler d1 execute`).
// The hash format must match worker/src/utils/password.ts.
const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: node create-admin.js <email> <password>');
  process.exit(1);
}

const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
const combined = new Uint8Array(16 + 32);
combined.set(salt);
combined.set(new Uint8Array(bits), 16);
const hash = btoa(String.fromCharCode(...combined));

console.log(`INSERT INTO users (email, password_hash, first_name, last_name, is_admin, is_active)
VALUES ('${email.replace(/'/g, "''")}', '${hash}', 'Admin', 'User', 1, 1);`);
