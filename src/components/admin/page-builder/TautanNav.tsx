import Link from "next/link";

/**
 * Tautan "Page Builder" untuk sidebar admin Payload
 * (`admin.components.afterNavLinks`).
 */
export function TautanNav() {
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
        color: "#4b5563",
        background: "transparent",
      }}
    >
      Page Builder
    </Link>
  );
}

export default TautanNav;
