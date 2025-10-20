import { BreadcrumbNavbar } from "@/core/shared/components/BreadCrumNavbar";
import { ThemeToogle } from "@/core/shared/components/ThemeToogle";
import { ThemeProvider } from "@/core/shared/providers/theme-provider";
import { Separator } from "@/core/shared/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/core/shared/ui/sidebar";
import { AppSidebar } from "@/core/shared/ui/sidebar/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-screen">
          <header className="sticky bg-white dark:bg-black top-0 z-50 flex justify-between w-full h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <BreadcrumbNavbar />
            </div>
            <div className="mr-10">
              <ThemeToogle />
            </div>
          </header>
          <div className="flex-1 pt-4 px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 min-w-0">
            <div className="w-full max-w-full">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
