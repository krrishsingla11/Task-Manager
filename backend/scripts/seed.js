/**
 * Seed script — creates demo admin and user accounts + sample tasks.
 * Run: node backend/scripts/seed.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Task = require('../src/models/Task');
const { mongoUri } = require('../src/config/env');

const USERS = [
  { name: 'Admin User', email: 'admin@primetrade.ai', password: 'Admin1234', role: 'admin' },
  { name: 'Jane Developer', email: 'user@primetrade.ai', password: 'User1234', role: 'user' },
];

const seed = async () => {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  // Clear existing
  await User.deleteMany({});
  await Task.deleteMany({});

  // Create users
  const createdUsers = [];
  for (const u of USERS) {
    const user = await User.create(u);
    createdUsers.push(user);
    console.log(`✅ Created ${u.role}: ${u.email}`);
  }

  const regularUser = createdUsers.find((u) => u.role === 'user');

  // Sample tasks
  const tasks = [
    { title: 'Design database schema', description: 'Draft ERD for tasks and users', status: 'done', priority: 'high', tags: ['backend', 'database'], owner: regularUser._id },
    { title: 'Implement JWT authentication', description: 'Register, login, and token refresh', status: 'done', priority: 'high', tags: ['backend', 'security'], owner: regularUser._id },
    { title: 'Build REST API endpoints', description: 'CRUD for tasks with validation', status: 'in-progress', priority: 'high', tags: ['backend', 'api'], owner: regularUser._id },
    { title: 'Write Swagger documentation', status: 'in-progress', priority: 'medium', tags: ['docs'], owner: regularUser._id },
    { title: 'Set up React frontend', description: 'Vite scaffold with routing', status: 'done', priority: 'medium', tags: ['frontend'], owner: regularUser._id },
    { title: 'Create login and register pages', status: 'done', priority: 'medium', tags: ['frontend', 'auth'], owner: regularUser._id },
    { title: 'Build task dashboard', description: 'CRUD UI with filters', status: 'in-progress', priority: 'high', tags: ['frontend'], owner: regularUser._id },
    { title: 'Add Docker configuration', status: 'todo', priority: 'low', tags: ['devops'], owner: regularUser._id },
    { title: 'Write technical README', status: 'in-progress', priority: 'medium', tags: ['docs'], owner: regularUser._id },
  ];

  for (const task of tasks) {
    await Task.create(task);
  }

  console.log(`✅ Created ${tasks.length} sample tasks`);
  console.log('\n🎉 Seed complete!');
  console.log('  Admin: admin@primetrade.ai / Admin1234');
  console.log('  User:  user@primetrade.ai  / User1234');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
