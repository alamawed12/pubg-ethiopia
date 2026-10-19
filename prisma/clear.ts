const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const regs = await p.registration.deleteMany();
  console.log(`Deleted ${regs.count} registrations`);
  const logs = await p.auditLog.deleteMany();
  console.log(`Deleted ${logs.count} audit logs`);
  await p['$disconnect']();
}

main();
