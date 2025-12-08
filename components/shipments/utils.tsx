import {
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Plane,
  TruckIcon,
  Ship,
} from "lucide-react";

export type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

export const getStatusIcon = (status: string | undefined) => {
  if (!status) return <Clock className="size-4 text-gray-600" />;

  switch (status.toLowerCase()) {
    case "delivered":
      return <CheckCircle className="size-4 text-green-600" />;
    case "in transit":
      return <Truck className="size-4 text-blue-600" />;
    case "processing":
      return <Clock className="size-4 text-yellow-600" />;
    case "delayed":
      return <AlertCircle className="size-4 text-red-600" />;
    default:
      return <Clock className="size-4 text-gray-600" />;
  }
};

export const getStatusVariant = (status: string | undefined) => {
  if (!status) return "outline";

  switch (status.toLowerCase()) {
    case "delivered":
      return "default";
    case "in transit":
      return "secondary";
    case "processing":
      return "outline";
    case "delayed":
      return "destructive";
    default:
      return "outline";
  }
};

export function getStatusBadgeVariant(
  status: string | undefined,
): BadgeVariant {
  const value = (status || "").toLowerCase();
  switch (value) {
    case "delivered":
      return "default";
    case "in transit":
      return "secondary";
    case "processing":
      return "outline";
    case "delayed":
      return "destructive";
    default:
      return "outline";
  }
}

export const getPaymentModeColor = (isCod: boolean) => {
  return isCod ? "text-blue-600" : "text-green-600";
};

export function getSolutionIcon(solution: string | undefined) {
  if (!solution) return <Package className="size-4 text-gray-600" />;
  switch (solution) {
    case "Air domestic":
      return <Plane className="size-4 text-blue-600" />;
    case "Surface B2C":
      return <TruckIcon className="size-4 text-green-600" />;
    case "Surface B2B":
      return <Ship className="size-4 text-purple-600" />;
    default:
      return <Package className="size-4 text-gray-600" />;
  }
}

export const getPaymentTypeBadgeClasses = (
  paymentType: string | null | undefined,
): string => {
  if (!paymentType) return "";
  const type = paymentType.toLowerCase();
  switch (type) {
    case "prepaid":
      return "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400";
    case "cod":
    case "cash on delivery":
      return "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400";
    case "postpaid":
      return "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400";
    case "credit":
      return "border-purple-500/50 bg-purple-500/10 text-purple-700 dark:text-purple-400";
    default:
      return "";
  }
};

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};
