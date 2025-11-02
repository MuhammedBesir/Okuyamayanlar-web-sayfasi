'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  Users, 
  Heart, 
  Mail, 
  MapPin, 
  Phone,
  ArrowUp,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Send
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [stats, setStats] = useState({
    books: 0,
    members: 0,
    events: 0,
    discussions: 0
  });
  const [targetStats, setTargetStats] = useState({
    books: 0,
    members: 0,
    events: 0,
    discussions: 0
  });

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch real stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          
          setTargetStats({
            books: data.books || 0,
            members: data.members || 0,
            events: data.events || 0,
            discussions: data.discussions || 0
          });
        } else {
          throw new Error('Failed to fetch stats');
        }
      } catch (error) {
        // Fallback to default values
        setTargetStats({
          books: 150,
          members: 45,
          events: 32,
          discussions: 89
        });
      }
    };

    fetchStats();
  }, []);

  // Animated counter effect
  useEffect(() => {
    const animateCount = (key: keyof typeof stats, target: number) => {
      let current = stats[key];
      const increment = Math.ceil(target / 50);
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setStats(prev => ({ ...prev, [key]: current }));
      }, 30);
      return timer;
    };

    const timers: NodeJS.Timeout[] = [];
    
    if (targetStats.books > 0) {
      timers.push(animateCount('books', targetStats.books));
      timers.push(animateCount('members', targetStats.members));
      timers.push(animateCount('events', targetStats.events));
      timers.push(animateCount('discussions', targetStats.discussions));
    }

    return () => {
      timers.forEach(timer => clearInterval(timer));
    };
  }, [targetStats]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  const socialLinks = [
    { icon: Facebook, href: 'https://www.instagram.com/okuyamayanlar2022/', label: 'Facebook', color: 'hover:text-amber-500' },
    { icon: Twitter, href: 'https://www.instagram.com/okuyamayanlar2022/', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: Instagram, href: 'https://www.instagram.com/okuyamayanlar2022/', label: 'Instagram', color: 'hover:text-pink-500' },
    { icon: Linkedin, href: 'https://www.instagram.com/okuyamayanlar2022/', label: 'LinkedIn', color: 'hover:text-blue-600' }
  ];

  const quickLinks = [
    { icon: BookOpen, href: '/library', label: 'Kütüphane' },
    { icon: Calendar, href: '/events', label: 'Etkinlikler' },
    { icon: MessageSquare, href: '/forum', label: 'Forum' },
    { icon: Users, href: '/about', label: 'Hakkımızda' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      {/* Scroll to Top Button */}
      <motion.button
        onClick={scrollToTop}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: showScrollTop ? 1 : 0, 
          scale: showScrollTop ? 1 : 0 
        }}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 p-3 sm:p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-full shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 hover:scale-110 group"
      >
        <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6 group-hover:-translate-y-1 transition-transform" />
      </motion.button>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 border-t-4 border-amber-500 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10 dark:opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 bg-amber-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-600 rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10 px-3 sm:px-4 py-6 sm:py-8 md:py-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8"
          >
            {/* Brand & About */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl md:rounded-2xl shadow-lg flex-shrink-0">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg md:text-2xl font-black text-white truncate">Okuyamayanlar</h3>
                  <p className="text-[10px] sm:text-xs md:text-sm text-amber-400 font-semibold truncate">Kitap Kulübü</p>
                </div>
              </div>
              
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 md:mb-6">
                📚 Kar amacı gütmeyen, kitap severlerin buluşma noktası. Birlikte okuyup, birlikte büyüyoruz.
              </p>

              {/* Social Media */}
              <div className="flex gap-2 sm:gap-2.5 md:gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-800 rounded-lg md:rounded-xl flex items-center justify-center shadow-md hover:shadow-xl transition-all ${social.color} text-gray-400`}
                  >
                    <social.icon className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants}>
              <h3 className="text-sm sm:text-base md:text-xl font-bold mb-3 sm:mb-4 md:mb-6 text-white flex items-center gap-2">
                <div className="w-1 sm:w-1.5 md:w-2 h-5 sm:h-6 md:h-8 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
                Keşfet
              </h3>
              <ul className="space-y-2 sm:space-y-2.5 md:space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={link.label}
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Link 
                      href={link.href}
                      className="flex items-center gap-2 sm:gap-2.5 md:gap-3 text-gray-300 hover:text-amber-400 transition-colors group"
                    >
                      <div className="p-1 sm:p-1.5 md:p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors flex-shrink-0">
                        <link.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-amber-400" />
                      </div>
                      <span className="font-medium text-xs sm:text-sm md:text-base">{link.label}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div variants={itemVariants}>
              <h3 className="text-sm sm:text-base md:text-xl font-bold mb-3 sm:mb-4 md:mb-6 text-white flex items-center gap-2">
                <div className="w-1 sm:w-1.5 md:w-2 h-5 sm:h-6 md:h-8 bg-gradient-to-b from-amber-600 to-amber-500 rounded-full"></div>
                İletişim
              </h3>
              <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                <div className="flex items-start gap-2 text-[10px] sm:text-xs md:text-sm text-gray-400">
                  <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="break-words">Eskişehir, Türkiye</span>
                </div>
                <div className="flex items-start gap-2 text-[10px] sm:text-xs md:text-sm text-gray-400">
                  <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="break-words">0553 189 83 95</span>
                </div>
                <div className="flex items-start gap-2 text-[10px] sm:text-xs md:text-sm text-gray-400">
                  <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="break-all">okuyamayanlar2022@gmail.com</span>
                </div>
              </div>
            </motion.div>

            {/* Live Stats - Hidden on mobile, shown on desktop */}
            <motion.div variants={itemVariants} className="hidden lg:block">
              <h3 className="text-base md:text-xl font-bold mb-4 md:mb-6 text-white flex items-center gap-2">
                <div className="w-1.5 md:w-2 h-6 md:h-8 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
                İstatistikler
              </h3>
              <div className="grid grid-cols-2 gap-2.5 md:gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 backdrop-blur-sm border border-amber-500/30 rounded-xl p-3 md:p-4 hover:shadow-lg transition-all"
                >
                  <div className="text-2xl md:text-3xl font-black text-amber-400 mb-0.5 md:mb-1">{stats.books}</div>
                  <div className="text-[10px] md:text-xs font-semibold text-gray-300">📚 Kitap</div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-3 md:p-4 hover:shadow-lg transition-all"
                >
                  <div className="text-2xl md:text-3xl font-black text-blue-400 mb-0.5 md:mb-1">{stats.members}</div>
                  <div className="text-[10px] md:text-xs font-semibold text-gray-300">👥 Üye</div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm border border-green-500/30 rounded-xl p-3 md:p-4 hover:shadow-lg transition-all"
                >
                  <div className="text-2xl md:text-3xl font-black text-green-400 mb-0.5 md:mb-1">{stats.events}</div>
                  <div className="text-[10px] md:text-xs font-semibold text-gray-300">🎉 Etkinlik</div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-sm border border-purple-500/30 rounded-xl p-3 md:p-4 hover:shadow-lg transition-all"
                >
                  <div className="text-2xl md:text-3xl font-black text-purple-400 mb-0.5 md:mb-1">{stats.discussions}</div>
                  <div className="text-[10px] md:text-xs font-semibold text-gray-300">💬 Tartışma</div>
                </motion.div>
              </div>

              {/* Made with Love */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-amber-500/20"
              >
                <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-300">
                  <span>Kitap sevgisiyle kalın</span>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Heart className="h-4 w-4 md:h-5 md:w-5 text-red-500 fill-red-500" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="pt-6 sm:pt-8 border-t-2 border-amber-500/20"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
              <div className="text-center md:text-left">
                <p className="text-xs sm:text-sm text-gray-300 font-medium">
                  © 2024-2025 <span className="text-amber-400 font-bold">Okuyamayanlar Kitap Kulübü</span>
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                  Kutsan Tarafından geliştirildi.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 justify-center">
                <motion.a
                  href="/privacy-policy"
                  whileHover={{ y: -2 }}
                  className="text-xs sm:text-sm text-gray-400 hover:text-amber-400 transition-colors font-medium"
                >
                  Gizlilik Politikası
                </motion.a>
                <motion.a
                  href="/terms-of-service"
                  whileHover={{ y: -2 }}
                  className="text-xs sm:text-sm text-gray-400 hover:text-amber-400 transition-colors font-medium"
                >
                  Kullanım Şartları
                </motion.a>
                <motion.a
                  href="/cookie-policy"
                  whileHover={{ y: -2 }}
                  className="text-xs sm:text-sm text-gray-400 hover:text-amber-400 transition-colors font-medium"
                >
                  Çerez Politikası
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </>
  );
}
