import {
  IconHelp,
  IconCashBanknote,
  IconUserDollar,
  IconDashboard,
  IconTruckDelivery,
  type Icon,
} from "@tabler/icons-react";

import {
  Package,
  Weight,
  Settings,
  User,
  Headset,
  TvMinimalPlay,
  BoxesIcon,
  ListTodoIcon,
  PackageCheckIcon,
  MapPinHouseIcon,
  Activity,
  Package2,
  Box,
} from "lucide-react";

export type SideBarMainNavSubItem = {
  title: string;
  url: string;
  icon?: Icon;
};

export type SideBarMainNavItem = {
  title: string;
  url: string;
  icon?: Icon;
  active?: boolean;
  items?: SideBarMainNavSubItem[];
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

export const external_links = {
  knowledge_base_link: {
    url: "https://techemails.gitbook.io/vamaship-ecom-3/",
    target: "_blank",
  },
  video_guides_link: {
    url: "https://www.youtube.com/@vamaship3755",
    target: "_blank",
  },
  support_link: {
    url: "tel:+91-22-48934295",
  },
};

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: Package,
    },
    {
      title: "Shipments",
      url: "/shipments",
      icon: IconTruckDelivery,
      items: [
        { title: "All Shipments", url: "/shipments", icon: Activity },
        { title: "RTO", url: "/shipments/rto", icon: Package2 },
        { title: "Undelivered", url: "/shipments/undelivered", icon: Activity },
        { title: "Pickup", url: "/shipments/pickup", icon: Box },
      ],
    },
    {
      title: "Finance",
      url: "#",
      icon: IconCashBanknote,
    },
    {
      title: "Weights",
      url: "#",
      icon: Weight,
    },
    {
      title: "Catalogs",
      url: "/catalogs",
      icon: ListTodoIcon,
      items: [
        { title: "Address Book", url: "/catalogs/address-book", icon: MapPinHouseIcon },
        { title: "Products", url: "/catalogs/products", icon: BoxesIcon },
        { title: "Packages", url: "/catalogs/packages", icon: PackageCheckIcon },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      title: "Personalize",
      url: "#",
      icon: User,
    },
    {
      title: "Ambassador",
      url: "#",
      icon: IconUserDollar,
    },
  ],
  navSecondary: [
    {
      title: "Knowledge base",
      url: external_links.knowledge_base_link.url,
      icon: IconHelp,
      external: true,
      new_tab: true,
    },
    {
      title: "Video Guides",
      url: external_links.video_guides_link.url,
      icon: TvMinimalPlay,
      external: true,
      new_tab: true,
    },
    {
      title: "Support: +91-22-48934295",
      url: external_links.support_link.url,
      icon: Headset,
      external: true,
      new_tab: false,
    },
  ],
};

export default data;
