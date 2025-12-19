import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PaginationWrapper from "@/components/PaginationWrapper";

type Props = {
  searchParams?: { page?: string };
};

export default async function PostsPage({ searchParams }: Props) {
  const page = parseInt(searchParams?.page || "1", 10);
  const limit = 20; 
  const skip = (page - 1) * limit;

  // Fetch posts and total count
  const [postsData, totalPosts] = await Promise.all([
    prisma.post.findMany({
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
    prisma.post.count(),
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
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Posts</h1>
        <Link
          href="/dashboard/posts/new"
          className="bg-button text-button hover:bg-secondary px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition text-sm sm:text-base whitespace-nowrap"
        >
          New Post
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
          <table className="w-full" style={{ minWidth: '640px' }}>
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Category
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Created
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm sm:text-base">
                    No posts yet. Create your first post!
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {post.title}
                      </div>
                      {post.category && (
                        <div className="text-xs text-gray-500 sm:hidden mt-1">
                          {post.category.name}
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                      {post.category ? (
                        <span className="text-sm text-gray-600">{post.category.name}</span>
                      ) : (
                        <span className="text-sm text-gray-400">Uncategorized</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span
                        className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                        <Link
                          href={`/dashboard/posts/${post.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 sm:mr-4"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/posts/${post.slug}`}
                          className="text-gray-600 hover:text-gray-900"
                          target="_blank"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <PaginationWrapper 
          currentPage={page} 
          totalPages={totalPages}
          baseUrl="/dashboard/posts"
        />
      )}
    </>
  );
}

