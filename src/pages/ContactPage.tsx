import { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import { Phone, Mail, MessageCircle, Instagram, MapPin } from 'lucide-react';
import { saveEnquiry } from '../lib/localDb';

export default function ContactPage() {
  const [quickForm, setQuickForm] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!quickForm.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (quickForm.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!quickForm.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Remove spaces and hyphens for validation
      const cleanPhone = quickForm.phone.replace(/[\s-]/g, '');
      
      // Check if it starts with +91 (country code)
      if (cleanPhone.startsWith('+91')) {
        // Should be +91 followed by exactly 10 digits starting with 6-9
        const phoneRegex = /^\+91[6-9]\d{9}$/;
        if (!phoneRegex.test(cleanPhone)) {
          newErrors.phone = 'Please enter a valid 10-digit phone number with country code (+91)';
        } else if (cleanPhone.length !== 13) {
          newErrors.phone = 'Phone number must be exactly 10 digits after +91';
        }
      } else {
        // Should be exactly 10 digits starting with 6-9
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(cleanPhone)) {
          newErrors.phone = 'Please enter a valid 10-digit phone number (starting with 6-9)';
        } else if (cleanPhone.length !== 10) {
          newErrors.phone = 'Phone number must be exactly 10 digits';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await saveEnquiry({
        name: quickForm.name.trim(),
        phone: quickForm.phone.trim(),
        email: '',
        occasionType: 'Quick Contact',
        eventDate: '',
        location: '',
        message: quickForm.message.trim(),
      });
      
      setSubmitted(true);
      setQuickForm({ name: '', phone: '', message: '' });
      setErrors({});
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      alert('Failed to submit enquiry. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-rose-50/30 to-soft-blush py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-rose-accent to-rose-pink text-white rounded-full text-sm font-semibold mb-4 shadow-md">
            Contact Us
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-deep-plum mb-4 drop-shadow-sm" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Get in Touch</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 px-4 font-medium">
            We'd love to hear from you. Reach out through any of these channels
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-start gap-4 mb-4">
                <div className="text-rose-accent flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-deep-plum mb-1">Phone</h3>
                  <a href="tel:+919021585686" className="text-gray-800 hover:text-rose-accent transition-colors font-medium">
                    +91 90215 85686
                  </a>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-start gap-4 mb-4">
                <div className="text-rose-accent flex-shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-deep-plum mb-1">WhatsApp</h3>
                  <a
                    href="https://wa.me/919021585686"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 hover:text-rose-accent transition-colors font-medium"
                  >
                    +91 90215 85686
                  </a>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-start gap-4 mb-4">
                <div className="text-rose-accent flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-deep-plum mb-1">Email</h3>
                  <a href="mailto:info.pooja.saura.artistry@gmail.com" className="text-gray-800 hover:text-rose-accent transition-colors break-all font-medium">
                    info.pooja.saura.artistry@gmail.com
                  </a>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-start gap-4 mb-4">
                <div className="text-rose-accent flex-shrink-0">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-deep-plum mb-1">Instagram</h3>
                  <a
                    href="https://www.instagram.com/makeover_by_pooja04?igsh=YXVnOTY5NmM3NDBv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 hover:text-rose-accent transition-colors break-all font-medium"
                  >
                    @makeover_by_pooja04
                  </a>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-start gap-4">
                <div className="text-rose-accent flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-deep-plum mb-2">Service Locations</h3>
                  <p className="text-gray-800 mb-3 font-medium">
                    We provide on-location makeup services in the following areas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Mumbai', 'Satara', 'Patan', 'Koyana'].map((location) => (
                      <span
                        key={location}
                        className="px-3 py-1.5 bg-gradient-to-r from-soft-blush to-pink-100 text-deep-plum rounded-full text-sm font-semibold border border-rose-200/50"
                      >
                        📍 {location}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm mt-3 font-medium">
                    On-location services available for all occasions
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Quick Enquiry Form */}
          <Card>
            <h2 className="text-2xl font-bold text-deep-plum mb-6">Quick Enquiry</h2>
            
            {submitted && (
              <div className="mb-4 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-semibold">
                  ✅ Thank you! We'll get back to you soon.
                </p>
              </div>
            )}
            
            <form onSubmit={handleQuickSubmit} className="space-y-4">
              <Input
                label="Name *"
                value={quickForm.name}
                onChange={(e) => {
                  setQuickForm({ ...quickForm, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                error={errors.name}
                required
              />
              <Input
                label="Phone *"
                type="tel"
                value={quickForm.phone}
                onChange={(e) => {
                  // Only allow numbers, +, spaces, and hyphens
                  const value = e.target.value.replace(/[^\d+\s-]/g, '');
                  // Limit to 13 characters if starts with +91, or 10 digits otherwise
                  let limitedValue = value;
                  if (value.startsWith('+91')) {
                    // +91 (3 chars) + 10 digits = 13 chars max
                    limitedValue = value.slice(0, 13);
                  } else {
                    // Just 10 digits max
                    limitedValue = value.replace(/\D/g, '').slice(0, 10);
                  }
                  setQuickForm({ ...quickForm, phone: limitedValue });
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
                error={errors.phone}
                placeholder="e.g., 9021585686 or +919021585686"
                maxLength={13}
                required
              />
              <Textarea
                label="Message"
                rows={4}
                value={quickForm.message}
                onChange={(e) => setQuickForm({ ...quickForm, message: e.target.value })}
                placeholder="Tell us how we can help..."
              />
              <Button type="submit" className="w-full">
                Send Quick Enquiry
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

