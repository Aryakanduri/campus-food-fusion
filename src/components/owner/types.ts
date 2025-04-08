
export interface OrderWithItems {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  items: any[]; // Order items
  delivery_partner?: string;
  delivery_phone?: string;
  delivery_email?: string;
  estimated_time?: string;
}

export interface DeliveryPartner {
  id: string;
  partner_name?: string;
  phone_number?: string;
  email: string;
  status: 'Available' | 'Busy';
}

// Additional types for order management
export interface AssignDeliveryPartnerRequest {
  orderId: string;
  partnerId: string;
  estimatedTime: string;
}

export interface OrderStatusUpdateRequest {
  orderId: string;
  status: string;
}
