/**
 * Admin Setup Script
 * 
 * This script helps you create initial admin accounts.
 * Run this after setting up your environment variables.
 * 
 * Usage:
 * node scripts/setup-admin.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupAdmin() {
  console.log('\n🚀 Math Olympiad Platform - Admin Setup\n');
  console.log('This script will help you create initial admin accounts.\n');

  try {
    // Check if server is running
    console.log('📋 Setup Instructions:');
    console.log('1. Make sure your Next.js server is running (npm run dev)');
    console.log('2. Ensure your MongoDB connection is working');
    console.log('3. Set ADMIN_INIT_KEY in your .env.local file\n');

    const baseUrl = await question('Enter your app URL (default: http://localhost:3000): ');
    const appUrl = baseUrl.trim() || 'http://localhost:3000';

    const initKey = await question('Enter your ADMIN_INIT_KEY: ');
    if (!initKey.trim()) {
      console.log('❌ ADMIN_INIT_KEY is required');
      process.exit(1);
    }

    console.log('\n👑 Super Administrator Details:');
    const superAdminName = await question('Super Admin Name: ');
    const superAdminEmail = await question('Super Admin Email: ');
    const superAdminPassword = await question('Super Admin Password: ');

    console.log('\n👨‍💼 Regular Administrator Details (optional):');
    const adminName = await question('Admin Name (leave empty to skip): ');
    let adminEmail = '';
    let adminPassword = '';
    
    if (adminName.trim()) {
      adminEmail = await question('Admin Email: ');
      adminPassword = await question('Admin Password: ');
    }

    console.log('\n🔄 Creating admin accounts...');

    const response = await fetch(`${appUrl}/api/admin/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        superAdminName: superAdminName.trim(),
        superAdminEmail: superAdminEmail.trim(),
        superAdminPassword: superAdminPassword.trim(),
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim(),
        adminPassword: adminPassword.trim(),
        initKey: initKey.trim()
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ Admin accounts created successfully!');
      console.log('\n📋 Created accounts:');
      data.users.forEach(user => {
        console.log(`- ${user.role}: ${user.email}`);
      });
      console.log(`\n🌐 You can now sign in at: ${appUrl}/auth/signin`);
      console.log('🔒 Use the email and password you just created to access the admin panel.');
    } else {
      console.log('\n❌ Error creating admin accounts:');
      console.log(data.error);
    }

  } catch (error) {
    console.log('\n❌ Error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('- Your Next.js server is running');
    console.log('- MongoDB is connected');
    console.log('- ADMIN_INIT_KEY is set in .env.local');
  }

  rl.close();
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ or you need to install node-fetch');
  console.log('Alternative: Use the web interface at /admin/init');
  process.exit(1);
}

setupAdmin();
