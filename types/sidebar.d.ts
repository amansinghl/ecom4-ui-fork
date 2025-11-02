import { type Icon } from "@tabler/icons-react";

export type SideBarMainNavItem = {
  title: string;
  url: string;
  icon?: Icon;
  active?: boolean;
};

export type SideBarMainNavItems = {
  items: SideBarMainNavItem[];
};

export type SideBarSecondaryNavItem = {
  title: string;
  url: string;
  icon: Icon;
  external?: boolean;
  new_tab?: boolean;
};

export type SideBarSecondaryNavItems = {
  items: SideBarSecondaryNavItem[];
};
