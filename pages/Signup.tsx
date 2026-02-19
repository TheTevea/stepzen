import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import logoImg from '@/src/assets/images/logo.svg';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    
    setIsSubmitting(true);
    try {
      await signup(email, name);
      navigate('/');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border-2 border-black rounded-xl p-8 shadow-neo animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 overflow-hidden">
              <img src={logoImg} alt="Stepzen Logo" className="w-full h-full object-cover" />
           </div>
           <h1 className="text-3xl font-display font-bold">Join Stepzen</h1>
           <p className="text-gray-600 mt-2">Start your career journey today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                placeholder="Jane Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                placeholder="developer@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            fullWidth 
            size="lg" 
            disabled={isSubmitting}
            className="group"
          >
            {isSubmitting ? 'Creating Account...' : (
              <span className="flex items-center gap-2">
                Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>

          <div className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link to="/login" className="font-bold text-black hover:text-primary">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;