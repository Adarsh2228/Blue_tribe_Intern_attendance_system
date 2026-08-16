const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const now = new Date();
    const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const todayIST = new Date(Date.UTC(istDate.getFullYear(), istDate.getMonth(), istDate.getDate()));
    console.log('Testing connection to Prisma...');
    
    // Attempt to create a dummy record
    console.log('Trying to insert test record...');
    const record = await prisma.attendanceLog.create({
      data: {
        empCode: 'SVF0081',
        date: todayIST,
        status: 'PRESENT',
        checkInTime: now,
      }
    });
    console.log('SUCCESS:', record);
  } catch (e) {
    console.error('FAILED:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
