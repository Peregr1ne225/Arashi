import BlogFeed from "@/app/components/blog/BlogFeed";
import CreatePostButton from "@/app/components/blog/CreatePostButton";
import { blogsApi } from "@/app/lib/api/blogs";
import { BlogPost } from "@/app/types/blog";

export const metadata = {
    title: "Community Blog - Arashi",
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
        <div className="min-h-screen bg-[#FDFDFB] pb-20 pt-24 px-4">
            <div className="container mx-auto max-w-5xl">
                {/* Header Actions - Now outside the card */}
                <div className="flex items-center justify-between mb-10 relative px-4 md:px-0">
                    <div className="absolute left-1/2 -translate-x-1/2">
                        <h1 className="font-koulen text-[40px] md:text-[56px] text-[#0e4d80] leading-none text-center">
                            COMMUNITY
                        </h1>
                    </div>
                    <div className="ml-auto z-10">
                        <CreatePostButton />
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-4xl shadow-xl shadow-blue-900/5 p-8 md:p-12 border border-gray-100">
                    <main>
                        {/* Error State */}
                        {error && (
                            <div className="bg-red-50 rounded-2xl p-12 text-center border border-red-100 mb-8">
                                <div className="text-red-500 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 font-istok font-bold">{error}</p>
                            </div>
                        )}

                        {!error && (
                            <BlogFeed initialPosts={initialPosts} initialCount={initialCount} />
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
