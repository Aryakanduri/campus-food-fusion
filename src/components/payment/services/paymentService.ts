
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { LocationData } from '../types/payment';

export const processOrderPayment = async (
  orderId: number,
  locationData: LocationData,
  userId: string
): Promise<void> => {
  try {
    // Log the data we're updating
    console.log("Updating order with delivery details:", {
      orderId,
      locationData,
      userId
    });
    
    // First check if the order exists and belongs to this user
    const { data: orderData, error: orderCheckError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();
      
    if (orderCheckError || !orderData) {
      console.error("Order validation error:", orderCheckError);
      throw new Error('Could not validate order. Please try again.');
    }
    
    // Then update the order with delivery information
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'Processing',
        delivery_address: locationData.address,
        delivery_city: locationData.city,
        delivery_pincode: locationData.pincode,
        delivery_instructions: locationData.instructions || '',
        delivery_landmark: locationData.landmark || ''
      })
      .eq('id', orderId)
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error in processOrderPayment:", error);
      throw error;
    }
    
    console.log("Order status updated to Processing with delivery details");
    toast.success("Payment successful!");
  } catch (error) {
    console.error("Error updating order status:", error);
    toast.error("Payment processed, but there was an issue updating your order status.");
    throw error;
  }
};
