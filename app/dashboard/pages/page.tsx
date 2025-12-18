import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PagesPage() {
  let pages = [];
  try {
    if (prisma && 'page' in prisma) {
      pages = await (prisma as any).page.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else {
      console.error("Page model not found in Prisma Client. Please restart the dev server.");
    }
  } catch (error) {
    console.error("Error fetching pages:", error);
  }

  return (
    <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pages</h1>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Link
              href="/dashboard"
              className="bg-gray-100 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-200 transition text-sm sm:text-base text-center"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/dashboard/pages/new"
              className="bg-button text-button hover:bg-secondary px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition text-sm sm:text-base text-center"
            >
              New Page
            </Link>
          </div>
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
                    Slug
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
                {pages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm sm:text-base">
                      No pages yet. Create your first page!
                    </td>
                  </tr>
                ) : (
                  pages.map((page:any) => (
                    <tr key={page.id} className="hover:bg-gray-50 transition">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {page.title}
                        </div>
                        <div className="text-xs text-gray-500 sm:hidden mt-1">/{page.slug}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm text-gray-500">/{page.slug}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span
                          className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            page.published
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {page.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {new Date(page.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                          <Link
                            href={`/dashboard/pages/${page.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 sm:mr-4"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/pages/${page.slug}`}
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
    </>
  );
}

