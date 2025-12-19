const { PrismaClient } = require('@prisma/client');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing posts with invalid authors...');

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

  console.log(`Admin user ID: ${admin.id}`);

  // Get all valid user IDs
  const users = await prisma.user.findMany({
    select: { id: true },
  });
  const validUserIds = new Set(users.map(u => u.id));
  console.log(`Found ${validUserIds.size} valid users`);

  // Use MongoDB client to check posts
  const mongoUrl = process.env.DATABASE_URL;
  if (!mongoUrl) {
    throw new Error('DATABASE_URL not found in environment');
  }

  const client = new MongoClient(mongoUrl);
  
  try {
    await client.connect();
    const db = client.db();
    const postsCollection = db.collection('Post');
    
    // Get all posts
    const allPosts = await postsCollection.find({}).toArray();
    console.log(`Checking ${allPosts.length} posts...`);
    
    let fixedCount = 0;
    
    for (const post of allPosts) {
      // Check if authorId is valid
      if (!post.authorId || !validUserIds.has(post.authorId.toString())) {
        console.log(`Fixing post: ${post.title} (invalid author: ${post.authorId})`);
        
        await postsCollection.updateOne(
          { _id: post._id },
          { $set: { authorId: new ObjectId(admin.id) } }
        );
        
        fixedCount++;
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} posts with invalid authors`);
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

