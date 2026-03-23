import React from 'react';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStoreSettings } from '../context/StoreSettingsContext';

function Footer() {
  const { user } = useAuth();
  const { settings } = useStoreSettings();

  const handleProtectedLink = (e, path) => {
    if (!user) {
      e.preventDefault();
      alert('Please login to access this page');
      return false;
    }
  };

  return (
    <footer className="bg-slate-950 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="gradient-text text-xl font-bold mb-4">{settings.storeName}</h3>
            <p className="text-slate-400 text-sm">
              Premium e-commerce platform offering the best products at unbeatable prices.
            </p>
            <p className="text-slate-400 text-sm mt-3">{settings.address}</p>
            <p className="text-slate-400 text-sm mt-1">{settings.email}</p>
            <p className="text-slate-400 text-sm mt-1">{settings.phone}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/products" className="hover:text-white transition">Products</Link></li>
              <li><Link to={user ? "/cart" : "#"} onClick={(e) => handleProtectedLink(e, '/cart')} className={`transition ${user ? 'hover:text-white' : 'cursor-not-allowed opacity-50'}`}>Cart</Link></li>
              <li><Link to={user ? "/wishlist" : "#"} onClick={(e) => handleProtectedLink(e, '/wishlist')} className={`transition ${user ? 'hover:text-white' : 'cursor-not-allowed opacity-50'}`}>Wishlist</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link to="/profile" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link to="/orders" className="hover:text-white transition">Returns</Link></li>
              <li><Link to="/products" className="hover:text-white transition">FAQ</Link></li>
              <li><Link to="/products" className="hover:text-white transition">Shipping</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-cyan-300 transition"><FiFacebook size={20} /></a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-cyan-300 transition"><FiTwitter size={20} /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-cyan-300 transition"><FiInstagram size={20} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-cyan-300 transition"><FiLinkedin size={20} /></a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
            <p>&copy; 2024 {settings.storeName}. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link to="/" className="hover:text-white transition">Privacy Policy</Link>
              <Link to="/" className="hover:text-white transition">Terms of Service</Link>
              <Link to="/" className="hover:text-white transition">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
