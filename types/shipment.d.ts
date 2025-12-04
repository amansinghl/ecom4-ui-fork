export type ShipmentDetailsAPIResponseType = {
  details: {
    id: number;
    accounts_user_id: number;
    accounts_entity_id: number;
    shipment_no: number;
    email: string;
    supplier_id: number;
    from_pincode: string;
    to_pincode: string;
    shipment_date: string;
    product_code: string;
    cod_value: string;
    pre_gst_total_price: string;
    total_price: string;
    pre_gst_total_partner_cost: string;
    total_partner_cost: string;
    product: string;
    product_value: string;
    cancelled_at: string;
    bulk_id: string;
    tracking_id: string;
    booking_status: number;
    lr_num: string | null;
    rto_tracking_id: string | null;
    tracking_status: number;
    is_offline: number;
    invoice_weight: number;
    billable: string;
    partner_bill: number;
    ecom2_bulk_reference_number: string | null;
    reference1: string;
    reference2: string;
    branch_id: string | null;
    shipment_input_id: number;
    pickup_location_id: number;
    consignee_location_id: number;
    billing_location_id: number;
    return_location_id: number;
    channel_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    shipment_zone: string;
    slab_count: number;
    billed_price: string;
    supplier_cost: string;
    calculated: number;
    multipartner: number;
    ip_address: string;
    booking_medium: string;
    created_at_ist: string;
    is_entity_spoc: number;
    is_stressed: number;
    awb_no: string;
    rto_awb_no: string | null;
    mode_transport: string;
    shipment_type: string;
    cargo_type: string;
    service_type: string;
    payment_type: string;
    booking_channel: string;
    partner_name: string;
    partner_logo: string;
    switched_partner_id: strig | null;
    shipment_cost: string;
    shipment_created_at: string;
    entity_name: string;
    invoice_date: string | null;
    tracking_category: string;
    quantity: number;
    debit_credit_difference: string;
    pickup_id: string | null;
    picked_up: false;
  };
};

export type ShipmentTrackingAdditionalDetailsType = {
  reference_number: string | null;
  tracking_id: string | null;
  rto_tracking_id: string | null;
  pickup_date: string | null;
  origin: string | null;
  destination: string | null;
  chargeable_weight: string | number | null;
  expected_delivery_date: string | null;
  expected_return_date: string | null;
};

export type ShipmentTrackingEventType = {
  shipment_no: number;
  awb_no: string;
  rto_awb_no: string | null;
  order_id: string;
  tracking_status: number;
  id: number;
  location: string;
  destination_pincode: string;
  origin_pincode: string;
  origin_city: string;
  destination_city: string;
  event_date: string;
  comment: string;
  partner_code: string;
  supplier_tracking_url: string;
  partner_name: string;
  supplier_id: number;
  partner_logo: string;
  status_message: string;
  additional_details: ShipmentTrackingAdditionalDetailsType | null;
  product: string;
  product_code: string;
  shipment_zone: string;
  cod_value: string;
  seller_email: string;
  seller_contact: string;
  seller_calling_code: string;
  shipment_date: string;
  seller_website: string;
};

export type ShipmentTrackingAPIResponseType = {
  tracking_details: Array<ShipmentTrackingEventType>;
  partner_tracking_url?: string | null;
};

export type ShipmentNotificationEventType = {
  shipment_no: number;
  event: string;
  notification_type: string;
  notification_content: string;
  recipient: string;
  created_at: string;
};

export type ShipmentNotificationsAPIResponseType = {
  notifications: Array<ShipmentNotificationEventType>;
};

export type ShipmentCostBreakupChargeHeadType = {
  total_without_tax?: string | null;
  total_amount?: string | null;
  cgst?: string | null;
  igst?: string | null;
  sgst?: string | null;
  gst?: string | null;
  total_gst?: string | null;
  charge_head?: string | null;
  created_at?: string | null;
};

export type ShipmentCostBreakupAPIResponseType = {
  cost_breakup: Array<ShipmentCostBreakupChargeHeadType> | number;
};

export type ShipmentTransactionType = {
  payment_type: string;
  transaction_amount: string;
  remark: string;
  created_at: string;
};

export type ShipmentTransactionsAPIResponseType = {
  transaction: Array<ShipmentTransactionType>;
};

export type ShipmentWeightDetailsType = {
  shipment_weight: string;
  updated_at: string;
  weight_category: string;
  weight_source: string;
};

export type ShipmentWeightHistoryAPIResponseType = {
  weight_history: Array<ShipmentWeightDetailsType>;
};

export type ShipmentPODAPIResponseType = {
  pod_link: string | null;
};

export type ShipmentQCImagesAPIResponseType = {
  images: Array<string>;
};

export type ShipmentAddressType = {
  id: number;
  type: number;
  shipment_no: number;
  full_name: string;
  email: string;
  contact: string;
  calling_code: string;
  address_line_1: string | null;
  address_line_2: string | null;
  address_line_3: string | null;
  landmark: string | null;
  pincode: string;
  city: string;
  state: string;
  country: string;
  location_type: string | null;
  location_name: string | null;
  location_id: number;
  created_at: string;
  updated_at: string;
  warehouse_id: string | number | null;
  country_code: string | null;
};

export type ShipmentAddressesAPIResponseType = {
  address: {
    origin_address: ShipmentAddressType;
    destination_address: ShipmentAddressType;
    billing_address: ShipmentAddressType;
    return_address: ShipmentAddressType;
    return_address: ShipmentAddressType;
  };
};

export type ShipmentPackageType = {
  product_description: string;
  product_value: string;
  weight: string;
  weight_unit: string;
  package_count: number;
  length: string;
  width: string;
  height: string;
  dimensions_unit: string;
  entered_weight: string;
  volumetric_weight: string;
  booked_weight: string;
  picked_up: boolean;
};

export type ShipmentPackageDetailsAPIResponseType = {
  package_details: Array<ShipmentPackageType> | null;
};

export type ShipmentNDRLinkType = {
  url: string | null;
  label: string | null;
  active: boolean;
};

export type ShipmentNDRType = {
  url: string | null;
  label: string | null;
  active: boolean;
};

export type ShipmentNDRAPIResponseType = {
  ndr_data: {
    current_page: number;
    data: Array<ShipmentNDRType>;
    first_page_url: string | null;
    from: string | number | null;
    last_page: number | null;
    last_page_url: string | null;
    links: Array<ShipmentNDRLinkType>;
    next_page_url: null;
    path: string | null;
    per_page: number | null;
    prev_page_url: string | null;
    to: string | number | null;
    total: number;
  };
};

export type ShipmentSorterImagesAPIResponseType = {
  sorterImage: Array<string>;
};

export type ShipmentPickupIDAPIResponseType = {
  pickupId: {
    pickup_id: string;
    pickup_id_date: string;
    pickup_created_at: string;
    tracking_status: number;
    created_at: string;
    picked_up: boolean;
  } | null;
};

export type ShipmentCommunicationsAPIResponseType = {
  logs: Array<string>;
};

export type ShipmentDisputesAPIResponseType = {
  dispute: string | null;
};
