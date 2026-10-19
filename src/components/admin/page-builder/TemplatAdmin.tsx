import { DefaultTemplate } from "@payloadcms/next/templates";
import type { AdminViewServerProps } from "payload";
import type { ReactNode } from "react";

/**
 * Membungkus view kustom dengan template default admin Payload
 * (`DefaultTemplate`) sehingga sidebar, header, dan navigasi CMS tetap
 * tampil. Tanpa ini, view kustom dirender mentah tanpa chrome admin
 * (`templateType` kosong untuk view kustom).
 */
export function TemplatAdmin({
  props,
  viewType = "pageBuilder",
  children,
}: {
  props: AdminViewServerProps;
  viewType?: string;
  children: ReactNode;
}) {
  const { initPageResult, payload, user, i18n, params, searchParams, viewActions } = props;

  return (
    <DefaultTemplate
      i18n={i18n}
      locale={initPageResult.locale}
      params={params}
      payload={payload}
      permissions={initPageResult.permissions}
      req={initPageResult.req}
      searchParams={searchParams}
      user={user}
      viewActions={viewActions}
      viewType={viewType}
      visibleEntities={initPageResult.visibleEntities}
    >
      {children}
    </DefaultTemplate>
  );
}

export default TemplatAdmin;
