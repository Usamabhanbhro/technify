const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const Teacher = require('../model/Teacher');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/iit-db';

async function run() {
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const cnic = '42101-1234567-1';
    const existing = await Teacher.findOne({ cnic });
    if (existing) {
      console.log(`Teacher with CNIC ${cnic} already exists. Skipping.`);
      process.exit(0);
    }

    const hashed = await bcrypt.hash('pass1234', 10);

    const teacher = new Teacher({
      name: 'Test Teacher',
      gender: 'Male',
      age: 30,
      qualification: 'MSc',
      cnic,
      password: hashed,
      phone: '0000000000',
      email: 'teacher@test.local',
      address: 'Test Address',
      experience: '3 years',
    });

    await teacher.save();
    console.log('Created test teacher:');
    console.log(`  CNIC: ${cnic}`);
    console.log('  Password: pass1234');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding teacher:', err);
    process.exit(1);
  }
}

run();
