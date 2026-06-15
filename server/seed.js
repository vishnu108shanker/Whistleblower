const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

const User = require('./models/User');
const Issue = require('./models/Issues');

const MONGODB_URI = process.env.MONGODB_URI;

// Arrays of dummy data for realistic generation
const indianFirstNames = ['Amit', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Neha', 'Rohan', 'Anjali', 'Karan', 'Pooja', 'Suresh', 'Ramesh', 'Sunita', 'Gita', 'Anil'];
const indianLastNames = ['Sharma', 'Verma', 'Singh', 'Gupta', 'Patel', 'Kumar', 'Joshi', 'Reddy', 'Das', 'Malhotra', 'Yadav', 'Rao'];
const locations = ['Sector 14', 'MG Road', 'Gandhi Nagar', 'Civil Lines', 'Indira Nagar', 'Rajiv Chowk', 'Vasant Kunj', 'Koramangala', 'Andheri West', 'Connaught Place', 'Salt Lake', 'Banjara Hills'];

// Contextual Mapping: Every specific description now has an exact matching photo
const contextualIssues = {
  Roads: [
    { desc: 'Deep pothole causing accidents', photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' },
    { desc: 'Road severely damaged after rain', photo: 'https://images.unsplash.com/photo-1580194830303-38018dc3a364?auto=format&fit=crop&w=800&q=80' },
    { desc: 'No street lights working on this stretch', photo: 'https://images.unsplash.com/photo-1521406830573-0498db2cceb9?auto=format&fit=crop&w=800&q=80' },
    { desc: 'Pavement encroached and broken', photo: 'https://images.unsplash.com/photo-1498036882173-b41c28af54d3?auto=format&fit=crop&w=800&q=80' }
  ],
  Water: [
    { desc: 'No water supply for 3 days', photo: 'https://images.unsplash.com/photo-1603954605962-eb163aeec3d4?auto=format&fit=crop&w=800&q=80' },
    { desc: 'Muddy water coming from taps', photo: 'https://images.unsplash.com/photo-1541888062976-79cf04da3aa3?auto=format&fit=crop&w=800&q=80' },
    { desc: 'Water pipe leaking heavily on the main road', photo: 'https://images.unsplash.com/photo-1584483758334-012879576ce1?auto=format&fit=crop&w=800&q=80' },
    { desc: 'Low water pressure in the entire block', photo: 'https://images.unsplash.com/photo-1504505051910-48e0259f976a?auto=format&fit=crop&w=800&q=80' }
  ],
  Sanitation: [
    { desc: 'Garbage not collected for a week', photo: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80' },
    { desc: 'Open drain overflowing onto the street', photo: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80' },
    { desc: 'Public toilet in extremely unhygienic condition', photo: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' },
    { desc: 'Dead animal lying on the road', photo: 'https://images.unsplash.com/photo-1520692750392-16e053a94821?auto=format&fit=crop&w=800&q=80' }
  ],
  Electricity: [
    { desc: 'Frequent power cuts since yesterday', photo: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=800&q=80' },
    { desc: 'Live wire hanging dangerously low', photo: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?auto=format&fit=crop&w=800&q=80' },
    { desc: 'Transformer sparked and caught fire', photo: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80' },
    { desc: 'Street lights are on during the day', photo: 'https://images.unsplash.com/photo-1518174542385-cb78f5f67b5e?auto=format&fit=crop&w=800&q=80' }
  ],
  Health: [
    { desc: 'Primary health center is closed during working hours', photo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80' },
    { desc: 'Shortage of essential medicines at the local dispensary', photo: 'https://images.unsplash.com/photo-1538108149393-cebb47ac00f2?auto=format&fit=crop&w=800&q=80' },
    { desc: 'Mosquito breeding in stagnant water near hospital', photo: 'https://images.unsplash.com/photo-1563212046-6085a691fbcc?auto=format&fit=crop&w=800&q=80' },
    { desc: 'Lack of doctors available today', photo: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80' }
  ],
  Education: [
    { desc: 'School building roof is leaking', photo: 'https://images.unsplash.com/photo-1532054238729-e85df649f8eb?auto=format&fit=crop&w=800&q=80' },
    { desc: 'Mid-day meal quality is very poor', photo: 'https://images.unsplash.com/photo-1544146059-e93ffab19b48?auto=format&fit=crop&w=800&q=80' },
    { desc: 'Shortage of teachers in primary classes', photo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80' },
    { desc: 'No drinking water facility in the school', photo: 'https://images.unsplash.com/photo-1523455799580-2804b4070a2f?auto=format&fit=crop&w=800&q=80' }
  ]
};

const statuses = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  return date;
};

const seedDatabase = async () => {
  try {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // 0. Clean up previous dummy data to avoid clutter
    console.log('Cleaning up old dummy data...');
    const dummyUsersList = await User.find({ email: /@example\.com$/ });
    const dummyUserIds = dummyUsersList.map(u => u._id);
    await Issue.deleteMany({ citizenId: { $in: dummyUserIds } });
    await User.deleteMany({ email: /@example\.com$/ });
    console.log('Old dummy data cleared.');

    // 1. Create dummy citizens
    console.log('Creating dummy users...');
    const users = [];
    const passwordHash = await bcrypt.hash('password123', 10);
    
    for (let i = 0; i < 5; i++) {
      const user = new User({
        fullName: `${getRandom(indianFirstNames)} ${getRandom(indianLastNames)}`,
        phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        email: `citizen${i + Date.now()}@example.com`,
        passwordHash,
        role: 'citizen'
      });
      await user.save();
      users.push(user);
    }
    console.log(`Created ${users.length} dummy citizens.`);

    // 2. Generate 50 perfectly contextual issues
    console.log('Generating 50 highly contextual dummy reports...');
    let createdIssues = 0;
    
    for (let i = 0; i < 50; i++) {
      const citizen = getRandom(users);
      
      // 40% chance for Health, 60% random among the rest
      let department;
      if (Math.random() < 0.4) {
          department = 'Health';
      } else {
          department = getRandom(Object.keys(contextualIssues).filter(d => d !== 'Health'));
      }
      
      // Get a specific contextual scenario
      const scenario = getRandom(contextualIssues[department]);
      const description = scenario.desc;
      const photoUrl = scenario.photo;
      
      const location = getRandom(locations) + `, ${Math.floor(Math.random() * 100) + 1} Cross`;
      
      // 80% chance for Resolved to improve ratings
      let status;
      const randStatus = Math.random();
      if (randStatus < 0.8) {
          status = 'Resolved';
      } else if (randStatus < 0.9) {
          status = 'In Progress';
      } else {
          status = getRandom(['Submitted', 'Assigned']);
      }
      const createdAt = getRandomDate();
      
      const issueData = {
        token: crypto.randomBytes(4).toString('hex').toUpperCase(),
        citizenId: citizen._id,
        description,
        department,
        location,
        photoUrl,
        status,
        createdAt,
      };

      if (status === 'Resolved') {
          const resolvedDate = new Date(createdAt);
          resolvedDate.setDate(resolvedDate.getDate() + Math.floor(Math.random() * 5) + 1);
          issueData.resolvedAt = resolvedDate;
          issueData.officerNotes = 'Issue has been verified and resolved successfully by the field team.';
      } else if (status === 'In Progress' || status === 'Assigned') {
          issueData.officerNotes = 'Team has been assigned and work will begin shortly.';
      }

      await Issue.create(issueData);
      createdIssues++;
    }

    console.log(`Successfully generated ${createdIssues} contextual reports.`);
    console.log('Seed completed successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();
