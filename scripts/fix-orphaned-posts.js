const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing orphaned posts...');

  // Get or create admin user
  let admin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!admin) {
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
      },
    });
    console.log('✅ Admin user created');
  }

  // Use MongoDB client directly to handle null values
  const mongoUrl = process.env.DATABASE_URL;
  if (!mongoUrl) {
    throw new Error('DATABASE_URL not found in environment');
  }

  const client = new MongoClient(mongoUrl);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const postsCollection = db.collection('Post');
    
    // Find posts with null or missing authorId
    const orphanedPosts = await postsCollection.find({
      $or: [
        { authorId: null },
        { authorId: { $exists: false } }
      ]
    }).toArray();
    
    console.log(`Found ${orphanedPosts.length} orphaned posts`);
    
    if (orphanedPosts.length > 0) {
      // Update all orphaned posts
      const result = await postsCollection.updateMany(
        {
          $or: [
            { authorId: null },
            { authorId: { $exists: false } }
          ]
        },
        {
          $set: { authorId: new ObjectId(admin.id) }
        }
      );
      
      console.log(`✅ Fixed ${result.modifiedCount} orphaned posts`);
    } else {
      console.log('✅ No orphaned posts found');
    }
  } finally {
    await client.close();
  }

  console.log('🎉 All done!');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

