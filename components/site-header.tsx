"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/theme-toggle";
import { NavUser } from "@/components/nav-user";
import { Headset, Wallet, RefreshCcw } from "lucide-react";

import { external_links } from "@/components/data";
import useUserStore from "@/store/user";
import { refreshCreditBalance } from "@/lib/client_utils";

export function SiteHeader() {
  const { login, user, token } = useUserStore();
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium hidden sm:block">Documents</h1>
        <div className="ml-auto flex gap-2 items-center">
          <div className="md:flex items-center gap-2 hidden">
            <Button asChild>
              <a href={external_links.support_link.url}>
                <Headset /> Support: +91-22-48934295
              </a>
            </Button>
            <ModeToggle />
          </div>
          <Button
            onClick={() => refreshCreditBalance(token, user, login)}
            variant="outline"
            className="rounded-full"
          >
            <Wallet />₹ {user?.entity?.credit_balance ?? "00.00"}
            <RefreshCcw color="#15803d" />
          </Button>
          <NavUser isLoadedOnHeader user={user} />
        </div>
      </div>
    </header>
  );
}
