import { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function RegisterForm() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Weak', color: 'var(--danger)' });

  // Calculate password strength
  useEffect(() => {
    const pwd = formData.password;
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    const strength = pwd.length === 0 
      ? { score: 0, label: '', color: 'transparent' }
      : score < 2 
      ? { score: 1, label: 'Weak', color: 'var(--danger)' }
      : score === 2 
      ? { score: 2, label: 'Fair', color: 'var(--warning)' }
      : { score: 3, label: 'Strong', color: 'var(--success)' };
    
    setTimeout(() => setPasswordStrength(strength), 0);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Must contain an uppercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Must contain a number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = Object.keys(errors).length === 0 && 
                      formData.name && 
                      formData.email && 
                      formData.password && 
                      formData.confirmPassword && 
                      termsAccepted;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!termsAccepted) {
      toast.error('You must accept the terms to continue');
      return;
    }

    setIsLoading(true);
    const success = await register(formData.name, formData.email, formData.password);
    setIsLoading(false);

    if (success) {
      toast.success('Account created successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'input-error' : ''}
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'input-error' : ''}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="password-input-wrapper">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'input-error' : ''}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        {/* Password Strength Meter */}
        {formData.password.length > 0 && (
          <div className="password-strength">
            <div className="strength-bars">
              <div className="bar" style={{ backgroundColor: passwordStrength.score >= 1 ? passwordStrength.color : 'var(--border-color)' }}></div>
              <div className="bar" style={{ backgroundColor: passwordStrength.score >= 2 ? passwordStrength.color : 'var(--border-color)' }}></div>
              <div className="bar" style={{ backgroundColor: passwordStrength.score >= 3 ? passwordStrength.color : 'var(--border-color)' }}></div>
            </div>
            <span style={{ color: passwordStrength.color, fontSize: '12px' }}>{passwordStrength.label}</span>
          </div>
        )}
        {errors.password && <span className="error-text">{errors.password}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="password-input-wrapper">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? 'input-error' : ''}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex="-1"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
      </div>

      <div className="form-options">
        <label className="checkbox-label terms-label">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <span>I agree to the <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a></span>
        </label>
      </div>

      <button 
        type="submit" 
        className="submit-btn" 
        disabled={isLoading || !isFormValid}
      >
        {isLoading ? <Loader2 className="spinner" /> : 'Create Account'}
      </button>
    </form>
  );
}
