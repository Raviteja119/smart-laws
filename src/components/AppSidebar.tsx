import {
  LayoutDashboard, Upload, FileText, MessageSquare, GitCompare,
  Gauge, Settings, Scale, ChevronLeft, Menu, LogOut,
  Network, Shield, GitBranch, Library,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { NotificationBell } from "@/components/NotificationBell";
import { GlobalSearch } from "@/components/GlobalSearch";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const mainNav = [
  { key: "dashboard", url: "/dashboard", icon: LayoutDashboard },
  { key: "upload_bill", url: "/upload", icon: Upload },
  { key: "document_analysis", url: "/analysis", icon: FileText },
  { key: "ask_the_bill", url: "/chat", icon: MessageSquare },
];

const toolsNav = [
  { key: "bill_comparison", url: "/comparison", icon: GitCompare },
  { key: "bill_directory", url: "/bill-directory", icon: Library },
  { key: "knowledge_graph", url: "/knowledge-graph", icon: Network },
  { key: "compliance_checker", url: "/compliance", icon: Shield },
  { key: "amendment_tracker", url: "/amendments", icon: GitBranch },
  { key: "token_efficiency", url: "/tokens", icon: Gauge },
];

const settingsNav = [
  { key: "settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const initials = user?.user_metadata?.display_name
    ? user.user_metadata.display_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "U";

  const renderNavItems = (items: typeof mainNav) =>
    items.map((item) => {
      const isActive = location.pathname === item.url;
      const title = t(item.key);
      return (
        <SidebarMenuItem key={item.key}>
          <SidebarMenuButton asChild isActive={isActive} tooltip={title}>
            <NavLink
              to={item.url}
              end
              className="gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary">
            <Scale className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-sidebar-accent-foreground truncate">AI Legislative</span>
              <span className="text-xs text-sidebar-muted truncate">Citizen Dashboard</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider px-3 mb-1">Main</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(mainNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider px-3 mb-1">Tools</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(toolsNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(settingsNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        <div className="flex items-center gap-3 px-1">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium text-sidebar-accent-foreground truncate">
                {user?.user_metadata?.display_name || user?.email}
              </p>
              <p className="text-[10px] text-sidebar-muted truncate">{user?.email}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={toggleSidebar} className="flex items-center justify-center h-8 w-8 rounded-md text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          {!collapsed && (
            <>
              <GlobalSearch />
              <NotificationBell />
              <button onClick={signOut} className="flex items-center justify-center h-8 w-8 rounded-md text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors ml-auto" title={t("sign_out")}>
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
