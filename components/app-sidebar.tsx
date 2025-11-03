"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import useUserStore from "@/store/user";

import data from "./data";
import { verifyUserLogin } from "@/lib/client_utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isLoggedIn, login, user, logout } = useUserStore();

  React.useEffect(() => {
    verifyUserLogin(isLoggedIn, login, logout);
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="`data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <div>
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  <AvatarImage
                    src={user?.entity?.logo}
                    alt={user?.entity?.entity_name}
                  />
                </Avatar>
                <span className="text-base font-semibold">
                  {user?.entity?.entity_name}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
