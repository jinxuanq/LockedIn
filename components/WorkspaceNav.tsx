"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function WorkspaceNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  if (!user) return null;
  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/messages", label: "Messages" },
    { href: "/schedule", label: "Schedule" },
    { href: "/progress", label: "Progress" },
    { href: "/profile", label: "Profile" },
    ...(user.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];
  return (
    <nav aria-label="Workspace" className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                active ? "border-[#8B1E3F] text-[#001F3F]" : "border-transparent text-gray-500 hover:text-[#001F3F]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
