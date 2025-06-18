
'use server';

import { z } from 'zod';
import { 
    PaymentMethod, 
    OrderStatus, 
    type CartItem, 
    type CustomerInfo, 
    type Order, 
    ProductCategory, 
    ProductTag, 
    type Product,
    type ProductFormValues
} from '@/types';
import { mockOrders, mockProducts } from './mock-data'; 
import { revalidatePath } from 'next/cache';

const customerOrderSchema = z.object({
  customerInfo: z.object({
    name: z.string().min(1),
    phoneNumber: z.string().min(1),
    address: z.string().min(1),
  }),
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number().min(1),
    price: z.number(), 
    name: z.string(), 
  })).min(1),
  paymentMethod: z.nativeEnum(PaymentMethod),
  voucherCode: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerOrderInput = z.infer<typeof customerOrderSchema>;

export async function createOrder(data: CustomerOrderInput): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const validatedData = customerOrderSchema.parse(data);

    let subtotal = 0;
    for (const item of validatedData.items) {
      const product = mockProducts.find(p => p.id === item.id);
      if (!product) throw new Error(`Produk dengan ID ${item.id} tidak ditemukan.`);
      if (product.stock < item.quantity) throw new Error(`Stok tidak cukup untuk ${product.name}.`);
      subtotal += item.price * item.quantity;
    }
    
    let discountAmount = 0;
    if (validatedData.voucherCode && validatedData.voucherCode.toUpperCase() === 'SALE10') {
        discountAmount = subtotal * 0.10; 
    }

    const shippingFee = 20000; 
    const totalAmount = subtotal - discountAmount + shippingFee;
    
    let orderStatus = OrderStatus.Pending;
    const amountActuallyPaid = 0; // Initial payment is 0 for new orders from customer side

    if (validatedData.paymentMethod === PaymentMethod.COD || validatedData.paymentMethod === PaymentMethod.Cash) {
        orderStatus = OrderStatus.Processing; 
    } else if (validatedData.paymentMethod === PaymentMethod.Transfer || validatedData.paymentMethod === PaymentMethod.DP) {
        orderStatus = OrderStatus.AwaitingPayment; 
    }

    const newOrderId = `ORD${String(mockOrders.length + 1).padStart(3, '0')}`;
    const newOrder: Order = {
      id: newOrderId,
      customerInfo: validatedData.customerInfo,
      items: validatedData.items.map(item => {
        const productDetails = mockProducts.find(p => p.id === item.id)!; 
        return {
            ...productDetails, 
            price: item.price, 
            quantity: item.quantity,
        };
      }),
      subtotal,
      shippingFee,
      discountAmount,
      totalAmount,
      paymentMethod: validatedData.paymentMethod,
      voucherCode: validatedData.voucherCode,
      notes: validatedData.notes,
      status: orderStatus,
      amountActuallyPaid: amountActuallyPaid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockOrders.push(newOrder);
    // Stock reduction logic can be added here or when payment is confirmed
    // For simulation, we might reduce stock if status moves to Processing or Paid.
    
    revalidatePath('/cart'); 
    revalidatePath('/'); 
    revalidatePath('/admin/orders');
    revalidatePath('/admin/customers');


    return { success: true, orderId: newOrder.id };
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.' };
  }
}

const adminOrderPayloadSchema = z.object({
  customerInfo: z.object({
    name: z.string().min(1),
    phoneNumber: z.string().min(1),
    address: z.string().min(1),
  }),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    imageUrl: z.string(),
    category: z.nativeEnum(ProductCategory), 
    tags: z.array(z.nativeEnum(ProductTag)), 
    stock: z.number(),
    quantity: z.number().min(1),
  })).min(1),
  paymentMethod: z.nativeEnum(PaymentMethod),
  status: z.nativeEnum(OrderStatus),
  shippingFee: z.number().min(0),
  discountAmount: z.number().min(0),
  amountActuallyPaid: z.number().min(0).optional(),
  subtotal: z.number().min(0),
  totalAmount: z.number().min(0),
  notes: z.string().optional(),
});

type AdminOrderPayload = z.infer<typeof adminOrderPayloadSchema>;

export async function createAdminOrder(data: AdminOrderPayload): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const validatedData = adminOrderPayloadSchema.parse(data);
    
    const newOrderId = `ADM_ORD${String(mockOrders.length + 1).padStart(3, '0')}`;
    const newOrder: Order = {
      id: newOrderId,
      ...validatedData, 
      amountActuallyPaid: validatedData.amountActuallyPaid || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockOrders.push(newOrder);
    // Stock reduction logic could be here based on status
    revalidatePath('/admin/orders');
    revalidatePath('/admin/customers');
    return { success: true, orderId: newOrder.id };

  } catch (error) {
    console.error('Error creating admin order:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.' };
  }
}

export async function updateAdminOrder(orderId: string, data: Partial<AdminOrderPayload & { customerName?: string, customerPhone?: string, customerAddress?: string }>): Promise<{ success: boolean; orderId?: string; error?: string }> {
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        return { success: false, error: `Pesanan dengan ID ${orderId} tidak ditemukan.` };
    }
    
    const currentOrder = mockOrders[orderIndex];
    
    const updatedCustomerInfo = {
        name: data.customerName || currentOrder.customerInfo.name,
        phoneNumber: data.customerPhone || currentOrder.customerInfo.phoneNumber,
        address: data.customerAddress || currentOrder.customerInfo.address,
    };

    const updatedOrderData: Order = {
        ...currentOrder,
        customerInfo: updatedCustomerInfo,
        items: data.items ? data.items.map(item => { 
            const productDetails = mockProducts.find(p => p.id === item.id) || item as any; 
            return {
                ...productDetails,
                id: item.id,
                name: item.name || productDetails.name,
                price: (item as any).unitPrice !== undefined ? (item as any).unitPrice : item.price,
                quantity: item.quantity,
                description: item.description || productDetails.description,
                imageUrl: item.imageUrl || productDetails.imageUrl,
                category: item.category || productDetails.category,
                tags: item.tags || productDetails.tags,
                stock: item.stock !== undefined ? item.stock : productDetails.stock,
            };
        }) : currentOrder.items,
        paymentMethod: data.paymentMethod || currentOrder.paymentMethod,
        status: data.orderStatus || data.status || currentOrder.status, // Ensure status is taken from form data
        shippingFee: data.shippingFee !== undefined ? data.shippingFee : currentOrder.shippingFee,
        discountAmount: data.discountAmount !== undefined ? data.discountAmount : currentOrder.discountAmount,
        amountActuallyPaid: data.amountActuallyPaid !== undefined ? data.amountActuallyPaid : currentOrder.amountActuallyPaid,
        notes: data.notes !== undefined ? data.notes : currentOrder.notes,
        updatedAt: new Date().toISOString() 
    };
    
    const newSubtotal = updatedOrderData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    updatedOrderData.subtotal = newSubtotal;
    updatedOrderData.totalAmount = newSubtotal + updatedOrderData.shippingFee - updatedOrderData.discountAmount;

    mockOrders[orderIndex] = updatedOrderData;
    
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}/edit`);
    revalidatePath('/admin/customers');
    return { success: true, orderId };
}


export async function getAdminOrders(): Promise<Order[]> {
  return JSON.parse(JSON.stringify(mockOrders));
}

export async function createProduct(data: ProductFormValues): Promise<{ success: boolean; productId?: string; error?: string }> {
  try {
    const validatedData = productFormSchema.parse(data);

    const newProductId = `PROD${String(mockProducts.length + 1).padStart(4, '0')}`;
    const newProduct: Product = {
      id: newProductId,
      name: validatedData.name,
      description: validatedData.description,
      price: validatedData.price,
      imageUrl: validatedData.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(validatedData.name)}`,
      category: validatedData.category,
      tags: validatedData.tags,
      stock: validatedData.stock,
    };

    mockProducts.unshift(newProduct); 

    revalidatePath('/admin/products');
    revalidatePath('/'); 

    return { success: true, productId: newProduct.id };
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.' };
  }
}

export async function getAdminProducts(): Promise<Product[]> {
  return JSON.parse(JSON.stringify(mockProducts));
}

export async function getAdminCustomers(): Promise<CustomerInfo[]> {
  const customersMap = new Map<string, CustomerInfo>();

  mockOrders.forEach(order => {
    if (order.customerInfo && order.customerInfo.phoneNumber && !customersMap.has(order.customerInfo.phoneNumber)) {
      customersMap.set(order.customerInfo.phoneNumber, order.customerInfo);
    }
  });

  const uniqueCustomers = Array.from(customersMap.values());
  return JSON.parse(JSON.stringify(uniqueCustomers));
}
