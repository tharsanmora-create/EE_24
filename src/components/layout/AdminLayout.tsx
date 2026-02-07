
import { useState } from "react";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 admin-full py-8">
        <div className="grid lg:grid-cols-[200px_1fr] gap-6 admin-shell admin-shell-left">
          {/* Sidebar toggle button for mobile */}
          <button
            className="lg:hidden btn-secondary mb-4"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            ☰ Admin Menu
          </button>
          {/* Sidebar overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div
            className={`lg:block ${sidebarOpen ? "block" : "hidden"} z-50 lg:z-auto lg:relative fixed top-0 left-0 h-full w-64 bg-white/10 lg:bg-transparent`}
          >
            <AdminSidebar onNav={() => setSidebarOpen(false)} />
          </div>
          <div className="glass-card p-6">
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLayout;
