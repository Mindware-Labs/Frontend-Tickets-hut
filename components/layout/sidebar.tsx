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
  SquareTerminal,
  Send,
  LayoutDashboard,
  Ticket,
  Megaphone,
  Users,
  BarChart3,
  PhoneCall,
  ChevronRight,
  User,
  Settings2,
  UserCircle,
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
  useSidebar,
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
import { HelpCircle, Mail } from "lucide-react";
import Image from "next/image";

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
    {
      title: "Yards",
      url: "/yards",
      icon: Building,
      items: [],
    },
    {
      title: "Landlords",
      url: "/landlords",
      icon: User,
      items: [
        {
          title: "All Landlords",
          url: "/landlords",
        },
        {
          title: "Reports",
          url: "/reports/landlords",
        },
      ],
    },
    {
      title: "Campaigns",
      url: "/campaigns",
      icon: Megaphone,
      items: [
        {
          title: "All Campaigns",
          url: "/campaigns",
        },
        {
          title: "Reports",
          url: "/reports/campaigns",
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
      url: "/support",
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
  const { role, setRole } = useRole();
  const { state } = useSidebar();

  // Filtrar navegación para agentes: cambiar Dashboard a agent-dashboard, esconder Reports y quitar sub-items de Landlords/Campaigns
  const normalizedRole = role?.toString().toLowerCase();
  const filteredNavMain =
    normalizedRole === "agent"
      ? data.navMain
          .filter((item) => item.title !== "Reports")
          .map((item) => {
            // Cambiar Dashboard para agentes
            if (item.title === "Dashboard") {
              return { ...item, url: "/agent-dashboard" };
            }
            // Quitar sub-items de Landlords/Campaigns
            if (item.title === "Landlords" || item.title === "Campaigns") {
              return { ...item, items: [] };
            }
            return item;
          })
      : data.navMain;

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
    <Sidebar 
      collapsible="icon" 
      className="bg-[#0a0e27] text-white border-r border-white/10"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard" className="relative overflow-hidden">
                {/* Subtle background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Image logo - replaced the Command icon */}
                <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 backdrop-blur-sm overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/LOGO CQ-10.png"
                      alt="Center Quest Logo"
                      fill
                      className="object-contain scale-210" /* Zoom 125% */
                      sizes="40px"
                      priority
                    />
                  </div>
                </div>

                {state === "collapsed" ? (
                  <div className="flex flex-1 items-center justify-start relative z-10">
                    <Image
                      src="/images/LOGO CQ-10.png"
                      alt="Center Quest"
                      width={110}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="grid flex-1 text-left text-sm leading-tight relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-bold text-white">
                        Center Quest
                      </span>
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <span className="truncate text-xs text-white/70 mt-0.5">
                      Tickets System
                    </span>
                  </div>
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70">Platform</SidebarGroupLabel>
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
                        {item.icon && (
                          <item.icon className="stroke-white stroke-2" />
                        )}
                        <span className="text-white">{item.title}</span>
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
                        {item.icon && (
                          <item.icon className="stroke-white stroke-2" />
                        )}
                        <span className="text-white">{item.title}</span>
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
                        {item.icon && (
                          <item.icon className="stroke-white stroke-2" />
                        )}
                        <span className="text-white">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }
              // Everything else (collapsible)
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
                        {item.icon && (
                          <item.icon className="stroke-white stroke-2" />
                        )}
                        <span className="text-white">{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 stroke-white stroke-2" />
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

        {/* Core Sections (Management) - SIEMPRE visible */}
        <SidebarGroup>
        <SidebarGroupLabel className="text-white/70">Management</SidebarGroupLabel>
        <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Customers"
                isActive={pathname.startsWith("/customers")}
                className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground relative"
              >
                <a href="/customers">
                  {pathname.startsWith("/customers") && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                  )}
                  <Users className="stroke-white stroke-2" />
                  <span>Customer Management</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {normalizedRole !== "agent" && (
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
                    <Users className="stroke-white stroke-2" />
                    <span>User Management</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Profile"
                isActive={pathname.startsWith("/profile")}
                className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground relative"
              >
                <a href="/profile">
                  {pathname.startsWith("/profile") && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                  )}
                  <UserCircle className="stroke-white stroke-2" />
                  <span>Profile</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Secondary (Support) */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="sm">
                    <a href={item.url}>
                      <item.icon className="stroke-white stroke-2" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Separator - only show when expanded */}
              {state === "expanded" && (
                <>
                  <SidebarSeparator className="my-2 bg-white/20" />

                  {/* Copyright footer - only show when expanded */}
                  <div className="px-2 py-3">
                    <footer className="text-xs text-white/70 text-center space-y-1">
                      <div>© 2025 Mindware Labs.</div>
                      <div>All Rights Reserved</div>
                    </footer>
                  </div>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
