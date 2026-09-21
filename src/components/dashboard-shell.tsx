import { type ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Search, Bell } from "lucide-react";

export function DashboardShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex flex-1 flex-col">
          {/* Top navigation bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
            <SidebarTrigger className="-ml-1" />

            <div className="relative ml-auto hidden w-full max-w-sm md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search…"
                className="h-9 w-full rounded-lg border border-input bg-muted/40 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-background"
              />
            </div>

            <button
              type="button"
              aria-label="Notifications"
              className="relative ml-auto inline-flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted md:ml-0"
            >
              <Bell className="size-5" />
              <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-primary" />
            </button>

            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              HE
            </div>
          </header>

          {/* Central content area */}
          <main className="flex-1 px-4 py-8 md:px-8 md:py-10">
            <div className="mx-auto w-full max-w-6xl">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  {title}
                </h1>
                {description && (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
