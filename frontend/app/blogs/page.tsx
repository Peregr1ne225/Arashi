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
        <div className="min-h-screen bg-[#FDFDFB] py-4 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Hero Section */}
                <div className="relative bg-[#0e4d80] text-white overflow-hidden rounded-[2.5rem] shadow-2xl mb-16 mx-4 md:mx-0">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 p-10 md:p-16 flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold font-istok uppercase tracking-widest mb-6 text-blue-100">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                            Community Hub
                        </div>

                        <h1 className="font-koulen text-6xl md:text-8xl tracking-wider text-white mb-6 drop-shadow-lg leading-none">
                            COMMUNITY <span className="text-blue-200">VOICES</span>
                        </h1>

                        <p className="font-istok text-blue-100 text-lg max-w-2xl mx-auto mb-10 leading-relaxed opacity-90">
                            Discover stories, styles, and inspiration from the Arashi community. Join the conversation and share your own journey.
                        </p>

                        <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
                            <div className="flex gap-4">
                                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center min-w-[140px]">
                                    <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest mb-1">Total Stories</p>
                                    <p className="text-3xl font-koulen leading-none">{initialCount}</p>
                                </div>
                            </div>
                        </div>

                        <CreatePostButton />
                    </div>
                </div>

                {/* Main Content Feed */}
                <main className="px-4 md:px-0 max-w-6xl mx-auto">
                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 rounded-[2rem] p-12 text-center border border-red-100 mb-8 max-w-2xl mx-auto">
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
    );
}
