import { Home, BarChart3, PieChart, TrendingUp, Users, Settings, FileText, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'mbp', label: 'MBP Dashboard', icon: DollarSign },
    { id: 'dashboard', label: 'Executive', icon: Home },
    { id: 'revenue', label: 'Revenue', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'growth', label: 'Growth', icon: TrendingUp },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-sidebar"
    )}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full justify-start text-sidebar-foreground"
          >
            <BarChart3 className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Menu</span>}
          </Button>
        </div>
        
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Button
                    variant={activeSection === item.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      activeSection === item.id 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    onClick={() => onSectionChange(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-2">{item.label}</span>}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;