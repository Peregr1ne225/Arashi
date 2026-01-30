
import AdminLayout from "@/app/components/admin/AdminLayout";

export default function RootAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}
