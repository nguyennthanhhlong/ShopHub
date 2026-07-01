'use client';

import { motion } from 'framer-motion';
import { Bot, Zap, Ticket, Heart, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: <Bot className="w-10 h-10 text-indigo-500" />,
    title: 'Trợ lý AI 24/7',
    description: 'Hỏi đáp, tìm kiếm sản phẩm, và thậm chí mặc cả giá cả trực tiếp với trợ lý trí tuệ nhân tạo cực kỳ thông minh của chúng tôi.',
  },
  {
    icon: <Zap className="w-10 h-10 text-amber-500" />,
    title: 'Thanh toán Một chạm',
    description: 'Bỏ qua các bước rườm rà. Tích hợp thanh toán VNPAY và tự động điền thông tin giúp bạn chốt đơn chỉ trong chớp mắt.',
  },
  {
    icon: <Ticket className="w-10 h-10 text-pink-500" />,
    title: 'Mã giảm giá Thông minh',
    description: 'Hệ thống tự động quét và đề xuất các mã giảm giá phù hợp nhất. Không cần tìm kiếm, AI sẽ tự động gài mã vào giỏ hàng của bạn.',
  },
  {
    icon: <Heart className="w-10 h-10 text-red-500" />,
    title: 'Quản lý Yêu thích',
    description: 'Dễ dàng lưu lại những sản phẩm bạn ưng ý nhất vào danh sách Wishlist để mua sắm sau này.',
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-emerald-500" />,
    title: 'An toàn & Bảo mật',
    description: 'Bảo vệ dữ liệu cá nhân của bạn với công nghệ mã hóa tiên tiến nhất, giao dịch an tâm tuyệt đối.',
  },
  {
    icon: <Truck className="w-10 h-10 text-blue-500" />,
    title: 'Giao hàng Siêu tốc',
    description: 'Theo dõi tiến trình giao hàng theo thời gian thực. Nhận hàng tươi sạch ngay trong ngày tại nội thành.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Trải nghiệm mua sắm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Công Nghệ Cao</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            ShopHub không chỉ là một cửa hàng trực tuyến, mà là một hệ sinh thái mua sắm thông minh được thiết kế để tiết kiệm thời gian và tiền bạc của bạn.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="bg-slate-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 text-center bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <h2 className="text-3xl font-bold mb-4 relative z-10">Sẵn sàng trải nghiệm?</h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto relative z-10">Hãy bắt đầu cuộc trò chuyện với Trợ lý AI của chúng tôi ngay góc dưới bên phải màn hình để khám phá sự khác biệt.</p>
          <Link href="/site/products">
            <button className="relative z-10 px-8 py-4 bg-white text-indigo-900 font-bold rounded-full hover:scale-105 transition-transform shadow-lg">
              Khám phá Sản phẩm ngay
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
