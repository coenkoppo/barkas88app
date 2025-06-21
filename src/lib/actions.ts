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
    type ProductFormValues,
    productFormSchema
} from '@/types';
import { 
  createProduct as createProductFirestore,
  getAllProducts,
  getAllOrders,
  createOrder as createOrderFirestore,
  updateOrder,
  getAllCustomers,
  getProductById,
  updateProduct as updateProductFirestore,
  deleteProduct as deleteProductFirestore,
  deleteOrder as deleteOrderFirestore
} from './firestore';
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

    // Ambil data produk dari Firestore untuk validasi
    const products = await getAllProducts();
    
    let subtotal = 0;
    const orderItems: CartItem[] = [];
    
    for (const item of validatedData.items) {
      const product = products.find(p => p.id === item.id);
      if (!product) throw new Error(`Produk dengan ID ${item.id} tidak ditemukan.`);
      if (product.stock < item.quantity) throw new Error(`Stok tidak cukup untuk ${product.name}.`);
      
      subtotal += item.price * item.quantity;
      orderItems.push({
        ...product,
        quantity: item.quantity,
        price: item.price
      });
    }
    
    let discountAmount = 0;
    if (validatedData.voucherCode && validatedData.voucherCode.toUpperCase() === 'SALE10') {
        discountAmount = subtotal * 0.10; 
    }

    const shippingFee = 20000; 
    const totalAmount = subtotal - discountAmount + shippingFee;
    
    let orderStatus = OrderStatus.Pending;
    const amountActuallyPaid = 0;

    if (validatedData.paymentMethod === PaymentMethod.COD || validatedData.paymentMethod === PaymentMethod.Cash) {
        orderStatus = OrderStatus.Processing; 
    } else if (validatedData.paymentMethod === PaymentMethod.Transfer || validatedData.paymentMethod === PaymentMethod.DP) {
        orderStatus = OrderStatus.AwaitingPayment; 
    }

    const newOrder = {
      customerInfo: validatedData.customerInfo,
      items: orderItems,
      subtotal,
      shippingFee,
      discountAmount,
      totalAmount,
      paymentMethod: validatedData.paymentMethod,
      voucherCode: validatedData.voucherCode,
      notes: validatedData.notes,
      status: orderStatus,
      amountActuallyPaid: amountActuallyPaid,
    };

    const orderId = await createOrderFirestore(newOrder);
    
    revalidatePath('/cart'); 
    revalidatePath('/'); 
    revalidatePath('/admin/orders');
    revalidatePath('/admin/customers');

    return { success: true, orderId };
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
    
    const newOrder = {
      ...validatedData, 
      amountActuallyPaid: validatedData.amountActuallyPaid || 0,
    };

    const orderId = await createOrderFirestore(newOrder);
    
    revalidatePath('/admin/orders');
    revalidatePath('/admin/customers');
    return { success: true, orderId };

  } catch (error) {
    console.error('Error creating admin order:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.' };
  }
}

export async function updateAdminOrder(orderId: string, data: Partial<AdminOrderPayload & { customerName?: string, customerPhone?: string, customerAddress?: string }>): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const orders = await getAllOrders();
    const currentOrder = orders.find(o => o.id === orderId);
    
    if (!currentOrder) {
      return { success: false, error: `Pesanan dengan ID ${orderId} tidak ditemukan.` };
    }
    
    const updatedCustomerInfo = {
        name: data.customerName || currentOrder.customerInfo.name,
        phoneNumber: data.customerPhone || currentOrder.customerInfo.phoneNumber,
        address: data.customerAddress || currentOrder.customerInfo.address,
    };

    const updatedOrderData: Partial<Order> = {
        customerInfo: updatedCustomerInfo,
        paymentMethod: data.paymentMethod || currentOrder.paymentMethod,
        status: data.orderStatus || data.status || currentOrder.status,
        shippingFee: data.shippingFee !== undefined ? data.shippingFee : currentOrder.shippingFee,
        discountAmount: data.discountAmount !== undefined ? data.discountAmount : currentOrder.discountAmount,
        amountActuallyPaid: data.amountActuallyPaid !== undefined ? data.amountActuallyPaid : currentOrder.amountActuallyPaid,
        notes: data.notes !== undefined ? data.notes : currentOrder.notes,
    };
    
    if (data.items) {
      const products = await getAllProducts();
      updatedOrderData.items = data.items.map(item => {
        const productDetails = products.find(p => p.id === item.id) || item as any; 
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
      });
      
      const newSubtotal = updatedOrderData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      updatedOrderData.subtotal = newSubtotal;
      updatedOrderData.totalAmount = newSubtotal + updatedOrderData.shippingFee! - updatedOrderData.discountAmount!;
    }

    await updateOrder(orderId, updatedOrderData);
    
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}/edit`);
    revalidatePath('/admin/customers');
    return { success: true, orderId };
  } catch (error) {
    console.error('Error updating admin order:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.' };
  }
}

export async function deleteAdminOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteOrderFirestore(orderId);
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.' };
  }
}

export async function getAdminOrders(): Promise<Order[]> {
  try {
    return await getAllOrders();
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function createProduct(data: ProductFormValues): Promise<{ success: boolean; productId?: string; error?: string }> {
  try {
    const validatedData = productFormSchema.parse(data);

    const newProduct = {
      name: validatedData.name,
      description: validatedData.description,
      price: validatedData.price,
      imageUrl: validatedData.imageUrl || `https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600`,
      category: validatedData.category,
      tags: validatedData.tags,
      stock: validatedData.stock,
    };

    const productId = await createProductFirestore(newProduct);

    revalidatePath('/admin/products');
    revalidatePath('/'); 

    return { success: true, productId };
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.' };
  }
}

export async function updateProduct(productId: string, data: ProductFormValues): Promise<{ success: boolean; error?: string }> {
  try {
    const validatedData = productFormSchema.parse(data);
    await updateProductFirestore(productId, validatedData);
    
    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.' };
  }
}

export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteProductFirestore(productId);
    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.' };
  }
}

export async function getAdminProducts(): Promise<Product[]> {
  try {
    return await getAllProducts();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getAdminCustomers(): Promise<CustomerInfo[]> {
  try {
    return await getAllCustomers();
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}