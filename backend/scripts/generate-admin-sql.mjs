import bcrypt from 'bcrypt';

const hash = await bcrypt.hash('admin123', 10);
console.log(`INSERT INTO "User" ("email", "password") VALUES ('admin@cardealer.com', '${hash}') ON CONFLICT ("email") DO UPDATE SET "password" = EXCLUDED."password";`);
