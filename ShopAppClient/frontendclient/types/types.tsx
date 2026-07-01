export type Product = {
  productId: number;
  productName: string;
  image: string;
  productDescription: string;
  quantity: number;
  price: number;
  discount: number;
  specialPrice: number;
  categoryId: number;
};

export type ProductResponse = {
  content: Product[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
};

export type ProductQueryParams = {
  keyword?: string; // Tùy chọn, vì có thể không có từ khóa
  pageNumber?: string;
  pageSize?: string;
  sortBy?: string;
  sortOrder?: string;
  categoryId?: string; // Tùy chọn
  // Thêm bất kỳ tham số truy vấn nào khác ở đây
};

export type Category = {
  categoryId: number;
  categoryName: string;
};

export type CategoryResponse = {
  content: Category[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartItemForCart = {
  product: Product;
  quantity: number;
};

export type CartItemDetail = {
  id: number;
  name: string;
  specialPrice: number;
  quantity: number;
  image: string;
};

export type CreatePaymentParams = {
  orderId: string;
  amount: number;
  orderInfo: string;
  clientIp: string;
};

export type CreatePaymentResponse = {
  paymentUrl?: string;
  message?: string;
};

export type ProductDTO = {
  productId: number;
  productName: string;
  image: string;
  price: number;
  specialPrice: number;
};

export type OrderItemDTO = {
  orderItemId: number;
  product: ProductDTO;
  quantity: number;
  discount: number;
  orderedProductPrice: number;
};

export type PaymentDTO = {
  paymentId: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate: string;
};

export type OrderDTO = {
  orderId: number;
  email: string;
  orderItems: OrderItemDTO[];
  orderDate: string; // ISO string từ backend
  payment: PaymentDTO;
  totalAmount: number;
  orderStatus: string;
};
