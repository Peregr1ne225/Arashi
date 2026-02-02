import BlogFeed from "@/app/components/blog/BlogFeed";
import BlogSidebar from "@/app/components/blog/BlogSidebar";
import { blogsApi } from "@/app/lib/api/blogs";
import { BlogPost } from "@/app/types/blog";

export const metadata = {
    title: "Community Blog - KawJaw",
    description: "Read the latest posts from our community",
};

export default async function BlogsPage() {
    let initialPosts: BlogPost[] = [];
    let initialCount = 0;
    let error = null;

    try {
        const data = await blogsApi.getPosts({
            page: 1,
            page_size: 9,
            ordering: "-created_at"
        });
        initialPosts = data.results;
        initialCount = data.count;
    } catch (err) {
        error = "Failed to load blog posts";
        console.error(err);
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-20">
            {/* Top spacing for navbar */}
            <div className="h-6" />

            <div className="flex flex-col lg:flex-row gap-8 px-4 lg:px-10">
                {/* Left Sidebar */}
                <aside className="w-full lg:w-80 shrink-0">
                    <BlogSidebar />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1">
                    {/* Error State */}
                    {error && (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 mb-8">
                            <div className="text-red-500 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 font-istok">{error}</p>
                        </div>
                    )}

                    {!error && (
                        <BlogFeed initialPosts={initialPosts} initialCount={initialCount} />
                    )}
                </main>
            </div>
        </div>
    );
}
