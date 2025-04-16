
import { CartItem } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { 
  clearCartFromLocalStorage
} from './cartStorageService';

// Define the type for our order response
interface CreateOrderResponse {
  id: number;
  user_id: string;
  total_price: number;
  status: string;
  created_at: string;
}

export const placeOrder = async (
  userId: string, 
  cart: CartItem[], 
  cartId: string | null
): Promise<number | null> => {
  if (cart.length === 0) {
    throw new Error('Your cart is empty');
  }
  
  try {
    const totalPrice = cart.reduce((total, item) => {
      return total + (item.foodItem.price * item.quantity);
    }, 0);
    
    // Format order items for the database function
    const orderItemsJson = cart.map(item => ({
      food_item_id: item.foodItem.id,
      food_name: item.foodItem.name,
      food_price: item.foodItem.price,
      food_image_url: item.foodItem.imageUrl,
      quantity: item.quantity
    }));
    
    // Call the new create_new_order function with items included
    const { data, error } = await supabase.rpc(
      'create_new_order', 
      { 
        user_id_param: userId,
        total_price_param: totalPrice,
        items_json: JSON.stringify(orderItemsJson)
      }
    );
      
    if (error) {
      console.error('Order creation error:', error);
      throw new Error(error.message || 'Failed to create order');
    }
    
    // Ensure we have a valid order with an ID
    if (!data || typeof data.id !== 'number') {
      throw new Error('No order was created');
    }
    
    const orderData = data as CreateOrderResponse;
    console.log('Order created successfully:', orderData);
    
    // Clear the cart after successful order creation
    if (cartId) {
      const { error: cartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);
        
      if (cartError) {
        console.error('Error clearing cart:', cartError);
      }
    }
    clearCartFromLocalStorage();
    
    return orderData.id;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};
