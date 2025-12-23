import {
  FileText,
  XCircle,
  Pause,
  RefreshCw,
  Package,
  Truck,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Gets the icon component for a given order status
 * Uses the same icons as the status filters
 */
export const getOrderStatusIcon = (status: string | undefined) => {
  if (!status) return Clock;

  const normalizedStatus = status.toLowerCase().trim();

  switch (normalizedStatus) {
    case "created":
    case "unfulfilled":
      return FileText;
    case "cancelled":
      return XCircle;
    case "on hold":
      return Pause;
    case "cancel requested":
      return XCircle;
    case "processing":
      return RefreshCw;
    case "partially fulfilled":
      return Package;
    case "shipped":
      return Truck;
    case "fulfilled":
      return CheckCircle;
    default:
      return Clock;
  }
};

/**
 * Gets custom color classes for order status badges
 * Returns creative, semantic colors for each status
 */
export const getOrderStatusBadgeClasses = (
  status: string | undefined,
): string => {
  if (!status) {
    return "border-gray-500/50 bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }

  const normalizedStatus = status.toLowerCase().trim();

  switch (normalizedStatus) {
    case "fulfilled":
      // Green - success/completed
      return "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    case "shipped":
      // Blue - in transit
      return "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400";
    case "processing":
      // Amber/Yellow - active work
      return "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400";
    case "partially fulfilled":
      // Orange - partial completion
      return "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400";
    case "cancelled":
      // Red - cancelled
      return "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400";
    case "cancel requested":
      // Rose - pending cancellation
      return "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-400";
    case "on hold":
      // Purple - paused/held
      return "border-purple-500/50 bg-purple-500/10 text-purple-700 dark:text-purple-400";
    case "created":
    case "unfulfilled":
      // Slate - new/pending
      return "border-slate-500/50 bg-slate-500/10 text-slate-700 dark:text-slate-400";
    default:
      // Gray - unknown
      return "border-gray-500/50 bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }
};

/**
 * Gets the icon color class for a given order status
 * Matches the badge color for visual consistency
 */
export const getOrderStatusIconColor = (status: string | undefined): string => {
  if (!status) {
    return "text-gray-600 dark:text-gray-400";
  }

  const normalizedStatus = status.toLowerCase().trim();

  switch (normalizedStatus) {
    case "fulfilled":
      return "text-emerald-600 dark:text-emerald-400";
    case "shipped":
      return "text-blue-600 dark:text-blue-400";
    case "processing":
      return "text-amber-600 dark:text-amber-400";
    case "partially fulfilled":
      return "text-orange-600 dark:text-orange-400";
    case "cancelled":
      return "text-red-600 dark:text-red-400";
    case "cancel requested":
      return "text-rose-600 dark:text-rose-400";
    case "on hold":
      return "text-purple-600 dark:text-purple-400";
    case "created":
    case "unfulfilled":
      return "text-slate-600 dark:text-slate-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

/**
 * Gets the display label for a given order status
 * Maps API status values to user-friendly display labels
 */
export const getOrderStatusDisplayLabel = (status: string | undefined): string => {
  if (!status) return "Unknown";

  const normalizedStatus = status.toLowerCase().trim();

  switch (normalizedStatus) {
    case "created":
      // API sends "created" but UI should show "Unfulfilled"
      return "Unfulfilled";
    case "unfulfilled":
      return "Unfulfilled";
    case "cancelled":
      return "Cancelled";
    case "cancel requested":
      return "Cancel Requested";
    case "on hold":
      return "On Hold";
    case "processing":
      return "Processing";
    case "partially fulfilled":
      return "Partially Fulfilled";
    case "shipped":
      return "Shipped";
    case "fulfilled":
      return "Fulfilled";
    default:
      // Capitalize first letter of each word for unknown statuses
      return status
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
  }
};

/**
 * Renders a complete status badge with icon and colored badge
 * This is the main helper function to use for displaying order status
 */
export const OrderStatusBadge = ({
  status,
  className,
}: {
  status: string | undefined;
  className?: string;
}) => {
  const Icon = getOrderStatusIcon(status);
  const badgeClasses = getOrderStatusBadgeClasses(status);
  const iconColor = getOrderStatusIconColor(status);
  const displayStatus = getOrderStatusDisplayLabel(status);

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <Badge variant="outline" className={`text-xs font-medium ${badgeClasses}`}>
        {displayStatus}
      </Badge>
    </div>
  );
};

