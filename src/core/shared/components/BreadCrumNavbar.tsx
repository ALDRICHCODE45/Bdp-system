"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/core/shared/ui/breadcrumb";
import { usePathname } from "next/navigation";

export const BreadcrumbNavbar = () => {
  const pathname = usePathname();
  const pathNameToShow = pathname.split("/").at(1)?.toUpperCase();

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="min-w-0 flex-nowrap gap-1.5 overflow-hidden break-normal sm:gap-2.5">
        <BreadcrumbItem className="hidden shrink-0 sm:inline-flex">
          <BreadcrumbLink>BDP System</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden shrink-0 sm:block" />
        <BreadcrumbItem className="min-w-0 flex-1">
          <BreadcrumbPage className="block truncate whitespace-nowrap">
            {pathNameToShow}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
