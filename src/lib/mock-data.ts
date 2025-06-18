
import type { Product, Order } from '@/types';
import { ProductCategory, ProductTag, PaymentMethod, OrderStatus } from '@/types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Kursi Rotan Bohemian',
    description: 'Kursi rotan buatan tangan dengan desain bohemian yang unik. Cocok untuk sudut santai.',
    price: 1200000,
    imageUrl: 'https://placehold.co/600x400.png',
    category: ProductCategory.Furniture,
    tags: [ProductTag.Handicrafts, ProductTag.NewArrival],
    stock: 15,
  },
  {
    id: '2',
    name: 'Kemeja Batik Angin Pulau',
    description: 'Kemeja batik katun nyaman dengan motif tradisional Bali. Ideal untuk pakaian kasual.',
    price: 350000,
    imageUrl: 'https://placehold.co/600x400.png',
    category: ProductCategory.Clothing,
    tags: [ProductTag.BestSeller, ProductTag.FastSelling],
    stock: 50,
  },
  {
    id: '3',
    name: 'Meja Kopi Kayu Jati',
    description: 'Meja kopi kayu jati solid dengan desain minimalis. Tahan lama dan bergaya.',
    price: 2500000,
    imageUrl: 'https://placehold.co/600x400.png',
    category: ProductCategory.Furniture,
    tags: [ProductTag.LimitedStock],
    stock: 5,
  },
  {
    id: '4',
    name: 'Anting Filigree Perak',
    description: 'Anting filigree perak yang rumit, dibuat oleh pengrajin lokal.',
    price: 450000,
    imageUrl: 'https://placehold.co/600x400.png',
    category: ProductCategory.Accessories,
    tags: [ProductTag.Handicrafts, ProductTag.NewArrival],
    stock: 25,
  },
  {
    id: '5',
    name: 'Set Keranjang Lamun Tenun',
    description: 'Set tiga keranjang lamun serbaguna, cocok untuk penyimpanan dan dekorasi.',
    price: 600000,
    imageUrl: 'https://placehold.co/600x400.png',
    category: ProductCategory.HomeGoods,
    tags: [ProductTag.FastSelling],
    stock: 30,
  },
  {
    id: '6',
    name: 'Speaker Bluetooth Portabel',
    description: 'Speaker Bluetooth ringkas dan bertenaga untuk musik di mana saja.',
    price: 750000,
    imageUrl: 'https://placehold.co/600x400.png',
    category: ProductCategory.Electronics,
    tags: [ProductTag.OnSale],
    stock: 10,
  },
   {
    id: '7',
    name: 'Biji Kopi Organik Bali',
    description: 'Biji kopi Arabika premium dari perkebunan lokal Bali. Kaya dan aromatik.',
    price: 150000,
    imageUrl: 'https://placehold.co/600x400.png',
    category: ProductCategory.Other,
    tags: [ProductTag.BestSeller],
    stock: 100,
  },
  {
    id: '8',
    name: 'Lukisan Kanvas Buatan Tangan',
    description: 'Seni kanvas abstrak yang cerah, dilukis tangan oleh seniman lokal Bali. Karya unik.',
    price: 1800000,
    imageUrl: 'https://placehold.co/600x400.png',
    category: ProductCategory.Handicrafts,
    tags: [ProductTag.LimitedStock, ProductTag.NewArrival],
    stock: 3,
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD001',
    customerInfo: { name: 'Andika Pratama', phoneNumber: '081234567890', address: 'Jl. Mawar No. 123, Denpasar' },
    items: [
      { ...mockProducts[0], quantity: 1, price: mockProducts[0].price },
      { ...mockProducts[1], quantity: 2, price: mockProducts[1].price },
    ],
    subtotal: mockProducts[0].price + (mockProducts[1].price * 2),
    shippingFee: 50000,
    discountAmount: 0,
    totalAmount: mockProducts[0].price + (mockProducts[1].price * 2) + 50000,
    paymentMethod: PaymentMethod.COD,
    status: OrderStatus.Processing,
    amountActuallyPaid: 0, 
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 hari lalu
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: "Mohon telepon sebelum pengiriman."
  },
  {
    id: 'ORD002',
    customerInfo: { name: 'Siti Lestari', phoneNumber: '081234567891', address: 'Jl. Sunset Road No. 456, Kuta' },
    items: [
      { ...mockProducts[2], quantity: 1, price: mockProducts[2].price },
    ],
    subtotal: mockProducts[2].price,
    shippingFee: 0,
    discountAmount: 100000,
    totalAmount: mockProducts[2].price - 100000, 
    paymentMethod: PaymentMethod.DP,
    status: OrderStatus.DPPaid,
    amountActuallyPaid: (mockProducts[2].price - 100000) * 0.5, 
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 hari lalu
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    notes: "Pelanggan akan melunasi sisa pembayaran minggu depan."
  },
  {
    id: 'ORD003',
    customerInfo: { name: 'Budi Santoso', phoneNumber: '087712345678', address: 'Jl. Gatot Subroto No. 789, Badung' },
    items: [
      { ...mockProducts[4], quantity: 3, price: mockProducts[4].price },
    ],
    subtotal: mockProducts[4].price * 3,
    shippingFee: 25000,
    discountAmount: 0,
    totalAmount: (mockProducts[4].price * 3) + 25000,
    paymentMethod: PaymentMethod.Cash,
    status: OrderStatus.Paid, 
    amountActuallyPaid: (mockProducts[4].price * 3) + 25000,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 hari lalu
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'ORD004',
    customerInfo: { name: 'Dewi Anggraini', phoneNumber: '085611223344', address: 'Jl. Pantai Kuta No. 10, Kuta' },
    items: [
      { ...mockProducts[6], quantity: 2, price: mockProducts[6].price }, // Biji Kopi
    ],
    subtotal: mockProducts[6].price * 2,
    shippingFee: 15000,
    discountAmount: 0,
    totalAmount: (mockProducts[6].price * 2) + 15000,
    paymentMethod: PaymentMethod.Transfer,
    status: OrderStatus.AwaitingPayment, 
    amountActuallyPaid: 0,
    createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(), // 12 jam lalu
    updatedAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    notes: "Menunggu konfirmasi transfer."
  }
];
