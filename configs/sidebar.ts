import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  DollarSign,
  Scale,
  Database,
  Plug,
  UserCog,
  Users,
  HelpCircle,
  PlayCircle,
  Headset,
  BoxesIcon,
  PackageCheckIcon,
  MapPinHouseIcon,
  Activity,
  Package2,
  Layers,
  type LucideIcon,
} from "lucide-react";

export type SideBarMainNavSubItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
};

export type SideBarMainNavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  active?: boolean;
  items?: SideBarMainNavSubItem[];
};

export type SideBarMainNavItems = {
  items: SideBarMainNavItem[];
};

export type SideBarSecondaryNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
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
      icon: LayoutDashboard,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: ShoppingCart,
      items: [
          { title: "Manage Orders", url: "/orders", icon: Package2 },
          { title: "Bulk", url: "/orders/bulk", icon: Layers },
        ],
    },
    {
      title: "Shipments",
      url: "/shipments",
      icon: Truck,
      items: [
        { title: "All Shipments", url: "/shipments", icon: Activity },
        { title: "RTO", url: "/shipments/rto", icon: Package2 },
      ],
    },
    {
      title: "Finance",
      url: "/finance",
      icon: DollarSign,
    },
    {
      title: "Weights",
      url: "/weights",
      icon: Scale,
    },
    {
      title: "Catalogs",
      url: "/catalogs",
      icon: Database,
      items: [
        { title: "Address Book", url: "/catalogs/address-book", icon: MapPinHouseIcon },
        { title: "Products", url: "/catalogs/products", icon: BoxesIcon },
        { title: "Packages", url: "/catalogs/packages", icon: PackageCheckIcon },
      ],
    },
    {
      title: "Integrations",
      url: "/integrations",
      icon: Plug,
      nonCollapsible: true,
    },
    {
      title: "Personalize",
      url: "#",
      icon: UserCog,
    },
    {
      title: "Ambassador",
      url: "#",
      icon: Users,
    },
  ],
  navSecondary: [
    {
      title: "Knowledge base",
      url: external_links.knowledge_base_link.url,
      icon: HelpCircle,
      external: true,
      new_tab: true,
    },
    {
      title: "Video Guides",
      url: external_links.video_guides_link.url,
      icon: PlayCircle,
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
