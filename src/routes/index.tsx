import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";

const stats = [
  {
    label: "Total Revenue",
    value: "$48,260",
    delta: "+12.4%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    label: "Active Sessions",
    value: "2,840",
    delta: "+5.2%",
    trend: "up" as const,
    icon: Activity,
  },
  {
    label: "Conversion Rate",
    value: "3.8%",
    delta: "-0.6%",
    trend: "down" as const,
    icon: TrendingDown,
  },
  {
    label: "Avg. Order Value",
    value: "$126",
    delta: "+8.1%",
    trend: "up" as const,
    icon: TrendingUp,
  },
];

const activity = [
  { id: 1, text: "New project “Onboarding Flow” was created", time: "2m ago" },
  { id: 2, text: "Payment of $1,240 received from Acme Inc.", time: "1h ago" },
  { id: 3, text: "Heitorito updated billing settings", time: "3h ago" },
  { id: 4, text: "Weekly analytics report generated", time: "5h ago" },
];

// Simple inline bar chart rendered with divs — no chart dependency needed.
const bars = [40, 65, 52, 78, 60, 88, 72, 95, 68, 82, 58, 90];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nirvana — Dashboard" },
      {
        name: "description",
        content:
          "Nirvana dashboard — a sleek, minimalist control center for your workspace.",
      },
      { property: "og:title", content: "Nirvana — Dashboard" },
      {
        property: "og:description",
        content: "A sleek, minimalist control center for your workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <DashboardShell
      title="Dashboard"
      description="Welcome back, Heitorito. Here's what's happening today."
    >
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                <span
                  className={
                    stat.trend === "up"
                      ? "font-medium text-primary"
                      : "font-medium text-muted-foreground"
                  }
                >
                  {stat.delta}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + activity */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="rounded-xl lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly performance for the year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-56 items-end justify-between gap-2">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="group flex-1 rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                  style={{ height: `${h}%` }}
                  title={`Month ${i + 1}`}
                />
              ))}
            </div>
            <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
              {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map(
                (m, i) => (
                  <span key={i}>{m}</span>
                ),
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events in your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {activity.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm leading-snug text-foreground">
                      {item.text}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
