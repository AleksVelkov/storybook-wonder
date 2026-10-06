import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, CreditCard, Shield, Lock, User, UserPlus, ChevronDown, Truck, Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Cart = () => {
  const { t, language } = useLanguage();
  const { items, removeItem, updateQuantity, totalPrice, subtotal, discount, discountPercentage, totalItems, clearCart } = useCart();
  const { user, token, login, register } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<'choice' | 'login' | 'guest' | 'create'>('choice');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [checkoutForm, setCheckoutForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    postal_code: '',
    house_number: '',
    address: '',
    city: '',
    country: 'Nederland',
    password: '',
    confirm_password: '',
    billing_postal_code: '',
    billing_house_number: '',
    billing_address: '',
    billing_city: '',
    billing_country: 'Nederland',
  });
  const [isLookingUpAddress, setIsLookingUpAddress] = useState(false);
  const [addressResolved, setAddressResolved] = useState(false);
  const [useDifferentBilling, setUseDifferentBilling] = useState(false);
  const [isLookingUpBillingAddress, setIsLookingUpBillingAddress] = useState(false);
  const [billingAddressResolved, setBillingAddressResolved] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percentage: number } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'pickup'>('standard');
  const [shippingInfoOpen, setShippingInfoOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'ideal' | 'visa' | 'mastercard'>('ideal');
  const [wantsAccount, setWantsAccount] = useState(false);
  const [guestPassword, setGuestPassword] = useState('');
  const [guestConfirmPassword, setGuestConfirmPassword] = useState('');

  const getFormatLabel = (formats: { book: boolean; audiobook: boolean; digital: boolean }) => {
    const labels = [];
    if (formats.book) labels.push(language === 'nl' ? 'Boek' : 'Book');
    if (formats.audiobook) labels.push(language === 'nl' ? 'Luisterboek' : 'Audiobook');
    if (formats.digital) labels.push(language === 'nl' ? 'Digitaal' : 'Digital');
    return labels.join(' + ');
  };

  // Calculate discount from coupon
  const couponDiscount = appliedCoupon ? (subtotal * appliedCoupon.discount_percentage) / 100 : 0;
  const subtotalAfterDiscount = subtotal - discount - couponDiscount;
  
  // Calculate shipping cost
  const shippingCost = shippingMethod === 'pickup' ? 0 : (subtotalAfterDiscount >= 50 ? 0 : 4.95);
  
  // Calculate final total
  const finalTotal = subtotalAfterDiscount + shippingCost;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(language === 'nl' ? 'Voer een couponcode in' : 'Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: couponCode.trim(),
          user_id: user?.id || null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAppliedCoupon({ code: data.code, discount_percentage: data.discount_percentage });
        
        let successMessage = language === 'nl' 
          ? `Coupon toegepast: ${data.discount_percentage}% korting!` 
          : `Coupon applied: ${data.discount_percentage}% off!`;
        
        // Add remaining uses info if applicable
        if (data.remaining_uses !== null && data.remaining_uses > 0) {
          successMessage += language === 'nl'
            ? ` (Nog ${data.remaining_uses}x te gebruiken)`
            : ` (${data.remaining_uses} uses remaining)`;
        }
        
        toast.success(successMessage);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || (language === 'nl' ? 'Ongeldige couponcode' : 'Invalid coupon code'));
      }
    } catch (error) {
      console.error('Failed to validate coupon:', error);
      toast.error(language === 'nl' ? 'Kan coupon niet valideren' : 'Failed to validate coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success(language === 'nl' ? 'Coupon verwijderd' : 'Coupon removed');
  };

  const handleAddressLookup = async () => {
    if (!checkoutForm.postal_code || !checkoutForm.house_number) {
      toast.error(language === 'nl' ? 'Vul postcode en huisnummer in' : 'Please enter postcode and house number');
      return;
    }

    setIsLookingUpAddress(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/address/lookup?postcode=${encodeURIComponent(checkoutForm.postal_code)}&number=${encodeURIComponent(checkoutForm.house_number)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || (language === 'nl' ? 'Adres niet gevonden' : 'Address not found'));
        setAddressResolved(false);
        return;
      }

      const data = await response.json();
      if (data.success && data.address) {
        setCheckoutForm(prev => ({
          ...prev,
          address: data.address.street,
          city: data.address.city,
          postal_code: data.address.postcode,
        }));
        setAddressResolved(true);
        toast.success(language === 'nl' ? 'Adres gevonden!' : 'Address found!');
      }
    } catch (error) {
      console.error('Address lookup error:', error);
      toast.error(language === 'nl' ? 'Fout bij adresopzoeken' : 'Error looking up address');
      setAddressResolved(false);
    } finally {
      setIsLookingUpAddress(false);
    }
  };

  const handleBillingAddressLookup = async () => {
    if (!checkoutForm.billing_postal_code || !checkoutForm.billing_house_number) {
      toast.error(language === 'nl' ? 'Vul postcode en huisnummer in' : 'Please enter postcode and house number');
      return;
    }

    setIsLookingUpBillingAddress(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/address/lookup?postcode=${encodeURIComponent(checkoutForm.billing_postal_code)}&number=${encodeURIComponent(checkoutForm.billing_house_number)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || (language === 'nl' ? 'Adres niet gevonden' : 'Address not found'));
        setBillingAddressResolved(false);
        return;
      }

      const data = await response.json();
      if (data.success && data.address) {
        setCheckoutForm(prev => ({
          ...prev,
          billing_address: data.address.street,
          billing_city: data.address.city,
          billing_postal_code: data.address.postcode,
        }));
        setBillingAddressResolved(true);
        toast.success(language === 'nl' ? 'Factuuradres gevonden!' : 'Billing address found!');
      }
    } catch (error) {
      console.error('Billing address lookup error:', error);
      toast.error(language === 'nl' ? 'Fout bij adresopzoeken' : 'Error looking up address');
      setBillingAddressResolved(false);
    } finally {
      setIsLookingUpBillingAddress(false);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // If user is logged in, proceed with checkout
    if (user && token) {
      await createOrder(token);
    } else {
      // Show dialog with checkout options
      setCheckoutMode('choice');
      setShowCheckoutDialog(true);
    }
  };

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      toast.error(language === 'nl' ? 'Vul email en wachtwoord in' : 'Please enter email and password');
      return;
    }

    setIsCheckingOut(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success(language === 'nl' ? 'Ingelogd!' : 'Logged in!');
      const newToken = localStorage.getItem('auth_token');
      if (newToken) {
        await createOrder(newToken);
      }
    } catch (error: any) {
      toast.error(error.message || (language === 'nl' ? 'Inloggen mislukt' : 'Login failed'));
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleGuestCheckout = async () => {
    if (!checkoutForm.email || !checkoutForm.first_name || !checkoutForm.last_name || 
        !checkoutForm.postal_code || !checkoutForm.house_number) {
      toast.error(language === 'nl' ? 'Vul alle verplichte velden in' : 'Please fill in all required fields');
      return;
    }

    if (!addressResolved) {
      toast.error(language === 'nl' ? 'Zoek eerst je adres op' : 'Please look up your address first');
      return;
    }

    // If user wants an account, validate password fields
    if (wantsAccount) {
      if (!guestPassword || !guestConfirmPassword) {
        toast.error(language === 'nl' ? 'Vul een wachtwoord in' : 'Please enter a password');
        return;
      }
      if (guestPassword !== guestConfirmPassword) {
        toast.error(language === 'nl' ? 'Wachtwoorden komen niet overeen' : 'Passwords do not match');
        return;
      }
      if (guestPassword.length < 6) {
        toast.error(language === 'nl' ? 'Wachtwoord moet minimaal 6 tekens bevatten' : 'Password must be at least 6 characters');
        return;
      }
    }

    setIsCheckingOut(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const password = wantsAccount ? guestPassword : (Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + '!1');
      
      // Register silently via direct API call (don't update auth state for guests)
      const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: checkoutForm.email,
          password,
          first_name: checkoutForm.first_name,
          last_name: checkoutForm.last_name,
          phone: checkoutForm.phone,
          address: checkoutForm.address,
          house_number: checkoutForm.house_number,
          city: checkoutForm.city,
          postal_code: checkoutForm.postal_code,
          country: checkoutForm.country,
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const registerData = await registerResponse.json();
      const guestToken = registerData.token;

      if (!guestToken) {
        throw new Error('No token received');
      }

      toast.success(language === 'nl' ? 'Bestelling wordt verwerkt...' : 'Processing order...');
      
      // Create the order using the temporary token
      await createGuestOrder(guestToken);
      
      // If user wanted an account, log them in properly
      if (wantsAccount) {
        await login(checkoutForm.email, guestPassword);
        toast.success(language === 'nl' ? 'Account aangemaakt! Je kunt nu inloggen.' : 'Account created! You can now log in.');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || (language === 'nl' ? 'Fout bij afrekenen' : 'Checkout error'));
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCreateAccountCheckout = async () => {
    if (!checkoutForm.email || !checkoutForm.first_name || !checkoutForm.last_name || 
        !checkoutForm.postal_code || !checkoutForm.house_number || !checkoutForm.password || !checkoutForm.confirm_password) {
      toast.error(language === 'nl' ? 'Vul alle verplichte velden in' : 'Please fill in all required fields');
      return;
    }

    if (checkoutForm.password !== checkoutForm.confirm_password) {
      toast.error(language === 'nl' ? 'Wachtwoorden komen niet overeen' : 'Passwords do not match');
      return;
    }

    if (checkoutForm.password.length < 6) {
      toast.error(language === 'nl' ? 'Wachtwoord moet minimaal 6 tekens bevatten' : 'Password must be at least 6 characters');
      return;
    }

    if (!addressResolved) {
      toast.error(language === 'nl' ? 'Zoek eerst je adres op' : 'Please look up your address first');
      return;
    }

    setIsCheckingOut(true);
    try {
      // Register the user with their chosen password
      await register({
        ...checkoutForm,
        password: checkoutForm.password,
      });

      toast.success(language === 'nl' ? 'Account aangemaakt!' : 'Account created!');
      
      // Get the new token from localStorage (set by register)
      const newToken = localStorage.getItem('auth_token');
      if (newToken) {
        await createOrder(newToken);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || (language === 'nl' ? 'Fout bij afrekenen' : 'Checkout error'));
    } finally {
      setIsCheckingOut(false);
    }
  };

  const createGuestOrder = async (guestToken: string) => {
    try {
      const orderItems = items.map(item => ({
        product_id: item.id,
        product_name: language === 'nl' ? item.title : item.titleEn,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        personalization: item.personalization || null,
      }));

      const formAddress = checkoutForm.address || '';
      const formHouseNumber = checkoutForm.house_number || '';
      
      const shippingData = {
        shipping_address: formAddress && formHouseNumber 
          ? `${formAddress} ${formHouseNumber}`.trim()
          : (formAddress || formHouseNumber || '').trim(),
        shipping_city: checkoutForm.city || '',
        shipping_postal_code: checkoutForm.postal_code || '',
        shipping_country: checkoutForm.country || 'Nederland',
      };

      const billingData = useDifferentBilling && billingAddressResolved ? {
        billing_address: `${checkoutForm.billing_address} ${checkoutForm.billing_house_number}`,
        billing_city: checkoutForm.billing_city,
        billing_postal_code: checkoutForm.billing_postal_code,
        billing_country: checkoutForm.billing_country,
      } : {};

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${guestToken}`,
        },
        body: JSON.stringify({
          items: orderItems,
          subtotal: subtotal,
          coupon_code: appliedCoupon?.code || null,
          shipping_method: shippingMethod,
          currency: 'EUR',
          ...shippingData,
          ...billingData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await response.json();
      
      toast.success(language === 'nl' 
        ? `Bestelling succesvol geplaatst! Bestelnummer: ${orderData.order_number}` 
        : `Order placed successfully! Order number: ${orderData.order_number}`
      );
      
      clearCart();
      setShowCheckoutDialog(false);
      
      // Guest users: navigate to home with success message (not to profile)
      navigate('/');
    } catch (error: any) {
      console.error('Order creation error:', error);
      toast.error(error.message || (language === 'nl' ? 'Fout bij het plaatsen van bestelling' : 'Error placing order'));
    }
  };

  const createOrder = async (authToken: string) => {
    setIsCheckingOut(true);
    try {
      const orderItems = items.map(item => ({
        product_id: item.id,
        product_name: language === 'nl' ? item.title : item.titleEn,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        personalization: item.personalization || null,
      }));

      // Use user data if available, otherwise use checkout form
      // Always combine address + house_number for Dutch address format
      const userAddress = user?.address || '';
      const userHouseNumber = user?.house_number || '';
      const formAddress = checkoutForm.address || '';
      const formHouseNumber = checkoutForm.house_number || '';
      
      // Prefer user data, fall back to form data
      const finalAddress = userAddress || formAddress;
      const finalHouseNumber = userHouseNumber || formHouseNumber;
      
      const shippingData = {
        shipping_address: finalAddress && finalHouseNumber 
          ? `${finalAddress} ${finalHouseNumber}`.trim()
          : (finalAddress || finalHouseNumber || '').trim(),
        shipping_city: user?.city || checkoutForm.city || '',
        shipping_postal_code: user?.postal_code || checkoutForm.postal_code || '',
        shipping_country: user?.country || checkoutForm.country || 'Nederland',
      };
      
      console.log('=== ORDER CREATION DEBUG ===');
      console.log('User object:', user);
      console.log('User address parts:', { address: user?.address, house_number: user?.house_number });
      console.log('Checkout form:', { address: checkoutForm.address, house_number: checkoutForm.house_number });
      console.log('Final shipping data:', shippingData);
      console.log('===========================');

      // Billing address data (only if different from shipping)
      const billingData = useDifferentBilling && billingAddressResolved ? {
        billing_address: `${checkoutForm.billing_address} ${checkoutForm.billing_house_number}`,
        billing_city: checkoutForm.billing_city,
        billing_postal_code: checkoutForm.billing_postal_code,
        billing_country: checkoutForm.billing_country,
      } : {};

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          items: orderItems,
          subtotal: subtotal,
          coupon_code: appliedCoupon?.code || null,
          shipping_method: shippingMethod,
          currency: 'EUR',
          ...shippingData,
          ...billingData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await response.json();
      
      toast.success(language === 'nl' 
        ? `Bestelling succesvol geplaatst! Bestelnummer: ${orderData.order_number}` 
        : `Order placed successfully! Order number: ${orderData.order_number}`
      );
      
      // Clear the cart
      clearCart();
      
      // Close dialog if open
      setShowCheckoutDialog(false);
      
      // Navigate to profile/orders
      navigate('/profile?tab=orders');
    } catch (error: any) {
      console.error('Order creation error:', error);
      toast.error(error.message || (language === 'nl' ? 'Fout bij het plaatsen van bestelling' : 'Error placing order'));
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{language === 'nl' ? 'Winkelwagen - Sterren Verhalen' : 'Cart - Sterren Verhalen'}</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              {t('cart.title')}
            </h1>

            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-8xl mb-6">🛒</div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  {t('cart.empty')}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {language === 'nl' 
                    ? 'Je winkelwagen wacht op magische verhalen!' 
                    : 'Your cart is waiting for magical stories!'}
                </p>
                <Link to="/shop">
                  <Button variant="hero" size="lg">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    {t('cart.continue')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="magical-card flex gap-4"
                    >
                      {/* Image */}
                      <div className="w-20 h-28 md:w-24 md:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <img
                          src={item.image && !item.image.includes('placeholder') ? item.image : '/logo.PNG'}
                          alt={language === 'nl' ? item.title : item.titleEn}
                          className={item.image && !item.image.includes('placeholder') ? "w-full h-full object-cover" : "w-12 h-12 object-contain"}
                          onError={(e) => { e.currentTarget.src = '/logo.PNG'; e.currentTarget.className = 'w-12 h-12 object-contain'; }}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground mb-1 text-sm md:text-base line-clamp-2">
                          {language === 'nl' ? item.title : item.titleEn}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground mb-2">
                          {getFormatLabel(item.formats)}
                        </p>

                        {/* Personalization Details */}
                        {item.personalization && (
                          <div className="bg-accent/30 rounded-lg p-2 mb-3 text-xs space-y-1">
                            {item.personalization.childName && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">{language === 'nl' ? '👤 Voor:' : '👤 For:'}</span>
                                <span className="font-medium">{item.personalization.childName}</span>
                                {item.personalization.childAge && (
                                  <span className="text-muted-foreground">({item.personalization.childAge} {language === 'nl' ? 'jaar' : 'years'})</span>
                                )}
                              </div>
                            )}
                            {item.personalization.hobbies && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">🎨</span>
                                <span>{item.personalization.hobbies}</span>
                              </div>
                            )}
                            {item.personalization.favoriteFood && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">🍕</span>
                                <span>{item.personalization.favoriteFood}</span>
                              </div>
                            )}
                            {item.personalization.interestingFact && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">💡</span>
                                <span className="line-clamp-1">{item.personalization.interestingFact}</span>
                              </div>
                            )}
                            {item.personalization.personalMessage && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">💌</span>
                                <span className="line-clamp-1 italic">"{item.personalization.personalMessage}"</span>
                              </div>
                            )}
                            {item.personalization.character && (
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-muted-foreground">{language === 'nl' ? '👤 Uiterlijk:' : '👤 Look:'}</span>
                                <span>
                                  {item.personalization.character.gender === 'boy' ? '👦' : '👧'}
                                  {' '}
                                  {item.personalization.character.skinTone}
                                  {' • '}
                                  {item.personalization.character.hairColor} {language === 'nl' ? 'haar' : 'hair'}
                                  {item.personalization.character.hasGlasses && ' 👓'}
                                </span>
                              </div>
                            )}
                            {(item.personalization as any).pageCount && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">📖</span>
                                <span>{(item.personalization as any).pageCount} {language === 'nl' ? 'pagina\'s' : 'pages'}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          {/* Quantity */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                            >
                              <Minus className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                            <span className="w-6 md:w-8 text-center font-medium text-sm md:text-base">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                            >
                              <Plus className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                          </div>

                          {/* Price & Remove */}
                          <div className="flex items-center gap-2 md:gap-4">
                            <span className="font-bold text-base md:text-lg text-primary">
                              €{(item.price * item.quantity).toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="magical-card sticky top-24">
                    <h2 className="text-xl font-bold text-foreground mb-6">
                      {language === 'nl' ? 'Overzicht' : 'Summary'}
                    </h2>

                    <div className="space-y-4 mb-6">
                      {/* Subtotal */}
                      <div className="flex justify-between text-muted-foreground">
                        <span>{language === 'nl' ? 'Subtotaal' : 'Subtotal'} ({totalItems} {totalItems === 1 ? (language === 'nl' ? 'boek' : 'book') : (language === 'nl' ? 'boeken' : 'books')})</span>
                        <span>€{subtotal.toFixed(2)}</span>
                      </div>
                      
                      {/* Bulk Discount */}
                      {discountPercentage > 0 && (
                        <div className="flex justify-between text-green-600 font-medium">
                          <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {language === 'nl' ? `Korting (${discountPercentage}%)` : `Discount (${discountPercentage}%)`}
                          </span>
                          <span>-€{discount.toFixed(2)}</span>
                        </div>
                      )}

                      {/* Coupon Section */}
                      <div className="border-t border-border pt-3">
                        <h3 className="text-sm font-medium mb-2">{language === 'nl' ? 'Couponcode' : 'Coupon Code'}</h3>
                        {!appliedCoupon ? (
                          <div className="flex gap-2">
                            <Input
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder={language === 'nl' ? 'CODE' : 'CODE'}
                              className="uppercase"
                              disabled={isValidatingCoupon}
                            />
                            <Button
                              onClick={handleApplyCoupon}
                              disabled={isValidatingCoupon || !couponCode.trim()}
                              variant="outline"
                            >
                              {isValidatingCoupon ? '...' : (language === 'nl' ? 'Toepassen' : 'Apply')}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                            <span className="text-sm text-green-700 font-medium">
                              {appliedCoupon.code} (-{appliedCoupon.discount_percentage}%)
                            </span>
                            <Button
                              onClick={handleRemoveCoupon}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              {language === 'nl' ? 'Verwijder' : 'Remove'}
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Coupon Discount */}
                      {appliedCoupon && couponDiscount > 0 && (
                        <div className="flex justify-between text-green-600 font-medium">
                          <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {language === 'nl' ? `Coupon korting (${appliedCoupon.discount_percentage}%)` : `Coupon discount (${appliedCoupon.discount_percentage}%)`}
                          </span>
                          <span>-€{couponDiscount.toFixed(2)}</span>
                        </div>
                      )}

                      {/* Shipping Section */}
                      <div className="border-t border-border pt-3">
                        <h3 className="text-sm font-medium mb-2">{language === 'nl' ? 'Verzendmethode' : 'Shipping Method'}</h3>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="shipping"
                              value="standard"
                              checked={shippingMethod === 'standard'}
                              onChange={() => setShippingMethod('standard')}
                              className="accent-primary"
                            />
                            <span className="text-sm">
                              {language === 'nl' ? 'Verzending met tracking' : 'Shipping with tracking'} 
                              {shippingCost > 0 ? ` (€${shippingCost.toFixed(2)})` : ` (${language === 'nl' ? 'Gratis' : 'Free'})`}
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="shipping"
                              value="pickup"
                              checked={shippingMethod === 'pickup'}
                              onChange={() => setShippingMethod('pickup')}
                              className="accent-primary"
                            />
                            <span className="text-sm">
                              {language === 'nl' ? 'Ophalen in Weesp (Gratis)' : 'Pickup in Weesp (Free)'}
                            </span>
                          </label>
                        </div>
                        {shippingMethod === 'standard' && subtotalAfterDiscount < 50 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            💡 {language === 'nl' 
                              ? `Voeg nog €${(50 - subtotalAfterDiscount).toFixed(2)} toe voor gratis verzending!` 
                              : `Add €${(50 - subtotalAfterDiscount).toFixed(2)} more for free shipping!`}
                          </p>
                        )}
                        
                        {/* Collapsible Shipping & Return Policy Info */}
                        <div className="mt-3">
                          <button
                            onClick={() => setShippingInfoOpen(!shippingInfoOpen)}
                            className="w-full flex items-center justify-between p-2 bg-blue-50 rounded-md border border-blue-100 hover:bg-blue-100 transition-colors"
                          >
                            <span className="text-xs text-blue-800 font-medium">
                              {language === 'nl' ? '📦 Verzend- en retourbeleid' : '📦 Shipping & Return Policy'}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform ${shippingInfoOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {shippingInfoOpen && (
                            <ul className="text-xs text-blue-700 space-y-1 mt-2 p-2 bg-blue-50/50 rounded-md">
                              <li>• {language === 'nl' ? 'Verzending: €4.95 (gratis boven €50)' : 'Shipping: €4.95 (free above €50)'}</li>
                              <li>• {language === 'nl' ? 'Gratis ophalen in Weesp' : 'Free pickup in Weesp'}</li>
                              <li>• {language === 'nl' ? 'Sale items: 14 dagen retour' : 'Sale items: 14-day returns'}</li>
                              <li>• {language === 'nl' ? 'Standaard orders: 30 dagen retour' : 'Standard orders: 30-day returns'}</li>
                              <li>• {language === 'nl' ? 'Retourkosten zijn voor de klant' : 'Return shipping costs borne by customer'}</li>
                            </ul>
                          )}
                        </div>
                      </div>
                      
                      {/* Shipping Cost */}
                      <div className="flex justify-between text-muted-foreground">
                        <span>{language === 'nl' ? 'Verzending' : 'Shipping'}</span>
                        <span>{shippingCost > 0 ? `€${shippingCost.toFixed(2)}` : (language === 'nl' ? 'Gratis' : 'Free')}</span>
                      </div>

                      {/* Total */}
                      <div className="border-t border-border pt-3">
                        <div className="flex justify-between text-xl font-bold">
                          <span>{t('cart.total')}</span>
                          <span className="text-primary">€{finalTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Discount info */}
                    {totalItems < 2 && (
                      <div className="mb-4 p-3 bg-accent/20 rounded-xl text-sm">
                        <p className="text-muted-foreground">
                          💡 {language === 'nl' 
                            ? 'Voeg nog een boek toe voor 10% korting!' 
                            : 'Add another book for 10% discount!'}
                        </p>
                      </div>
                    )}
                    {totalItems === 2 && (
                      <div className="mb-4 p-3 bg-green-100 rounded-xl text-sm">
                        <p className="text-green-700">
                          ✓ {language === 'nl' 
                            ? '10% korting toegepast! Voeg nog een boek toe voor 20%!' 
                            : '10% discount applied! Add another book for 20%!'}
                        </p>
                      </div>
                    )}
                    {totalItems >= 3 && (
                      <div className="mb-4 p-3 bg-green-100 rounded-xl text-sm">
                        <p className="text-green-700">
                          🎉 {language === 'nl' 
                            ? '20% korting toegepast! Maximale korting bereikt!' 
                            : '20% discount applied! Maximum discount reached!'}
                        </p>
                      </div>
                    )}

                    {/* Payment Method Selection */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">{language === 'nl' ? 'Betaalmethode' : 'Payment Method'}</h3>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setSelectedPaymentMethod('ideal')}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            selectedPaymentMethod === 'ideal'
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img src="/ideal.svg" alt="iDEAL" className="h-8 mx-auto" />
                        </button>
                        <button
                          onClick={() => setSelectedPaymentMethod('visa')}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            selectedPaymentMethod === 'visa'
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img src="/visa.svg" alt="Visa" className="h-8 mx-auto" />
                        </button>
                        <button
                          onClick={() => setSelectedPaymentMethod('mastercard')}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            selectedPaymentMethod === 'mastercard'
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img src="/mastercard.svg" alt="Mastercard" className="h-8 mx-auto" />
                        </button>
                      </div>
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        🔒 {language === 'nl' ? 'SSL-versleuteld & 100% veilig' : 'SSL encrypted & 100% secure'}
                      </p>
                    </div>

                    {!user && (
                      <Link to="/profile">
                        <Button variant="outline" size="lg" className="w-full mb-3">
                          {language === 'nl' ? 'Al een account? Inloggen' : 'Have an account? Login'}
                        </Button>
                      </Link>
                    )}

                    <Button 
                      variant="hero" 
                      size="lg" 
                      className="w-full mb-4"
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut 
                        ? (language === 'nl' ? 'Bezig...' : 'Processing...') 
                        : (language === 'nl' ? 'Afrekenen' : 'Checkout')}
                      {!isCheckingOut && <ArrowRight className="w-5 h-5 ml-2" />}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground mb-4">
                      {language === 'nl' 
                        ? '* Voor ontwikkelingsdoeleinden wordt de bestelling geplaatst zonder betaling' 
                        : '* For development purposes, the order is placed without payment'}
                    </p>

                    <Link to="/shop" className="block">
                      <Button variant="outline" size="lg" className="w-full">
                        {t('cart.continue')}
                      </Button>
                    </Link>

                    {/* Trust badges */}
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Lock className="w-5 h-5 text-primary" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {language === 'nl' ? 'Veilig betalen' : 'Secure payment'}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Truck className="w-5 h-5 text-primary" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {language === 'nl' ? 'Snelle levering' : 'Fast delivery'}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Star className="w-5 h-5 text-primary fill-primary" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {language === 'nl' ? 'Tevreden klanten' : 'Happy customers'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Guest Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {checkoutMode === 'choice' && (language === 'nl' ? 'Kies een optie' : 'Choose an option')}
              {checkoutMode === 'login' && (language === 'nl' ? 'Inloggen' : 'Login')}
              {checkoutMode === 'guest' && (language === 'nl' ? 'Afrekenen als gast' : 'Guest Checkout')}
              {checkoutMode === 'create' && (language === 'nl' ? 'Account aanmaken' : 'Create Account')}
            </DialogTitle>
            <DialogDescription>
              {checkoutMode === 'choice' && (language === 'nl' 
                ? 'Kies hoe je wilt afrekenen'
                : 'Choose how you want to checkout')}
              {checkoutMode === 'login' && (language === 'nl' 
                ? 'Log in met je bestaande account'
                : 'Login with your existing account')}
              {checkoutMode === 'guest' && (language === 'nl' 
                ? 'Vul je gegevens in om direct af te rekenen.'
                : 'Fill in your details to checkout directly.')}
              {checkoutMode === 'create' && (language === 'nl' 
                ? 'Vul je gegevens in en stel een wachtwoord in voor je nieuwe account.'
                : 'Fill in your details and set a password for your new account.')}
            </DialogDescription>
          </DialogHeader>

          {/* Choice Screen */}
          {checkoutMode === 'choice' && (
            <div className="space-y-4">
              <Button
                variant="hero"
                size="lg"
                className="w-full justify-start"
                onClick={() => setCheckoutMode('login')}
              >
                <User className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">{language === 'nl' ? 'Ik heb al een account' : 'I have an account'}</div>
                  <div className="text-xs opacity-80">{language === 'nl' ? 'Log in om af te rekenen' : 'Login to checkout'}</div>
                </div>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full justify-start"
                onClick={() => setCheckoutMode('create')}
              >
                <UserPlus className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">{language === 'nl' ? 'Account aanmaken' : 'Create an account'}</div>
                  <div className="text-xs opacity-80">{language === 'nl' ? 'Maak een account aan met je eigen wachtwoord' : 'Create an account with your own password'}</div>
                </div>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full justify-start"
                onClick={() => setCheckoutMode('guest')}
              >
                <ShoppingBag className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">{language === 'nl' ? 'Afrekenen als gast' : 'Checkout as guest'}</div>
                  <div className="text-xs opacity-80">{language === 'nl' ? 'Snel afrekenen zonder wachtwoord in te stellen' : 'Quick checkout without setting a password'}</div>
                </div>
              </Button>
            </div>
          )}

          {/* Login Form */}
          {checkoutMode === 'login' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="login_email">Email *</Label>
                <Input
                  id="login_email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="email@voorbeeld.nl"
                  required
                  disabled={isCheckingOut}
                />
              </div>
              <div>
                <Label htmlFor="login_password">{language === 'nl' ? 'Wachtwoord' : 'Password'} *</Label>
                <Input
                  id="login_password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  disabled={isCheckingOut}
                />
              </div>
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto"
                onClick={() => setCheckoutMode('choice')}
              >
                ← {language === 'nl' ? 'Terug naar keuzemenu' : 'Back to options'}
              </Button>
            </div>
          )}

          {/* Payment Info Banner (for guest and create modes) */}
          {(checkoutMode === 'guest' || checkoutMode === 'create') && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-foreground">
                  {language === 'nl' ? 'Veilig Betalen met Stripe' : 'Secure Payment with Stripe'}
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>{language === 'nl' ? 'SSL Versleuteld' : 'SSL Encrypted'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>{language === 'nl' ? 'iDEAL & Alle Creditcards' : 'iDEAL & All Credit Cards'}</span>
                </div>
              </div>
              <p className="text-xs mt-2 text-orange-600 font-medium">
                {language === 'nl' 
                  ? '⚠️ Ontwikkelmodus: Bestelling wordt geplaatst zonder betaling' 
                  : '⚠️ Development mode: Order will be placed without payment'}
              </p>
            </div>
          )}

          {/* Guest/Create Account Form */}
          {(checkoutMode === 'guest' || checkoutMode === 'create') && (
            <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">{language === 'nl' ? 'Voornaam' : 'First Name'} *</Label>
                <Input
                  id="first_name"
                  value={checkoutForm.first_name}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, first_name: e.target.value })}
                  placeholder={language === 'nl' ? 'Voornaam' : 'First Name'}
                  required
                  disabled={isCheckingOut}
                />
              </div>
              <div>
                <Label htmlFor="last_name">{language === 'nl' ? 'Achternaam' : 'Last Name'} *</Label>
                <Input
                  id="last_name"
                  value={checkoutForm.last_name}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, last_name: e.target.value })}
                  placeholder={language === 'nl' ? 'Achternaam' : 'Last Name'}
                  required
                  disabled={isCheckingOut}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={checkoutForm.email}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                placeholder="email@voorbeeld.nl"
                required
                disabled={isCheckingOut}
              />
              {checkoutMode === 'guest' && (
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'nl' 
                    ? 'Orderbevestiging wordt naar dit adres gestuurd' 
                    : 'Order confirmation will be sent to this address'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">{language === 'nl' ? 'Telefoonnummer' : 'Phone Number'}</Label>
              <Input
                id="phone"
                type="tel"
                value={checkoutForm.phone}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                placeholder="+31 6 12345678"
                disabled={isCheckingOut}
              />
            </div>

            {/* Address Lookup Section */}
            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
              <h4 className="font-semibold mb-3 text-foreground">{language === 'nl' ? 'Adresgegevens' : 'Address Details'}</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'nl' 
                  ? 'Vul je postcode en huisnummer in om je adres automatisch op te zoeken.' 
                  : 'Enter your postcode and house number to automatically find your address.'}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="postal_code">{language === 'nl' ? 'Postcode' : 'Postcode'} *</Label>
                  <Input
                    id="postal_code"
                    value={checkoutForm.postal_code}
                    onChange={(e) => {
                      setCheckoutForm({ ...checkoutForm, postal_code: e.target.value });
                      setAddressResolved(false);
                    }}
                    placeholder="1234 AB"
                    required
                    disabled={isCheckingOut}
                    className="uppercase"
                  />
                </div>
                <div>
                  <Label htmlFor="house_number">{language === 'nl' ? 'Huisnummer' : 'House Number'} *</Label>
                  <Input
                    id="house_number"
                    value={checkoutForm.house_number}
                    onChange={(e) => {
                      setCheckoutForm({ ...checkoutForm, house_number: e.target.value });
                      setAddressResolved(false);
                    }}
                    placeholder="123"
                    required
                    disabled={isCheckingOut}
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddressLookup}
                disabled={isLookingUpAddress || isCheckingOut || !checkoutForm.postal_code || !checkoutForm.house_number}
                className="w-full mb-4"
                variant="outline"
              >
                {isLookingUpAddress ? (
                  language === 'nl' ? 'Adres opzoeken...' : 'Looking up address...'
                ) : (
                  language === 'nl' ? '🔍 Zoek Adres' : '🔍 Find Address'
                )}
              </Button>

              {addressResolved && (
                <div className="space-y-4 pt-4 border-t border-blue-200">
                  <div>
                    <Label htmlFor="address">{language === 'nl' ? 'Straatnaam' : 'Street Name'}</Label>
                    <Input
                      id="address"
                      value={checkoutForm.address}
                      readOnly
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">{language === 'nl' ? 'Plaats' : 'City'}</Label>
                    <Input
                      id="city"
                      value={checkoutForm.city}
                      readOnly
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="country">{language === 'nl' ? 'Land' : 'Country'} *</Label>
              <Input
                id="country"
                value={checkoutForm.country}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, country: e.target.value })}
                placeholder="Nederland"
                required
                disabled={isCheckingOut}
              />
            </div>

            {/* Billing Address Section */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="use_different_billing"
                  checked={useDifferentBilling}
                  onChange={(e) => setUseDifferentBilling(e.target.checked)}
                  className="rounded border-gray-300"
                  disabled={isCheckingOut}
                />
                <Label htmlFor="use_different_billing" className="cursor-pointer">
                  {language === 'nl' ? 'Factuuradres is anders dan verzendadres' : 'Billing address is different from shipping address'}
                </Label>
              </div>

              {useDifferentBilling && (
                <div className="border border-purple-200 rounded-xl p-4 bg-purple-50">
                  <h4 className="font-semibold mb-3 text-foreground">{language === 'nl' ? 'Factuuradres' : 'Billing Address'}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === 'nl' 
                      ? 'Vul je postcode en huisnummer in voor het factuuradres.' 
                      : 'Enter your postcode and house number for the billing address.'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="billing_postal_code">{language === 'nl' ? 'Postcode' : 'Postcode'} *</Label>
                      <Input
                        id="billing_postal_code"
                        value={checkoutForm.billing_postal_code}
                        onChange={(e) => {
                          setCheckoutForm({ ...checkoutForm, billing_postal_code: e.target.value });
                          setBillingAddressResolved(false);
                        }}
                        placeholder="1234 AB"
                        required
                        disabled={isCheckingOut}
                        className="uppercase"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing_house_number">{language === 'nl' ? 'Huisnummer' : 'House Number'} *</Label>
                      <Input
                        id="billing_house_number"
                        value={checkoutForm.billing_house_number}
                        onChange={(e) => {
                          setCheckoutForm({ ...checkoutForm, billing_house_number: e.target.value });
                          setBillingAddressResolved(false);
                        }}
                        placeholder="123"
                        required
                        disabled={isCheckingOut}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleBillingAddressLookup}
                    disabled={isLookingUpBillingAddress || isCheckingOut || !checkoutForm.billing_postal_code || !checkoutForm.billing_house_number}
                    className="w-full mb-4"
                    variant="outline"
                  >
                    {isLookingUpBillingAddress ? (
                      language === 'nl' ? 'Adres opzoeken...' : 'Looking up address...'
                    ) : (
                      language === 'nl' ? '🔍 Zoek Factuuradres' : '🔍 Find Billing Address'
                    )}
                  </Button>

                  {billingAddressResolved && (
                    <div className="space-y-4 pt-4 border-t border-purple-200">
                      <div>
                        <Label htmlFor="billing_address">{language === 'nl' ? 'Straatnaam' : 'Street Name'}</Label>
                        <Input
                          id="billing_address"
                          value={checkoutForm.billing_address}
                          readOnly
                          disabled
                          className="bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <Label htmlFor="billing_city">{language === 'nl' ? 'Plaats' : 'City'}</Label>
                        <Input
                          id="billing_city"
                          value={checkoutForm.billing_city}
                          readOnly
                          disabled
                          className="bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <Label htmlFor="billing_country">{language === 'nl' ? 'Land' : 'Country'}</Label>
                        <Input
                          id="billing_country"
                          value={checkoutForm.billing_country}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, billing_country: e.target.value })}
                          placeholder="Nederland"
                          disabled={isCheckingOut}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Password fields (only for create mode) */}
            {checkoutMode === 'create' && (
              <>
                <div>
                  <Label htmlFor="password">{language === 'nl' ? 'Wachtwoord' : 'Password'} *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={checkoutForm.password}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    disabled={isCheckingOut}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'nl' 
                      ? 'Minimaal 6 tekens' 
                      : 'Minimum 6 characters'}
                  </p>
                </div>
                <div>
                  <Label htmlFor="confirm_password">{language === 'nl' ? 'Bevestig wachtwoord' : 'Confirm Password'} *</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={checkoutForm.confirm_password}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, confirm_password: e.target.value })}
                    placeholder="••••••••"
                    required
                    disabled={isCheckingOut}
                  />
                </div>
              </>
            )}

            {/* Optional: Create account (only in guest mode) */}
            {checkoutMode === 'guest' && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="wants_account"
                    checked={wantsAccount}
                    onChange={(e) => {
                      setWantsAccount(e.target.checked);
                      if (!e.target.checked) {
                        setGuestPassword('');
                        setGuestConfirmPassword('');
                      }
                    }}
                    className="rounded border-gray-300"
                    disabled={isCheckingOut}
                  />
                  <Label htmlFor="wants_account" className="cursor-pointer">
                    {language === 'nl' ? 'Maak ook een account aan (optioneel)' : 'Also create an account (optional)'}
                  </Label>
                </div>

                {wantsAccount && (
                  <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-muted-foreground mb-2">
                      {language === 'nl'
                        ? 'Met een account kun je je bestellingen volgen en sneller afrekenen.'
                        : 'With an account you can track your orders and checkout faster.'}
                    </p>
                    <div>
                      <Label htmlFor="guest_password">{language === 'nl' ? 'Wachtwoord' : 'Password'} *</Label>
                      <Input
                        id="guest_password"
                        type="password"
                        value={guestPassword}
                        onChange={(e) => setGuestPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isCheckingOut}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'nl' ? 'Minimaal 6 tekens' : 'Minimum 6 characters'}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="guest_confirm_password">{language === 'nl' ? 'Bevestig wachtwoord' : 'Confirm Password'} *</Label>
                      <Input
                        id="guest_confirm_password"
                        type="password"
                        value={guestConfirmPassword}
                        onChange={(e) => setGuestConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isCheckingOut}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Back to options button */}
            <Button
              type="button"
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={() => setCheckoutMode('choice')}
            >
              ← {language === 'nl' ? 'Terug naar keuzemenu' : 'Back to options'}
            </Button>

            {/* Order Summary */}
            <div className="border-t border-border pt-4 mt-4">
              <h4 className="font-semibold mb-2">{language === 'nl' ? 'Overzicht' : 'Summary'}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{language === 'nl' ? 'Subtotaal' : 'Subtotal'}:</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                {discountPercentage > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{language === 'nl' ? 'Korting' : 'Discount'} ({discountPercentage}%):</span>
                    <span>-€{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>{language === 'nl' ? 'Totaal' : 'Total'}:</span>
                  <span className="text-primary">€{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
            </form>
          )}

          {/* Dialog Footer */}
          <DialogFooter className="gap-2">
            {checkoutMode === 'choice' && (
              <Button 
                variant="outline" 
                onClick={() => setShowCheckoutDialog(false)}
                disabled={isCheckingOut}
              >
                {language === 'nl' ? 'Annuleren' : 'Cancel'}
              </Button>
            )}

            {checkoutMode === 'login' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCheckoutDialog(false)}
                  disabled={isCheckingOut}
                >
                  {language === 'nl' ? 'Annuleren' : 'Cancel'}
                </Button>
                <Button 
                  variant="hero" 
                  onClick={handleLogin}
                  disabled={isCheckingOut}
                  className="gap-2"
                >
                  {isCheckingOut ? (
                    language === 'nl' ? 'Inloggen...' : 'Logging in...'
                  ) : (
                    <>
                      {language === 'nl' ? 'Inloggen & Bestellen' : 'Login & Order'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </>
            )}

            {checkoutMode === 'guest' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCheckoutDialog(false)}
                  disabled={isCheckingOut}
                >
                  {language === 'nl' ? 'Annuleren' : 'Cancel'}
                </Button>
                <Button 
                  variant="hero" 
                  onClick={handleGuestCheckout}
                  disabled={isCheckingOut}
                  className="gap-2"
                >
                  {isCheckingOut ? (
                    language === 'nl' ? 'Bestelling plaatsen...' : 'Placing order...'
                  ) : (
                    <>
                      {language === 'nl' ? 'Bestelling Plaatsen' : 'Place Order'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </>
            )}

            {checkoutMode === 'create' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCheckoutDialog(false)}
                  disabled={isCheckingOut}
                >
                  {language === 'nl' ? 'Annuleren' : 'Cancel'}
                </Button>
                <Button 
                  variant="hero" 
                  onClick={handleCreateAccountCheckout}
                  disabled={isCheckingOut}
                  className="gap-2"
                >
                  {isCheckingOut ? (
                    language === 'nl' ? 'Account aanmaken...' : 'Creating account...'
                  ) : (
                    <>
                      {language === 'nl' ? 'Account Aanmaken & Bestellen' : 'Create Account & Order'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Cart;
