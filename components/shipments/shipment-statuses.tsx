export const shipment_statuses = [
  {
    status_code: 1020,
    category: "Not Picked",
    message: "Shipment Manifested",
  },
  {
    status_code: 1220,
    category: "In-Transit",
    message: "Shipment In-Transit",
  },
  {
    status_code: 1850,
    category: "In-Transit",
    message: "Pending",
  },
  {
    status_code: 1700,
    category: "In-Transit",
    message: "Shipment Out for Delivery",
  },
  {
    status_code: 1900,
    category: "Delivered",
    message: "Delivered",
  },
  {
    status_code: 1500,
    category: "Lost",
    message: "Shipment Lost",
  },
  {
    status_code: 2030,
    category: "RTO Delivered",
    message: "RTO Delivered",
  },
  {
    status_code: 1250,
    category: "Cancelled",
    message: "Shipment Cancelled",
  },
  {
    status_code: 1280,
    category: "In-Transit",
    message: "Received at Origin Hub",
  },
  {
    status_code: 1400,
    category: "In-Transit",
    message: "Received at Destination Hub",
  },
  {
    status_code: 1440,
    category: "In-Transit",
    message: "Shipment Misrouted",
  },
  {
    status_code: 1770,
    category: "In-Transit",
    message: "Delivery Attempt Failed",
  },
  {
    status_code: 1300,
    category: "In-Transit",
    message: "Shipment On-Hold",
  },
  {
    status_code: 2000,
    category: "RTO In-Transit",
    message: "RTO Initiated",
  },
  {
    status_code: 8000,
    category: "NULL",
    message: "Tracking Closed",
  },
  {
    status_code: 1200,
    category: "Picked Up",
    message: "Picked Up from Origin",
  },
  {
    status_code: 1550,
    category: "In-Transit",
    message: "Shipment Damaged",
  },
  {
    status_code: 1616,
    category: "In-Transit",
    message: "Delay in Delivery expected",
  },
  {
    status_code: 1050,
    category: "Not Picked",
    message: "Pickup Cancelled",
  },
  {
    status_code: 1880,
    category: "In-Transit",
    message: "Contact Customer Support",
  },
  {
    status_code: 1025,
    category: "Cancelled",
    message: "Cancel Requested",
  },
  {
    status_code: 1000,
    category: "NULL",
    message: "Booking Pending",
  },
  {
    status_code: 1039,
    category: "Not Picked",
    message: "Missed Pickup",
  },
  {
    status_code: 2020,
    category: "RTO In-Transit",
    message: "RTO In Transit",
  },
  {
    status_code: 2025,
    category: "RTO In-Transit",
    message: "RTO Exception",
  },
  {
    status_code: 1010,
    category: "Not Picked",
    message: "Shipment Booked",
  },
  {
    status_code: 1070,
    category: "Not Picked",
    message: "Pickup Scheduled",
  },
  {
    status_code: 1083,
    category: "Not Picked",
    message: "Pickup Re-scheduled",
  },
  {
    status_code: 1100,
    category: "Not Picked",
    message: "Out for Pickup",
  },
  {
    status_code: 1560,
    category: "In-Transit",
    message: "Unexpected Challenge",
  },
  {
    status_code: 1800,
    category: "In-Transit",
    message: "Partial Delivery",
  },
  {
    status_code: 1570,
    category: "In-Transit",
    message: "Address Incorrect",
  },
  {
    status_code: 1011,
    category: "In Progress",
    message: "In Progress",
  },
];

export const getShipmentStatusDetails = (status_code: number) => {
  const status_details = shipment_statuses.filter(
    (status_details) => status_details.status_code === status_code,
  );
  if (status_details.length > 0) {
    return status_details[0];
  } else {
    return {
      status_code: 0,
      category: "Unknown",
      message: "Unknown",
    };
  }
};
