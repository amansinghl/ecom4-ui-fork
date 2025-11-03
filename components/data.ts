import {
  IconHelp,
  IconCashBanknote,
  IconUserDollar,
  IconDashboard,
  IconTruckDelivery,
} from "@tabler/icons-react";

import {
  Package,
  Weight,
  Settings,
  User,
  Headset,
  TvMinimalPlay,
} from "lucide-react";

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
