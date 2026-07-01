'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-slate-50 py-20 border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight"
          >
            Về Chúng Tôi
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
          >
            ShopHub được sinh ra với sứ mệnh cách mạng hoá trải nghiệm mua sắm trực tuyến. Chúng tôi kết hợp nguồn thực phẩm tươi sạch nhất với công nghệ Trí tuệ Nhân tạo tiên tiến nhất.
          </motion.p>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-20 container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2"
          >
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
              {/* Replace with actual team/store image later */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-3xl font-bold opacity-50">ShopHub Team</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Câu chuyện của ShopHub</h2>
            <p className="text-slate-600 leading-relaxed mb-6 text-lg">
              Ý tưởng về ShopHub bắt đầu từ một nỗi thất vọng rất đời thường: Mua sắm online mất quá nhiều thời gian. Tại sao chúng ta phải tự lướt qua hàng trăm sản phẩm, loay hoay tìm mã giảm giá, rồi phải điền đi điền lại thông tin thanh toán?
            </p>
            <p className="text-slate-600 leading-relaxed mb-8 text-lg">
              Đó là lúc chúng tôi quyết định xây dựng một hệ thống tích hợp AI. Với ShopHub, bạn chỉ cần "nhắn tin" như với một người bạn. Trợ lý AI của chúng tôi sẽ lo phần còn lại: từ tìm kiếm, thêm vào giỏ, đến tự động áp mã giảm giá tốt nhất.
            </p>

            <div className="space-y-4">
              {[
                'Nguồn hàng chất lượng, nguồn gốc rõ ràng.',
                'Giá cả minh bạch, không phí ẩn.',
                'Luôn đặt sự tiện lợi của khách hàng lên hàng đầu.'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-slate-900 py-20 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-12">Liên hệ với chúng tôi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-800/50">
              <Phone className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Hotline</h3>
              <p className="text-slate-400">1900 1234 56</p>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-800/50">
              <Mail className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Email</h3>
              <p className="text-slate-400">support@shophub.vn</p>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-800/50">
              <MapPin className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Trụ sở chính</h3>
              <p className="text-slate-400 text-sm">Toà nhà Innovation, Quận 1, TP. Hồ Chí Minh</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
