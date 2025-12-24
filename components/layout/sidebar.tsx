"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Send,
  LayoutDashboard,
  Ticket,
  Megaphone,
  Users,
  BarChart3,
  PhoneCall,
  Settings,
  ChevronRight,
  User,
  CreditCard,
  LogOut,
  Sparkles,
  MoreHorizontal,
  Calendar,
  FileText,
  ShieldCheck,
  Headphones,
  Activity,
  Building,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useRole } from "@/components/providers/role-provider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// User Mock Data
const user = {
  name: "Gerald Luciano",
  email: "gerald@example.com",
  avatar: "/avatars/shadcn.jpg",
};

// Navigation Data
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      items: [],
    },
    {
      title: "Tickets",
      url: "/tickets",
      icon: Ticket,
      items: [],
    },
<<<<<<< HEAD
    {
=======
     {
>>>>>>> adde7be574a51010ddb2e928b620c05818d79552
      title: "Yards",
      url: "/yards",
      icon: Building,
      items: [],
    },
<<<<<<< HEAD
    /*{
      title: "Communication",
      url: "/communication",
      icon: Headphones,
      items: [
        {
          title: "Live Calls",
          url: "/calls/live",
        },
        {
          title: "Call History",
          url: "/calls/history",
        },
        {
          title: "Voicemails",
          url: "/calls/voicemail",
        },
      ]
    },*/
=======
>>>>>>> adde7be574a51010ddb2e928b620c05818d79552
    {
      title: "Campaigns",
      url: "/campaigns",
      icon: Megaphone,
      items: [
        {
          title: "Active Campaigns",
          url: "/campaigns",
        },
        {
          title: "Archived",
          url: "/campaigns/archived",
        },
      ],
    },
    {
      title: "Knowledge",
      url: "/knowledge",
      icon: BookOpen,
      items: [
        {
          title: "Rig Hut policies",
          url: "/Knowledge/policies",
        },
        {
          title: "Guides",
          url: "/Knowledge/Guides",
        },
      ],
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart3,
      items: [
        {
          title: "Performance",
          url: "/reports/performance",
        },
        {
          title: "Agent Stats",
          url: "/reports/agents",
        },

      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
 
  ],
  projects: [
    {
      name: "Call Center",
      url: "#",
      icon: PhoneCall,
    },
    {
      name: "Sales Team",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Support Team",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { role, setRole, isAdmin } = useRole();

  // Filter navigation based on role
  const filteredNavMain = data.navMain.filter((item) => {
    if (role === "Agent") {
      // Agents can see Platform, Tickets, Yards, Communication, Knowledge
      return [
        "Dashboard",
        "Tickets",
        "Yards",
        "Communication",
        "Knowledge Base",
      ].includes(item.title);
    }
    return true;
  });

  // Helper to check if a group is active
  const isGroupActive = (item: any) => {
    // Check if exact match on parent URL (rare) or specific child
    if (pathname === item.url) return true;
    // Check if any child matches
    if (
      item.items?.some(
        (sub: any) => pathname === sub.url || pathname.startsWith(sub.url)
      )
    )
      return true;
    return false;
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Pulse Ops</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Enterprise v2.0
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavMain.map((item) => {
              if (!item.items?.length) {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={active}
                      className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium relative overflow-hidden transition-all duration-200"
                    >
                      <a href={item.url}>
                        {active && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                        )}
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              } 
              if (item.title === "Dashboard") {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={active}
                      className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium relative overflow-hidden transition-all duration-200"
                    >
                      <a href={item.url}>
                        {active && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                        )}
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }
              if (item.title === "Yards") {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={active}
                      className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium relative overflow-hidden transition-all duration-200"
                    >
                      <a href={item.url}>
                        {active && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                        )}
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }
              // Resto igual (colapsable)
              const active = isGroupActive(item);
              return (
                <Collapsible
                  key={item.title}
                  asChild
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={active}
                        className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium relative overflow-hidden transition-all duration-200"
                      >
                        {active && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                        )}
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                              className="data-[active=true]:text-primary data-[active=true]:font-medium"
                            >
                              <a href={subItem.url}>
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Core Sections (Management) - Admin Only */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarMenu>
<<<<<<< HEAD
=======
              
>>>>>>> adde7be574a51010ddb2e928b620c05818d79552
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Users"
                  isActive={pathname.startsWith("/users")}
                  className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground relative"
                >
                  <a href="/users">
                    {pathname.startsWith("/users") && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                    )}
                    <Users />
                    <span>User Management</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Settings"
                  isActive={pathname.startsWith("/settings")}
                  className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground relative"
                >
                  <a href="/settings">
                    {pathname.startsWith("/settings") && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                    )}
                    <Settings2 />
                    <span>System Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Audit Logs">
                  <a href="/audit">
                    <ShieldCheck />
                    <span>Audit Logs</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Secondary (Support) */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="sm">
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* Role Simulator (Dev Only) */}
          <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between p-2 rounded-lg bg-sidebar-accent/50 mb-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Simulate Role
                </span>
                <Badge variant="outline" className="w-fit text-[10px] h-4 px-1">
                  {role}
                </Badge>
              </div>
              <Switch
                checked={role === "Admin"}
                onCheckedChange={(checked) =>
                  setRole(checked ? "Admin" : "Agent")
                }
                className="scale-75"
              />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
