import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { saveEnquiry } from '../lib/localDb';

// Check if we're in development mode
const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export default function EnquiryPage() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    occasionType: location.state?.service || '',
    eventDate: '',
    location: '',
    budgetRange: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  
  useEffect(() => {
    if (location.state?.service) {
      setFormData(prev => ({ ...prev, occasionType: location.state.service }));
    }
  }, [location.state]);
  
  const occasionOptions = [
    { value: '', label: 'Select Occasion Type' },
    { value: 'Bridal Makeup', label: 'Bridal Makeup' },
    { value: 'Sider Makeup', label: 'Sider Makeup' },
    { value: 'Engagement Makeup', label: 'Engagement Makeup' },
    { value: 'Baby Shower Makeup', label: 'Baby Shower Makeup' },
    { value: 'Party Makeup', label: 'Party Makeup' },
    { value: 'Pre-Wedding Makeup', label: 'Pre-Wedding Makeup' },
    { value: 'Photoshoot Makeup', label: 'Photoshoot Makeup' },
    { value: 'Other', label: 'Other' },
  ];
  
  const budgetOptions = [
    { value: '', label: 'Select Budget Range' },
    { value: 'Under ₹5,000', label: 'Under ₹5,000' },
    { value: '₹5,000 - ₹10,000', label: '₹5,000 - ₹10,000' },
    { value: '₹10,000 - ₹20,000', label: '₹10,000 - ₹20,000' },
    { value: '₹20,000 - ₹35,000', label: '₹20,000 - ₹35,000' },
    { value: 'Above ₹35,000', label: 'Above ₹35,000' },
  ];
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Remove spaces and hyphens for validation
      const cleanPhone = formData.phone.replace(/[\s-]/g, '');
      
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
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    // Occasion type validation
    if (!formData.occasionType) {
      newErrors.occasionType = 'Occasion type is required';
    }
    
    // Event date validation (dd/mm/yyyy format)
    if (!formData.eventDate.trim()) {
      newErrors.eventDate = 'Event date is required';
    } else {
      // Validate dd/mm/yyyy format
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = formData.eventDate.trim().match(dateRegex);
      
      if (!match) {
        newErrors.eventDate = 'Date must be in dd/mm/yyyy format (e.g., 25/12/2024)';
      } else {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        
        // Validate date ranges
        if (month < 1 || month > 12) {
          newErrors.eventDate = 'Month must be between 01 and 12';
        } else if (day < 1 || day > 31) {
          newErrors.eventDate = 'Day must be between 01 and 31';
        } else {
          // Create date object (month is 0-indexed in JavaScript Date)
          const selectedDate = new Date(year, month - 1, day);
          
          // Check if date is valid (handles invalid dates like 31/02/2024)
          if (
            selectedDate.getDate() !== day ||
            selectedDate.getMonth() !== month - 1 ||
            selectedDate.getFullYear() !== year
          ) {
            newErrors.eventDate = 'Invalid date. Please check day and month.';
          } else {
            // Check if date is in the past
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
              newErrors.eventDate = 'Event date cannot be in the past';
            }
          }
        }
      }
    }
    
    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.trim().length < 2) {
      newErrors.location = 'Location must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await saveEnquiry(formData);
      setSubmitted(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        occasionType: '',
        eventDate: '',
        location: '',
        budgetRange: '',
        message: '',
      });
      
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit enquiry. Please try again.';
      alert(errorMessage);
      if (isDev) {
        console.error('Error submitting enquiry:', error);
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-rose-50/30 to-soft-blush py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-rose-accent to-rose-pink text-white rounded-full text-sm font-semibold mb-4 shadow-md">
            Get Started
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-deep-plum mb-4 drop-shadow-sm" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            Book Your Makeover
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 px-4 font-medium">
            Fill out the form below and we'll get back to you soon!
          </p>
        </div>
        
        {submitted && (
          <Card className="mb-6 bg-green-50 border-2 border-green-200">
            <p className="text-green-800 font-semibold text-center">
              ✅ Thank you! Your enquiry has been submitted successfully. We'll contact you soon.
            </p>
          </Card>
        )}
        
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Name *"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                error={errors.name}
                required
              />
              <Input
                label="Phone *"
                type="tel"
                value={formData.phone}
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
                  setFormData({ ...formData, phone: limitedValue });
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
                error={errors.phone}
                placeholder="e.g., 9021585686 or +919021585686"
                maxLength={13}
                required
              />
            </div>
            
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              error={errors.email}
              placeholder="your.email@example.com"
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Occasion Type *"
                value={formData.occasionType}
                onChange={(e) => {
                  setFormData({ ...formData, occasionType: e.target.value });
                  if (errors.occasionType) setErrors({ ...errors, occasionType: '' });
                }}
                options={occasionOptions}
                error={errors.occasionType}
                required
              />
              <Input
                label="Event Date *"
                type="text"
                value={formData.eventDate}
                onChange={(e) => {
                  let value = e.target.value;
                  
                  // Only allow numbers and forward slashes
                  value = value.replace(/[^\d/]/g, '');
                  
                  // Auto-format as user types: dd/mm/yyyy
                  if (value.length > 0) {
                    // Remove all slashes first
                    const numbers = value.replace(/\//g, '');
                    
                    // Add slashes at appropriate positions
                    if (numbers.length <= 2) {
                      value = numbers;
                    } else if (numbers.length <= 4) {
                      value = numbers.slice(0, 2) + '/' + numbers.slice(2);
                    } else {
                      value = numbers.slice(0, 2) + '/' + numbers.slice(2, 4) + '/' + numbers.slice(4, 8);
                    }
                  }
                  
                  // Limit to 10 characters (dd/mm/yyyy)
                  if (value.length <= 10) {
                    setFormData({ ...formData, eventDate: value });
                    if (errors.eventDate) setErrors({ ...errors, eventDate: '' });
                  }
                }}
                error={errors.eventDate}
                placeholder="dd/mm/yyyy (e.g., 25/12/2024)"
                maxLength={10}
                required
              />
            </div>
            
              <div>
                <label className="block text-sm font-medium text-deep-plum mb-2">
                  Location / Venue *
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => {
                    setFormData({ ...formData, location: e.target.value });
                    if (errors.location) setErrors({ ...errors, location: '' });
                  }}
                  error={errors.location}
                  placeholder="City, Address, or Venue name"
                  required
                />
                <p className="text-xs text-gray-600 mt-1 mb-2 font-medium">Preferred locations: Mumbai, Satara, Patan, Koyana</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Mumbai', 'Satara', 'Patan', 'Koyana'].map((location) => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => setFormData({ ...formData, location })}
                      className="px-3 py-2 text-xs bg-soft-blush hover:bg-pink-100 text-deep-plum rounded-full font-semibold border border-rose-200/50 transition-colors min-h-[36px]"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>
            
            <div>
              <Select
                label="Budget Range (Optional)"
                value={formData.budgetRange}
                onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                options={budgetOptions}
              />
              <div className="mt-2 p-3 bg-rose-50 rounded-lg border border-rose-200/50">
                <p className="text-xs text-rose-accent font-bold mb-1">
                  💝 Your Satisfaction is Our Priority!
                </p>
                <p className="text-xs text-gray-800 leading-relaxed font-medium">
                  We want happy customers! Our prices are affordable and negotiable. Share your budget 
                  and we'll work together to ensure you're completely satisfied.
                </p>
              </div>
            </div>
            
            <Textarea
              label="Message / Requirements"
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us about your requirements, preferred style, or any special requests..."
            />
            
            <Button type="submit" size="lg" className="w-full">
              Submit Enquiry 💄
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

