import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/theme-toggle";
import { IconHelp } from "@tabler/icons-react";
import { NavUser } from "./nav-user";
import data, { external_links } from "./data";
import { TvMinimalPlay, Headset } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Documents</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild>
            <a href={external_links.support_link.url}>
              <Headset /> Support: +91-22-48934295
            </a>
          </Button>
          <Button asChild>
            <a
              href={external_links.video_guides_link.url}
              target={external_links.video_guides_link.target}
              className="flex align-middle"
            >
              <TvMinimalPlay /> Video Guides
            </a>
          </Button>
          <Button asChild>
            <a
              href={external_links.knowledge_base_link.url}
              target={external_links.knowledge_base_link.target}
              className="flex align-middle"
            >
              <IconHelp /> Knowledge base
            </a>
          </Button>
          <ModeToggle />
          <NavUser isLoadedOnHeader user={data.user} />
        </div>
      </div>
    </header>
  );
}
