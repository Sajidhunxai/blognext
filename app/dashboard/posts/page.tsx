import { prisma } from "@/lib/prisma";
import PostsList from "@/components/PostsList";

type Props = {
  searchParams?: { 
    page?: string;
    search?: string;
    status?: string;
    categoryId?: string;
  };
};

export default async function PostsPage({ searchParams }: Props) {
  const page = parseInt(searchParams?.page || "1", 10);
  const limit = 20; 
  const skip = (page - 1) * limit;

  // Build where clause for filtering
  const where: any = {};
  
  if (searchParams?.search?.trim()) {
    // Escape regex metacharacters so Prisma's MongoDB insensitive mode works safely
    const term = searchParams.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    where.title = {
      contains: term,
      mode: "insensitive",
    };
  }
  
  if (searchParams?.status === "published") {
    where.published = true;
  } else if (searchParams?.status === "draft") {
    where.published = false;
  }
  
  if (searchParams?.categoryId && searchParams.categoryId !== "all") {
    where.categoryId = searchParams.categoryId;
  }

  // Fetch posts, total count, and categories
  const [postsData, totalPosts, categories] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Map posts to ensure author is never null
  const posts = postsData.map(post => ({
    ...post,
    author: post.author || { 
      id: '', 
      name: 'Unknown', 
      email: 'unknown@example.com',
      password: '',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }));

  const totalPages = Math.ceil(totalPosts / limit);

  return (
    <PostsList
      initialPosts={posts}
      totalPosts={totalPosts}
      categories={categories}
      currentPage={page}
      totalPages={totalPages}
    />
  );
}

