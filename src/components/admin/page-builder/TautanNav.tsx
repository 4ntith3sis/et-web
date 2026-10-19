"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Tautan "Page Builder" untuk sidebar admin Payload
 * (`admin.components.afterNavLinks`). Ditandai aktif saat rute berada di
 * dalam `/admin/page-builder`.
 */
export function TautanNav() {
  const pathname = usePathname();
  const aktif = pathname?.startsWith("/admin/page-builder") ?? false;

  return (
    <Link
      href="/admin/page-builder"
      style={{
        display: "block",
        padding: "8px 12px",
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 600,
        textDecoration: "none",
        color: aktif ? "#111827" : "#4b5563",
        background: aktif ? "#f3f4f6" : "transparent",
      }}
    >
      Page Builder
    </Link>
  );
}

export default TautanNav;
