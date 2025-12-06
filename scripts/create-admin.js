const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Admin User';

  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'admin',
      },
    });
    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ User with this email already exists');
    } else {
      console.error('Error creating admin:', error);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

