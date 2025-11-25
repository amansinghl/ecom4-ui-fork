"use client";

import { IconBolt } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

import { SideBarMainNavItems } from "@/types/sidebar";

export function NavMain({ items }: SideBarMainNavItems) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Track which collapsible items are open
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.items) {
        const isSubItemActive = item.items.some(
          (subItem) => subItem.url === pathname
        );
        initial[item.title] = isSubItemActive;
      }
    });
    return initial;
  });

  // Update open state when pathname changes
  useEffect(() => {
    items.forEach((item) => {
      if (item.items) {
        const isSubItemActive = item.items.some(
          (subItem) => subItem.url === pathname
        );
        if (isSubItemActive) {
          setOpenItems((prev) => ({ ...prev, [item.title]: true }));
        }
      }
    });
  }, [pathname, items]);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 cursor-pointer">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconBolt />
              <span>Quick Ship</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const hasSubItems = item.items && item.items.length > 0;
            const isSubItemActive = hasSubItems
              ? item.items?.some((subItem) => subItem.url === pathname)
              : false;
            const isItemActive = item.url === pathname || isSubItemActive;

            if (hasSubItems) {
              const isOpen = openItems[item.title] ?? false;
              
              // When collapsed, use dropdown menu for sub-items
              if (isCollapsed) {
                return (
                  <DropdownMenu key={item.title}>
                    <SidebarMenuItem>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                          isActive={isItemActive}
                          className="cursor-pointer"
                          tooltip={item.title}
                        >
                          {item.icon && <item.icon />}
                          <span className="font-medium">{item.title}</span>
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="right"
                        align="start"
                        className="w-48"
                      >
                        {item.items?.map((subItem) => (
                          <DropdownMenuItem
                            key={subItem.title}
                            className={`cursor-pointer ${
                              subItem.url === pathname
                                ? "bg-accent text-accent-foreground"
                                : ""
                            }`}
                            onClick={() => {
                              router.push(subItem.url);
                            }}
                          >
                            {subItem.title}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </SidebarMenuItem>
                  </DropdownMenu>
                );
              }

              // When expanded, use collapsible
              return (
                <Collapsible
                  key={item.title}
                  open={isOpen}
                  onOpenChange={(open) =>
                    setOpenItems((prev) => ({ ...prev, [item.title]: open }))
                  }
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isItemActive}
                        className="cursor-pointer"
                        tooltip={item.title}
                      >
                        {item.icon && <item.icon />}
                        <span className="font-medium">{item.title}</span>
                        <ChevronRight
                          className={`ml-auto size-4 transition-transform duration-200 ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={subItem.url === pathname}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url}>
                  <SidebarMenuButton
                    isActive={item?.url === pathname}
                    className="cursor-pointer"
                    tooltip={item.title}
                  >
                    {item.icon && <item.icon />}
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
