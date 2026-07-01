'use client';

import { useState, useEffect, useRef } from 'react';
import { askAI } from '@/services/chatService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User as UserIcon,
  Bot,
  MessageSquare,
  RotateCcw,
  Download,
  X,
  Send,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/authContext'; // Import useAuth từ AuthContext
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'; // Giả sử bạn có tooltip từ shadcn/ui
import { useRouter } from 'next/navigation';
import { addToCart, getCart, updateCartQuantity, removeFromCart } from '@/app/utils/cartUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getSingleProductById } from '@/services/productService';

interface CartAction {
  action: 'ADD' | 'REMOVE' | 'UPDATE';
  productId: number;
  quantity?: number;
}

interface CheckoutIntent {
  paymentMethod: 'COD' | 'VNPAY';
}

interface OrderIntent {
  productId: number;
  quantity: number;
  productName: string;
  price: number;
  specialPrice: number;
  image: string;
}

interface ProductDisplay {
  productId: number;
  productName: string;
  price: number;
  specialPrice: number;
  image: string;
  description: string;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: number; // Thêm timestamp để hiển thị thời gian
  orderIntents?: OrderIntent[];
  productDisplays?: ProductDisplay[];
  attachedProducts?: any[]; // Lưu trữ sản phẩm đính kèm của người dùng
  cartActions?: CartAction[];
  checkoutIntent?: CheckoutIntent;
  couponIntent?: { couponCode: string };
}

const CHAT_STORAGE_KEY = 'shopHubChatMessages'; // Key để lưu trữ chat trong localStorage

export default function FloatingChatBox() {
  const { user } = useAuth(); // Lấy thông tin user từ AuthContext
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [attachedProducts, setAttachedProducts] = useState<any[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Xử lý kéo thả
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
    if (!open) {
      setOpen(true);
    }
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const product = JSON.parse(data);
        // Tránh trùng lặp
        if (!attachedProducts.some(p => p.productId === product.productId)) {
          setAttachedProducts(prev => [...prev, product]);
        }
        if (!open) setOpen(true); // Mở chat nếu đang đóng
      }
    } catch (err) {
      console.error('Failed to parse dropped product', err);
    }
  };

  // Load chat từ localStorage khi component mount
  useEffect(() => {
    const storedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages) as Message[]);
    }
  }, []);

  // Khi mở chat lần đầu (hoặc nếu không có messages), thêm câu chào mừng cá nhân hóa nếu có user
  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = user
        ? `Xin chào ${
            user.name || user.email
          }! Tôi là trợ lý ShopHub. Bạn muốn hỏi gì về sản phẩm hôm nay?`
        : 'Xin chào! Tôi là trợ lý ShopHub. Bạn muốn hỏi gì về sản phẩm hôm nay?';

      const initialMessages: Message[] = [
        {
          sender: 'ai',
          text: greeting,
          timestamp: Date.now(),
        },
      ];
      setMessages(initialMessages);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(initialMessages)); // Lưu ngay lập tức
    }
  }, [open, user, messages.length]);

  // Tự động scroll xuống cuối khi có tin nhắn mới, chat mở, hoặc trạng thái loading thay đổi
  useEffect(() => {
    if (messagesEndRef.current) {
      // Dùng setTimeout nhỏ để đảm bảo render DOM (đặc biệt khi có animation/layout transition) hoàn tất trước khi cuộn
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 50);
    }
  }, [messages, open, loading]);

  // Lưu messages vào localStorage mỗi khi messages thay đổi
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && attachedProducts.length === 0) return;

    const userMessage: Message = {
      sender: 'user',
      text: input,
      timestamp: Date.now(),
      attachedProducts: attachedProducts.length > 0 ? [...attachedProducts] : undefined
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    
    const cartItems = getCart();
    let cartContextStr = "Giỏ hàng hiện tại đang trống.";
    if (cartItems.length > 0) {
      cartContextStr = "Giỏ hàng của tôi hiện tại gồm:\n" + cartItems.map(c => `- ID: ${c.product.productId}, Tên: ${c.product.productName}, Số lượng: ${c.quantity}, Giá: ${c.product.specialPrice || c.product.price}, Hình ảnh: ${c.product.image}`).join('\n');
    }

    // Lưu tạm query để gửi
    let queryToSend = input;
    if (attachedProducts.length > 0) {
      const productContext = attachedProducts.map(p => `[ID: ${p.productId}, Tên: ${p.productName}, Giá: ${p.specialPrice || p.price}]`).join(', ');
      queryToSend = `[Ngữ cảnh hệ thống:\n${cartContextStr}]\n\n[Sản phẩm đính kèm: ${productContext}]\n\nCâu hỏi: ${input || 'Tư vấn cho tôi về các sản phẩm này.'}`;
    } else {
      queryToSend = `[Ngữ cảnh hệ thống:\n${cartContextStr}]\n\nCâu hỏi: ${input}`;
    }

    setInput(''); // Xóa input ngay lập tức để cải thiện UX
    setAttachedProducts([]); // Clear attached products

    try {
      let aiAnswer = await askAI(queryToSend);
      let orderIntents: OrderIntent[] | undefined = undefined;

      // Trích xuất ORDER_INTENT bằng regex mới
      const intentRegex = /@@ORDER_INTENT_START@@(.*?)@@ORDER_INTENT_END@@/s;
      const match = aiAnswer.match(intentRegex);
      if (match && match[1]) {
        try {
          // Fix trường hợp AI vô tình thêm ký tự lạ ở cuối
          let jsonStr = match[1].trim();
          const parsed = JSON.parse(jsonStr);
          if (Array.isArray(parsed)) {
            orderIntents = parsed;
          } else {
            orderIntents = [parsed];
          }
          // Tự động thêm vào giỏ hàng
          for (let i = 0; i < orderIntents.length; i++) {
            const intent = orderIntents[i];
            try {
              const res = await getSingleProductById(intent.productId);
              const realProduct = res.data || res;
              
              // Cập nhật lại intent để hiển thị trong chat chính xác hơn
              orderIntents[i] = {
                ...intent,
                productName: realProduct.productName || intent.productName,
                image: realProduct.image || intent.image,
                price: realProduct.price || intent.price,
                specialPrice: realProduct.specialPrice || intent.specialPrice,
              };
              
              addToCart(realProduct as any, intent.quantity);
            } catch (err) {
              console.error("Lỗi khi lấy thông tin sản phẩm thật để thêm vào giỏ:", err);
              // Fallback nếu lỗi
              addToCart(intent as any, intent.quantity);
            }
          }
        } catch (e) {
          console.error("Failed to parse order intent JSON", e);
        }
      }

      // Xóa tất cả dấu vết của order intent khỏi hiển thị (phòng khi AI xuất ra nhiều cái)
      aiAnswer = aiAnswer.replace(/@@ORDER_INTENT_START@@.*?@@ORDER_INTENT_END@@/gs, '').trim();
      aiAnswer = aiAnswer.replace(/@@ORDER_INTENT_START@@.*/gs, '').trim(); // AI quên đóng thẻ
      aiAnswer = aiAnswer.replace(/\[ORDER_INTENT:.*?\]/gs, '').trim(); // Fallback thẻ cũ
      aiAnswer = aiAnswer.replace(/\[ORDER_INTENT:.*/gs, '').trim(); // Fallback thẻ cũ bị lỗi

      // Trích xuất PRODUCT_LIST
      let productDisplays: ProductDisplay[] | undefined = undefined;
      const productRegex = /@@PRODUCT_LIST_START@@(.*?)@@PRODUCT_LIST_END@@/s;
      const productMatch = aiAnswer.match(productRegex);
      if (productMatch && productMatch[1]) {
        try {
          productDisplays = JSON.parse(productMatch[1].trim());
        } catch (e) {
          console.error("Failed to parse product list JSON", e);
        }
      }
      
      // Xóa dấu vết của product list
      aiAnswer = aiAnswer.replace(/@@PRODUCT_LIST_START@@.*?@@PRODUCT_LIST_END@@/gs, '').trim();
      aiAnswer = aiAnswer.replace(/@@PRODUCT_LIST_START@@.*/gs, '').trim();

      // Trích xuất CART_ACTION
      let cartActions: CartAction[] | undefined = undefined;
      const cartRegex = /@@ACTION_CART_START@@(.*?)@@ACTION_CART_END@@/s;
      const cartMatch = aiAnswer.match(cartRegex);
      if (cartMatch && cartMatch[1]) {
        try {
          const parsed = JSON.parse(cartMatch[1].trim());
          cartActions = Array.isArray(parsed) ? parsed : [parsed];
          
          // Thực thi action lên giỏ hàng thực tế luôn (auto-execute)
          cartActions.forEach(action => {
             if (action.action === 'REMOVE') {
               removeFromCart(action.productId);
             } else if (action.action === 'UPDATE' && action.quantity) {
               const existing = getCart().find(c => c.product.productId === action.productId);
               if (existing) {
                 updateCartQuantity(existing.product, action.quantity);
               }
             }
          });
        } catch (e) {
          console.error("Failed to parse cart action JSON", e);
        }
      }
      aiAnswer = aiAnswer.replace(/@@ACTION_CART_START@@.*?@@ACTION_CART_END@@/gs, '').trim();

      // Trích xuất CHECKOUT_INTENT
      let checkoutIntent: CheckoutIntent | undefined = undefined;
      const checkoutRegex = /@@ACTION_CHECKOUT_START@@(.*?)@@ACTION_CHECKOUT_END@@/s;
      const checkoutMatch = aiAnswer.match(checkoutRegex);
      if (checkoutMatch && checkoutMatch[1]) {
        try {
          checkoutIntent = JSON.parse(checkoutMatch[1].trim());
        } catch (e) {
          console.error("Failed to parse checkout intent JSON", e);
        }
      }
      aiAnswer = aiAnswer.replace(/@@ACTION_CHECKOUT_START@@.*?@@ACTION_CHECKOUT_END@@/gs, '').trim();

      // Trích xuất COUPON_INTENT
      let couponIntent: { couponCode: string } | undefined = undefined;
      const couponRegex = /@@ACTION_COUPON_START@@(.*?)@@ACTION_COUPON_END@@/s;
      const couponMatch = aiAnswer.match(couponRegex);
      if (couponMatch && couponMatch[1]) {
        try {
          couponIntent = JSON.parse(couponMatch[1].trim());
          if (couponIntent && couponIntent.couponCode) {
            localStorage.setItem('applied_coupon', couponIntent.couponCode);
          }
        } catch (e) {
          console.error("Failed to parse coupon intent JSON", e);
        }
      }
      aiAnswer = aiAnswer.replace(/@@ACTION_COUPON_START@@.*?@@ACTION_COUPON_END@@/gs, '').trim();

      const aiMessage: Message = {
        sender: 'ai',
        text: aiAnswer,
        timestamp: Date.now(),
        orderIntents,
        productDisplays,
        cartActions,
        checkoutIntent,
        couponIntent
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Xin lỗi, hiện tại tôi không thể trả lời.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Function để clear chat
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  };

  // Function thú vị: Export chat thành file text
  const exportChat = () => {
    const chatText = messages
      .map((m) => {
        const time = new Date(m.timestamp).toLocaleString();
        return `${m.sender === 'user' ? 'You' : 'AI'} (${time}): ${m.text}`;
      })
      .join('\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ShopHub_Chat.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format thời gian cho tin nhắn
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isDraggingOver ? 'scale-105' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`mb-4 relative rounded-3xl ${loading ? 'p-[3px] shadow-[0_0_40px_rgba(168,85,247,0.4)]' : 'shadow-2xl'} transition-all duration-500`}
          >
            {/* Hiệu ứng viền gradient xoay khi AI đang phản hồi */}
            {loading && (
              <div className="absolute inset-0 rounded-3xl overflow-hidden z-0">
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%]"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 70%, #8b5cf6 80%, #ec4899 90%, #3b82f6 100%)'
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              </div>
            )}

            <AnimatePresence>
              {isDraggingOver && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-50 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 backdrop-blur-md border-[3px] border-dashed border-indigo-400 rounded-3xl flex items-center justify-center pointer-events-none overflow-hidden shadow-[inset_0_0_50px_rgba(99,102,241,0.2)]"
                >
                  <motion.div 
                    className="absolute inset-0 bg-white/20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div 
                    initial={{ y: 20 }}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="bg-white/90 backdrop-blur-xl px-6 py-4 rounded-2xl font-bold text-indigo-700 shadow-2xl flex flex-col items-center gap-3 border border-indigo-100 relative z-10"
                  >
                    <motion.div 
                      className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center shadow-inner"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                    >
                      <Download className="w-7 h-7 text-indigo-600" />
                    </motion.div>
                    <span className="text-base tracking-wide">Thả sản phẩm vào đây! ✨</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <Card className={`relative z-10 w-[360px] sm:w-[450px] ${!loading ? 'border border-slate-200' : 'border-0'} overflow-hidden bg-white ${loading ? 'rounded-[21px]' : 'rounded-3xl'} flex flex-col transition-all duration-500`}>
              <CardHeader className='bg-white text-slate-800 p-4 flex flex-row items-center justify-between border-b border-slate-100'>
                <CardTitle className='text-base font-semibold flex items-center gap-2'>
                  <Bot className='w-5 h-5 text-slate-800' />
                  ShopHub AI
                  {user && (
                    <span className='text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full ml-1'>
                      {user.name || user.email}
                    </span>
                  )}
                </CardTitle>
                <div className='flex gap-1'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={exportChat}
                          className='text-slate-500 hover:text-slate-900 hover:bg-slate-100 h-8 w-8 rounded-full'
                        >
                          <Download className='w-4 h-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Xuất đoạn chat</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={clearChat}
                          className='text-slate-500 hover:text-slate-900 hover:bg-slate-100 h-8 w-8 rounded-full'
                        >
                          <RotateCcw className='w-4 h-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Xóa lịch sử</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>

              <CardContent className='flex flex-col h-[550px] p-0 bg-transparent'>
                <ScrollArea
                  className='flex-1 p-4 overflow-x-hidden'
                  ref={scrollRef}
                >
                  <AnimatePresence>
                    {messages.map((m, i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, x: m.sender === 'user' ? 20 : -20, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 25 }}
                        className={`mb-4 flex items-end w-full ${
                          m.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {m.sender === 'ai' && (
                          <div className='w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-2 flex-shrink-0 border border-slate-200'>
                            <Bot className='w-5 h-5 text-slate-600' />
                          </div>
                        )}
                        <div className={`flex flex-col max-w-[calc(100%-2.5rem)] min-w-0 ${m.sender === 'user' ? 'items-end ml-auto' : 'items-start'}`}>
                          <div
                            className={`px-4 py-2.5 w-fit max-w-full break-words whitespace-pre-wrap shadow-sm text-sm leading-relaxed overflow-hidden ${
                              m.sender === 'user'
                                ? 'bg-slate-900 text-white rounded-2xl rounded-br-[4px]'
                                : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-2xl rounded-bl-[4px]'
                            }`}
                          >
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  img: ({node, ...props}) => <img className="w-16 h-16 object-cover rounded-md border border-slate-200 my-1 shadow-sm hover:scale-105 transition-transform" {...props} />,
                                  table: ({node, ...props}) => <div className="overflow-x-auto my-3"><table className="w-full text-left border-collapse min-w-[300px] text-sm" {...props} /></div>,
                                  th: ({node, ...props}) => <th className="bg-slate-100 font-medium p-2 border-b-2 border-slate-200 text-slate-800 whitespace-nowrap" {...props} />,
                                  td: ({node, ...props}) => <td className="p-2 border-b border-slate-100 align-middle text-slate-700" {...props} />,
                                  a: ({node, ...props}) => <a className="text-slate-900 hover:underline font-medium" {...props} />,
                                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                                }}
                              >
                                {m.text}
                              </ReactMarkdown>

                            {m.attachedProducts && m.attachedProducts.length > 0 && (
                              <div className="mt-2 flex flex-col gap-1.5">
                                {m.attachedProducts.map((p, idx) => (
                                  <div key={idx} className="flex items-center gap-2 bg-white/20 rounded-md p-1.5 pr-3">
                                    {p.image && <img src={`http://localhost:8080/api/public/products/image/${p.image}`} alt={p.productName} className="w-6 h-6 object-cover rounded bg-white" />}
                                    <span className="text-xs font-medium line-clamp-1">{p.productName}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {m.orderIntents && m.orderIntents.length > 0 && (
                              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2 shadow-sm w-full min-w-[250px]">
                                <div className="flex items-center gap-2 font-medium text-slate-800 text-sm">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Đã thêm vào giỏ hàng
                                </div>
                                {m.orderIntents.map((intent, idx) => (
                                  <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: idx * 0.1 }}
                                    className="text-sm font-medium text-slate-800 flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100 shadow-sm"
                                  >
                                    {intent.image && <img src={`http://localhost:8080/api/public/products/image/${intent.image}`} alt={intent.productName} className="w-12 h-12 object-cover rounded-md border border-slate-200" />}
                                    <div className="flex flex-col flex-1">
                                      <span className="line-clamp-1">{intent.productName}</span>
                                      <span className="text-xs text-slate-500 font-normal">Số lượng: {intent.quantity}</span>
                                    </div>
                                  </motion.div>
                                ))}
                                <Button 
                                  size="sm" 
                                  className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-lg"
                                  onClick={() => {
                                    router.push('/site/cart');
                                    setOpen(false);
                                  }}
                                >
                                  Xem Giỏ hàng
                                </Button>
                              </div>
                            )}

                            {m.productDisplays && m.productDisplays.length > 0 && (
                              <div className="mt-3 flex flex-col gap-2 w-full min-w-[250px]">
                                <div className="text-xs font-medium text-slate-500 mb-1">Gợi ý sản phẩm:</div>
                                {m.productDisplays.map((p, idx) => (
                                  <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ type: "spring", stiffness: 250, damping: 20, delay: 0.1 + idx * 0.1 }}
                                    className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-shadow flex flex-col gap-2"
                                  >
                                    <div className="flex gap-3 items-start">
                                      {p.image && <img src={`http://localhost:8080/api/public/products/image/${p.image}`} alt={p.productName} className="w-14 h-14 object-cover rounded-md border border-slate-100 flex-shrink-0" />}
                                      <div className="flex flex-col flex-1 min-w-0">
                                        <span className="font-medium text-slate-800 text-sm line-clamp-1">{p.productName}</span>
                                        <span className="text-sm font-semibold text-slate-900">
                                          ${p.specialPrice > 0 ? p.specialPrice.toFixed(2) : p.price.toFixed(2)}
                                          {p.specialPrice > 0 && <span className="ml-1.5 text-xs line-through text-slate-400 font-normal">${p.price.toFixed(2)}</span>}
                                        </span>
                                      </div>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="w-full h-8 mt-1 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium text-xs rounded-lg"
                                      onClick={async () => {
                                        try {
                                          const res = await getSingleProductById(p.productId);
                                          const realProduct = res.data || res;
                                          addToCart(realProduct as any, 1);
                                        } catch (err) {
                                          console.error("Failed to fetch real product", err);
                                          addToCart({ productId: p.productId, productName: p.productName, price: p.price, specialPrice: p.specialPrice, image: p.image } as any, 1);
                                        }
                                      }}
                                    >
                                      Thêm vào giỏ
                                    </Button>
                                  </motion.div>
                                ))}
                              </div>
                            )}

                            {m.checkoutIntent && (
                              <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm w-full min-w-[250px]">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-slate-800 text-sm">Xác nhận Đơn hàng</h4>
                                    <p className="text-xs text-slate-600 font-medium">{m.checkoutIntent.paymentMethod === 'VNPAY' ? 'Thanh toán qua VNPay' : 'Thanh toán khi nhận hàng (COD)'}</p>
                                  </div>
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-slate-100 mb-3 text-center">
                                  <p className="text-xs text-slate-500">Hệ thống sẽ sử dụng thông tin mặc định của bạn.</p>
                                </div>
                                <Button 
                                  size="sm" 
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-lg"
                                  onClick={() => {
                                    const savedCoupon = localStorage.getItem('applied_coupon') || '';
                                    router.push(`/site/checkout?paymentMethod=${m.checkoutIntent!.paymentMethod.toLowerCase()}&autoSubmit=true&coupon=${savedCoupon}`);
                                    setOpen(false);
                                  }}
                                >
                                  Tiến hành Thanh toán
                                </Button>
                              </div>
                            )}

                            {m.couponIntent && (
                              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm w-full min-w-[250px]">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-slate-600 mb-0.5">Đã áp dụng mã</p>
                                  <p className="font-semibold text-slate-900 tracking-wide">{m.couponIntent.couponCode}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          <span className='text-[10px] text-slate-400 mt-1 px-1'>
                            {formatTime(m.timestamp)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {loading && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 25 }}
                      className='mb-4 flex items-end justify-start'
                    >
                      <motion.div 
                        className='w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center mr-2 flex-shrink-0 border border-indigo-100'
                        animate={{ 
                          boxShadow: ["0px 0px 0px 0px rgba(99, 102, 241, 0.2)", "0px 0px 0px 8px rgba(99, 102, 241, 0)"]
                        }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0], y: [0, -2, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        >
                          <Bot className='w-5 h-5 text-indigo-600' />
                        </motion.div>
                      </motion.div>
                      <div className='px-4 py-3 bg-slate-50 text-slate-800 border border-slate-100 rounded-2xl rounded-bl-[4px] shadow-sm flex items-center gap-2'>
                        <span className="text-sm font-medium text-slate-500 mr-1">AI đang suy nghĩ</span>
                        <motion.div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }} />
                        <motion.div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.15 }} />
                        <motion.div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.3 }} />
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </ScrollArea>

                <div className='p-3 bg-white/50 backdrop-blur-md border-t border-slate-100'>
                  {attachedProducts.length > 0 && (
                    <div className="mb-2 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                      {attachedProducts.map((p, idx) => (
                        <div key={idx} className="relative flex-shrink-0 bg-white border border-slate-200 rounded-lg p-1.5 flex items-center gap-2 shadow-sm pr-6 group">
                          {p.image && <img src={`http://localhost:8080/api/public/products/image/${p.image}`} alt={p.productName} className="w-8 h-8 object-cover rounded border border-slate-100" />}
                          <div className="flex flex-col max-w-[120px]">
                            <span className="text-[10px] font-medium text-slate-700 line-clamp-1">{p.productName}</span>
                            <span className="text-[10px] text-slate-900 font-semibold">${p.specialPrice || p.price}</span>
                          </div>
                          <button 
                            className="absolute top-1 right-1 w-4 h-4 bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center transition-colors"
                            onClick={() => setAttachedProducts(prev => prev.filter((_, i) => i !== idx))}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className='relative flex items-center'>
                    <Input
                      placeholder='Hỏi ShopHub AI điều gì đó...'
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      disabled={loading}
                      className='pr-12 rounded-full border-slate-200 bg-slate-50 focus-visible:ring-slate-400 shadow-sm h-11'
                    />
                    <Button
                      size='icon'
                      onClick={handleSend}
                      disabled={loading || (!input.trim() && attachedProducts.length === 0)}
                      className='absolute right-1.5 h-8 w-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white transition-transform active:scale-95 disabled:opacity-50'
                    >
                      <Send className='w-4 h-4 ml-0.5' />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-end">
        <AnimatePresence>
          {!open && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1, y: [0, -4, 0] }}
              exit={{ opacity: 0, scale: 0.8, x: 10 }}
              transition={{ 
                duration: 0.3,
                y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
              }}
              className="absolute right-[80px] bg-white text-indigo-600 text-sm font-bold px-4 py-2.5 rounded-2xl shadow-xl shadow-purple-500/10 border border-purple-100 whitespace-nowrap cursor-pointer z-40"
              onClick={() => setOpen(true)}
            >
              Hỏi AI ngay! ✨
              {/* Mũi tên chỉ vào bot */}
              <div className="absolute top-1/2 -right-[7px] -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-white border-b-[6px] border-b-transparent drop-shadow-[1px_0_1px_rgba(233,213,255,1)]"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.08, rotate: [0, -10, 10, -10, 0] }}
          whileTap={{ scale: 0.92 }}
          transition={{ rotate: { duration: 0.5, ease: "easeInOut" } }}
          className='rounded-full p-0 w-16 h-16 flex items-center justify-center bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-pink-500 text-white shadow-2xl shadow-purple-500/40 focus:outline-none z-50 relative border-2 border-white/30 hover:border-white/60 transition-colors'
          onClick={() => setOpen((prev) => !prev)}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className='w-7 h-7 drop-shadow-md' />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
                className="relative flex items-center justify-center w-full h-full"
              >
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <Bot className='w-8 h-8 drop-shadow-md' />
                </motion.div>
                
                {/* Hiệu ứng sóng lan tỏa */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white/50"
                  animate={{ scale: [1, 1.4], opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white/30"
                  animate={{ scale: [1, 1.7], opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.5 }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
