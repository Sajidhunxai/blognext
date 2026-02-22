import dynamic from "next/dynamic";

const NewPostForm = dynamic(() => import("@/components/NewPostForm"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  ),
});

export default function NewPostPage() {
  return <NewPostForm />;
}
