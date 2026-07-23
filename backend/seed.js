const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const dns = require('dns');
dns.setServers(["1.1.1.1","8.8.8.8"]);

const Student = require('./model/Student');
const Teacher = require('./model/Teacher');
const Course = require('./model/Course');
const FeeChallan = require('./model/FeeChallan');
const Certificate = require('./model/Certificate');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/IIT-Qasimabad';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Generate 10 Courses
    const courses = [];
    for (let i = 1; i <= 10; i++) {
      courses.push({
        title: `Course ${i} - ${['Web Dev', 'Data Science', 'AI', 'Graphic Design', 'Marketing'][i % 5]}`,
        description: `This is a description for Course ${i}.`,
      });
    }
    const insertedCourses = await Course.insertMany(courses);
    console.log(`Inserted ${insertedCourses.length} courses`);

    // 2. Generate 10 Teachers
    const teachers = [];
    const teacherPasswordHash = await bcrypt.hash('password123', 10);
    for (let i = 1; i <= 10; i++) {
      teachers.push({
        name: `Teacher ${i}`,
        gender: i % 2 === 0 ? 'Female' : 'Male',
        age: 25 + (i % 15),
        qualification: 'Masters in Computer Science',
        cnic: `41303-${1000000 + i}-1`,
        phone: `030012345${i.toString().padStart(2, '0')}`,
        email: `teacher${i}@gmail.com`,
        address: `123 Main St, Hyderabad`,
        experience: `${i} years`,
        password: teacherPasswordHash,
        courses: [insertedCourses[i % insertedCourses.length]._id]
      });
    }
    await Teacher.insertMany(teachers);
    console.log(`Inserted ${teachers.length} teachers`);

    // 3. Generate 10 Students
    const students = [];
    for (let i = 1; i <= 10; i++) {
      students.push({
        name: `Student ${i}`,
        fatherName: `Father ${i}`,
        email: `student${i}@gmail.com`,
        dob: new Date(2000, i % 12, (i * 2) % 28 + 1),
        qualification: 'Intermediate',
        cnic: 41303200000 + i,
        address: `Student Address ${i}`,
        whatsapp: 3001112200 + i,
        course: insertedCourses[i % insertedCourses.length].title,
        portalPassword: `123${i % 10}`,
        rollNo: `ROLL-2026-${i.toString().padStart(3, '0')}`,
        status: 'Enrolled',
        attendancePresent: i * 2,
        attendanceTotal: 20
      });
    }
    const insertedStudents = await Student.insertMany(students);
    console.log(`Inserted ${insertedStudents.length} students`);

    // 4. Generate 10 FeeChallans (1 for each student)
    const feeChallans = [];
    for (let i = 0; i < 10; i++) {
      feeChallans.push({
        studentId: insertedStudents[i]._id,
        challanNo: `CHL-2026-${(i + 1).toString().padStart(4, '0')}`,
        semester: '1st Semester',
        feeType: 'Tuition Fee',
        amount: 5000 + (i * 100),
        status: i % 2 === 0 ? 'Unpaid' : 'Paid',
        dueDate: new Date(2026, 6, 15),
        bankDetails: {
          bankName: 'Meezan Bank',
          accountTitle: 'IIT Qasimabad',
          accountNumber: '0123456789'
        }
      });
    }
    await FeeChallan.insertMany(feeChallans);
    console.log(`Inserted ${feeChallans.length} fee challans`);

    // 5. Sample certificate for public verification testing
    await Certificate.findOneAndUpdate(
      { certNo: 'IIT12345' },
      {
        certNo: 'IIT12345',
        studentName: insertedStudents[0].name,
        courseName: insertedStudents[0].course,
        issueDate: new Date(),
      },
      { upsert: true, new: true }
    );
    console.log('Upserted sample certificate IIT12345');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
