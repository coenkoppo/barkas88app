import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  where,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { Product, Order, CustomerInfo } from '@/types';

// Koleksi Firestore
const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CUSTOMERS: 'customers'
} as const;

// === PRODUK ===
export async function createProduct(productData: Omit<Product, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
      ...productData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error membuat produk:', error);
    throw new Error('Gagal membuat produk');
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, COLLECTIONS.PRODUCTS), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error mengambil produk:', error);
    throw new Error('Gagal mengambil data produk');
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error mengambil produk:', error);
    throw new Error('Gagal mengambil data produk');
  }
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error memperbarui produk:', error);
    throw new Error('Gagal memperbarui produk');
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error menghapus produk:', error);
    throw new Error('Gagal menghapus produk');
  }
}

// === PESANAN ===
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error membuat pesanan:', error);
    throw new Error('Gagal membuat pesanan');
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const q = query(collection(db, COLLECTIONS.ORDERS), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      };
    }) as Order[];
  } catch (error) {
    console.error('Error mengambil pesanan:', error);
    throw new Error('Gagal mengambil data pesanan');
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      } as Order;
    }
    return null;
  } catch (error) {
    console.error('Error mengambil pesanan:', error);
    throw new Error('Gagal mengambil data pesanan');
  }
}

export async function updateOrder(id: string, orderData: Partial<Order>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, id);
    const updateData = { ...orderData };
    
    // Hapus field yang tidak perlu diupdate
    delete updateData.id;
    delete updateData.createdAt;
    
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error memperbarui pesanan:', error);
    throw new Error('Gagal memperbarui pesanan');
  }
}

export async function deleteOrder(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error menghapus pesanan:', error);
    throw new Error('Gagal menghapus pesanan');
  }
}

// === PELANGGAN ===
export async function getAllCustomers(): Promise<CustomerInfo[]> {
  try {
    const ordersQuery = query(collection(db, COLLECTIONS.ORDERS));
    const querySnapshot = await getDocs(ordersQuery);
    
    const customersMap = new Map<string, CustomerInfo>();
    
    querySnapshot.docs.forEach(doc => {
      const order = doc.data() as Order;
      if (order.customerInfo && order.customerInfo.phoneNumber) {
        const key = order.customerInfo.phoneNumber;
        if (!customersMap.has(key)) {
          customersMap.set(key, order.customerInfo);
        }
      }
    });
    
    return Array.from(customersMap.values());
  } catch (error) {
    console.error('Error mengambil pelanggan:', error);
    throw new Error('Gagal mengambil data pelanggan');
  }
}

// === UTILITAS ===
export async function initializeDefaultData(): Promise<void> {
  try {
    // Cek apakah sudah ada data produk
    const productsSnapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    
    if (productsSnapshot.empty) {
      console.log('Menginisialisasi data produk default...');
      
      const defaultProducts = [
        {
          name: 'Kursi Rotan Bohemian',
          description: 'Kursi rotan buatan tangan dengan desain bohemian yang unik. Cocok untuk sudut santai.',
          price: 1200000,
          imageUrl: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
          category: 'Furnitur',
          tags: ['Kerajinan Tangan', 'Baru Datang'],
          stock: 15,
        },
        {
          name: 'Kemeja Batik Angin Pulau',
          description: 'Kemeja batik katun nyaman dengan motif tradisional Bali. Ideal untuk pakaian kasual.',
          price: 350000,
          imageUrl: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
          category: 'Pakaian',
          tags: ['Terlaris', 'Cepat Laku'],
          stock: 50,
        },
        {
          name: 'Meja Kopi Kayu Jati',
          description: 'Meja kopi kayu jati solid dengan desain minimalis. Tahan lama dan bergaya.',
          price: 2500000,
          imageUrl: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
          category: 'Furnitur',
          tags: ['Stok Terbatas'],
          stock: 5,
        },
        {
          name: 'Anting Filigree Perak',
          description: 'Anting filigree perak yang rumit, dibuat oleh pengrajin lokal.',
          price: 450000,
          imageUrl: 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg',
          category: 'Aksesori',
          tags: ['Kerajinan Tangan', 'Baru Datang'],
          stock: 25,
        },
        {
          name: 'Set Keranjang Lamun Tenun',
          description: 'Set tiga keranjang lamun serbaguna, cocok untuk penyimpanan dan dekorasi.',
          price: 600000,
          imageUrl: 'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg',
          category: 'Peralatan Rumah Tangga',
          tags: ['Cepat Laku'],
          stock: 30,
        },
        {
          name: 'Speaker Bluetooth Portabel',
          description: 'Speaker Bluetooth ringkas dan bertenaga untuk musik di mana saja.',
          price: 750000,
          imageUrl: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
          category: 'Elektronik',
          tags: ['Diskon'],
          stock: 10,
        },
        {
          name: 'Biji Kopi Organik Bali',
          description: 'Biji kopi Arabika premium dari perkebunan lokal Bali. Kaya dan aromatik.',
          price: 150000,
          imageUrl: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg',
          category: 'Lainnya',
          tags: ['Terlaris'],
          stock: 100,
        },
        {
          name: 'Lukisan Kanvas Buatan Tangan',
          description: 'Seni kanvas abstrak yang cerah, dilukis tangan oleh seniman lokal Bali. Karya unik.',
          price: 1800000,
          imageUrl: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg',
          category: 'Kerajinan Tangan',
          tags: ['Stok Terbatas', 'Baru Datang'],
          stock: 3,
        },
      ];

      const batch = writeBatch(db);
      
      defaultProducts.forEach((product) => {
        const docRef = doc(collection(db, COLLECTIONS.PRODUCTS));
        batch.set(docRef, {
          ...product,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      });
      
      await batch.commit();
      console.log('Data produk default berhasil ditambahkan!');
    }
  } catch (error) {
    console.error('Error menginisialisasi data default:', error);
  }
}