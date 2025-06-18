
import * as z from 'zod';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: ProductCategory;
  tags: ProductTag[];
  stock: number;
}

export enum ProductCategory {
  Electronics = "Elektronik",
  Clothing = "Pakaian",
  Furniture = "Furnitur",
  Handicrafts = "Kerajinan Tangan",
  Accessories = "Aksesori",
  HomeGoods = "Peralatan Rumah Tangga",
  Other = "Lainnya",
}

export enum ProductTag {
  FastSelling = "Cepat Laku",
  LimitedStock = "Stok Terbatas",
  NewArrival = "Baru Datang",
  BestSeller = "Terlaris",
  OnSale = "Diskon",
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  phoneNumber: string;
  address: string;
}

export enum PaymentMethod {
  DP = "DP",
  COD = "COD",
  Cash = "Tunai",
  Transfer = "Transfer Bank",
}

export interface Order {
  id: string;
  customerInfo: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  voucherCode?: string;
  notes?: string;
  status: OrderStatus;
  amountActuallyPaid: number; // Jumlah yang benar-benar sudah dibayar
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}

export enum OrderStatus {
  Pending = "Tertunda", // Pesanan baru dibuat, belum ada tindakan pembayaran/proses
  AwaitingPayment = "Menunggu Pembayaran", // Menunggu pembayaran penuh atau DP
  Processing = "Diproses", // Pembayaran (DP/Lunas) diterima, pesanan sedang disiapkan
  DPPaid = "DP Telah Dibayar", // DP sudah diterima, menunggu pelunasan
  Paid = "Pembayaran Lunas", // Pembayaran penuh sudah diterima
  Shipped = "Dikirim",
  Delivered = "Terkirim",
  Cancelled = "Dibatalkan",
  Refunded = "Dana Dikembalikan",
}

export const productFormSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter."),
  description: z.string().min(10, "Deskripsi minimal 10 karakter."),
  price: z.coerce.number().min(0.01, "Harga harus angka positif."),
  stock: z.coerce.number().int().min(0, "Stok harus angka non-negatif."),
  category: z.nativeEnum(ProductCategory, { errorMap: () => ({ message: "Silakan pilih kategori."})}),
  tags: z.array(z.nativeEnum(ProductTag)).min(1, "Silakan pilih minimal satu tag."),
  imageUrl: z.string().url({ message: "Silakan masukkan URL gambar yang valid." }).optional().or(z.literal('')),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

