
import AuthGuard from "@/app/components/auth/AuthGuard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard requireAdmin={true}>
            <div className="min-h-screen bg-background text-white flex flex-col">
                {children}
            </div>
        </AuthGuard>
    );
}
