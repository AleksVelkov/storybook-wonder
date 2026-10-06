import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { User, Save, LogOut, ShoppingBag, Lock, Package, FileText, Truck, CreditCard, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  tracking_number?: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export default function Profile() {
  const { language, t } = useLanguage();
  const { user, loading, token, login, logout, updateUser, changePassword, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    postal_code: '',
    house_number: '',
    address: '',
    city: '',
    country: 'Nederland',
  });
  const [isLookingUpAddress, setIsLookingUpAddress] = useState(false);
  const [addressResolved, setAddressResolved] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Refresh user data from server on mount
  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, [token]);

  // Sync profileForm with user data when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        postal_code: user.postal_code || '',
        house_number: user.house_number || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || 'Nederland',
      });
      if (user.address && user.city) {
        setAddressResolved(true);
      }
      // Fetch orders
      fetchOrders();
    }
  }, [user]);

  const handleAddressLookup = async () => {
    if (!profileForm.postal_code || !profileForm.house_number) {
      toast.error(language === 'nl' ? 'Vul postcode en huisnummer in' : 'Please enter postcode and house number');
      return;
    }

    setIsLookingUpAddress(true);
    try {
      const response = await fetch(
        `${API_URL}/api/address/lookup?postcode=${encodeURIComponent(profileForm.postal_code)}&number=${encodeURIComponent(profileForm.house_number)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || (language === 'nl' ? 'Adres niet gevonden' : 'Address not found'));
        setAddressResolved(false);
        return;
      }

      const data = await response.json();
      if (data.success && data.address) {
        setProfileForm(prev => ({
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

  const fetchOrders = async () => {
    if (!token) return;
    
    setLoadingOrders(true);
    try {
      const response = await fetch(`${API_URL}/api/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleViewOrderDetails = async (orderId: number) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/orders/my-orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const orderData = await response.json();
        setSelectedOrder(orderData);
      } else {
        toast.error(language === 'nl' ? 'Fout bij laden orderdetails' : 'Error loading order details');
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      toast.error(language === 'nl' ? 'Kan orderdetails niet laden' : 'Failed to load order details');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return '✓';
      case 'processing':
        return '⚙️';
      case 'shipped':
        return '🚚';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '✕';
      default:
        return '📦';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success(language === 'nl' ? 'Succesvol ingelogd!' : 'Successfully logged in!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (language === 'nl' ? 'Inloggen mislukt' : 'Login failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateUser(profileForm);
      toast.success(language === 'nl' ? 'Profiel opgeslagen!' : 'Profile saved!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (language === 'nl' ? 'Opslaan mislukt' : 'Save failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success(language === 'nl' ? 'Uitgelogd' : 'Logged out');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error(language === 'nl' ? 'Wachtwoorden komen niet overeen' : 'Passwords do not match');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast.error(language === 'nl' ? 'Wachtwoord moet minimaal 6 tekens zijn' : 'Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwordForm.current_password, passwordForm.new_password);
      toast.success(language === 'nl' ? 'Wachtwoord succesvol gewijzigd!' : 'Password changed successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (language === 'nl' ? 'Wachtwoord wijzigen mislukt' : 'Password change failed'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <>
        <Helmet>
          <title>{language === 'nl' ? 'Mijn Profiel' : 'My Profile'} | Sterren Verhalen</title>
        </Helmet>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">{language === 'nl' ? 'Laden...' : 'Loading...'}</p>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // If not logged in, show login/register forms
  if (!user) {
    return (
      <>
        <Helmet>
          <title>{language === 'nl' ? 'Inloggen' : 'Login'} | Sterren Verhalen</title>
        </Helmet>
        
        <div className="min-h-screen flex flex-col">
          <Header />
          
          <main className="flex-1 py-12 md:py-16">
            <div className="container mx-auto px-4 max-w-md">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {language === 'nl' ? 'Voor Klanten' : 'For Customers'}
                </h1>
                <p className="text-muted-foreground">
                  {language === 'nl' 
                    ? 'Log in om je bestellingen te bekijken' 
                    : 'Login to view your orders'}
                </p>
              </div>

              <div className="magical-card p-6 space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'nl' 
                    ? 'Log in met de gegevens die je bij je eerste bestelling hebt aangemaakt. Heb je nog geen account? Dit wordt automatisch aangemaakt wanneer je je eerste bestelling plaatst.' 
                    : 'Login with the credentials created during your first purchase. Don\'t have an account yet? It will be created automatically when you place your first order.'}
                </p>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{language === 'nl' ? 'E-mailadres' : 'Email'}</label>
                    <Input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      placeholder="je@email.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{language === 'nl' ? 'Wachtwoord' : 'Password'}</label>
                    <Input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      placeholder="••••••••"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button type="submit" variant="hero" className="w-full rounded-full" disabled={isSubmitting}>
                    {isSubmitting ? (language === 'nl' ? 'Bezig...' : 'Loading...') : (language === 'nl' ? 'Inloggen' : 'Login')}
                  </Button>
                </form>
                
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-center text-muted-foreground">
                    {language === 'nl' 
                      ? '💡 Tip: Een account wordt automatisch aangemaakt bij het afronden van je eerste bestelling. Je ontvangt dan je inloggegevens per e-mail.' 
                      : '💡 Tip: An account is automatically created when you complete your first order. You will receive your login credentials by email.'}
                  </p>
                </div>
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </>
    );
  }

  // If logged in, show profile management
  return (
    <>
      <Helmet>
        <title>{language === 'nl' ? 'Mijn Profiel' : 'My Profile'} | Sterren Verhalen</title>
        <meta name="description" content={language === 'nl' ? 'Beheer je profielgegevens' : 'Manage your profile details'} />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {language === 'nl' ? `Welkom, ${user.first_name}!` : `Welcome, ${user.first_name}!`}
              </h1>
              <p className="text-muted-foreground">
                {user.email}
              </p>
            </div>

            <Tabs defaultValue={searchParams.get('tab') || 'orders'} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="orders" className="gap-2">
                  <Package className="w-4 h-4" />
                  {language === 'nl' ? 'Bestellingen' : 'Orders'}
                </TabsTrigger>
                <TabsTrigger value="profile" className="gap-2">
                  <User className="w-4 h-4" />
                  {language === 'nl' ? 'Profiel' : 'Profile'}
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Lock className="w-4 h-4" />
                  {language === 'nl' ? 'Beveiliging' : 'Security'}
                </TabsTrigger>
              </TabsList>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <div className="magical-card p-6 md:p-8 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-foreground">
                      {language === 'nl' ? 'Mijn Bestellingen' : 'My Orders'}
                    </h2>
                  </div>

                  {loadingOrders ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-muted-foreground">{language === 'nl' ? 'Bestellingen laden...' : 'Loading orders...'}</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {language === 'nl' ? 'Nog geen bestellingen' : 'No orders yet'}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {language === 'nl' 
                          ? 'Je hebt nog geen bestellingen geplaatst. Begin met winkelen!' 
                          : 'You haven\'t placed any orders yet. Start shopping!'}
                      </p>
                      <Button variant="hero" onClick={() => window.location.href = '/shop'}>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        {language === 'nl' ? 'Winkel Bezoeken' : 'Visit Shop'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                          {/* Order Header */}
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-muted-foreground">
                                  {language === 'nl' ? 'Bestelnummer' : 'Order Number'}:
                                </span>
                                <span className="font-mono font-semibold">{order.order_number}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)} {order.status}
                              </span>
                              <span className="text-xl font-bold text-primary">
                                €{order.total_amount.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Shipping Info */}
                          <div className="bg-accent/20 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-2">
                              <Truck className="w-5 h-5 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium mb-1">
                                  {language === 'nl' ? 'Verzendadres' : 'Shipping Address'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {order.shipping_address}<br />
                                  {order.shipping_postal_code} {order.shipping_city}<br />
                                  {order.shipping_country}
                                </p>
                                {order.tracking_number && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    <span className="text-sm">
                                      {language === 'nl' ? 'Track & Trace' : 'Tracking'}: 
                                      <code className="ml-2 bg-background px-2 py-0.5 rounded">{order.tracking_number}</code>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Order Actions */}
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewOrderDetails(order.id)}
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              {language === 'nl' ? 'Details Bekijken' : 'View Details'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2"
                              onClick={() => toast.info(language === 'nl' ? 'Factuur downloaden komt binnenkort' : 'Invoice download coming soon')}
                            >
                              <Download className="w-4 h-4" />
                              {language === 'nl' ? 'Factuur' : 'Invoice'}
                            </Button>
                            {order.tracking_number && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-2"
                                onClick={() => toast.info(language === 'nl' ? 'Tracking link komt binnenkort' : 'Tracking link coming soon')}
                              >
                                <Truck className="w-4 h-4" />
                                {language === 'nl' ? 'Track Pakket' : 'Track Package'}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <div className="magical-card p-6 md:p-8 space-y-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">
                  {language === 'nl' ? 'Persoonlijke Gegevens' : 'Personal Details'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {language === 'nl' ? 'Voornaam' : 'First Name'}
                    </label>
                    <Input
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                      placeholder={language === 'nl' ? 'Voornaam' : 'First name'}
                      className="rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {language === 'nl' ? 'Achternaam' : 'Last Name'}
                    </label>
                    <Input
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                      placeholder={language === 'nl' ? 'Achternaam' : 'Last name'}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {language === 'nl' ? 'Telefoonnummer' : 'Phone Number'}
                  </label>
                  <Input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    placeholder="+31 6 12345678"
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h2 className="text-lg font-bold text-foreground">
                  {language === 'nl' ? 'Adresgegevens' : 'Address Details'}
                </h2>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    {language === 'nl' 
                      ? 'Vul uw postcode en huisnummer in om uw adres automatisch op te zoeken.'
                      : 'Enter your postal code and house number to automatically look up your address.'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {language === 'nl' ? 'Postcode' : 'Postal Code'}
                      </label>
                      <Input
                        value={profileForm.postal_code}
                        onChange={(e) => {
                          setProfileForm({...profileForm, postal_code: e.target.value});
                          setAddressResolved(false);
                        }}
                        placeholder="1234AB"
                        className="rounded-xl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {language === 'nl' ? 'Huisnummer' : 'House Number'}
                      </label>
                      <Input
                        value={profileForm.house_number}
                        onChange={(e) => {
                          setProfileForm({...profileForm, house_number: e.target.value});
                          setAddressResolved(false);
                        }}
                        placeholder="42"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={handleAddressLookup}
                    disabled={isLookingUpAddress || !profileForm.postal_code || !profileForm.house_number}
                    className="mt-4 w-full rounded-xl"
                    variant="outline"
                  >
                    {isLookingUpAddress 
                      ? (language === 'nl' ? 'Zoeken...' : 'Searching...') 
                      : (language === 'nl' ? 'Adres Opzoeken' : 'Look Up Address')}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {language === 'nl' ? 'Straatnaam' : 'Street Name'}
                    </label>
                    <Input
                      value={profileForm.address}
                      disabled={addressResolved}
                      onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                      placeholder={language === 'nl' ? 'Hoofdstraat' : 'Main Street'}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {language === 'nl' ? 'Huisnr.' : 'House Nr.'}
                    </label>
                    <Input
                      value={profileForm.house_number}
                      disabled={addressResolved}
                      className="rounded-xl font-bold"
                      readOnly
                    />
                  </div>
                </div>
                {/* Show complete address */}
                {(profileForm.address || profileForm.house_number) && (
                  <div className="bg-accent/30 rounded-xl p-3 mt-2">
                    <p className="text-sm font-medium text-foreground">
                      📍 {language === 'nl' ? 'Volledig adres:' : 'Full address:'}
                    </p>
                    <p className="text-foreground font-semibold">
                      {profileForm.address} {profileForm.house_number}
                      {profileForm.city && `, ${profileForm.postal_code} ${profileForm.city}`}
                      {profileForm.country && `, ${profileForm.country}`}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {language === 'nl' ? 'Plaats' : 'City'}
                  </label>
                  <Input
                    value={profileForm.city}
                    disabled={addressResolved}
                    onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                    placeholder={language === 'nl' ? 'Amsterdam' : 'City'}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {language === 'nl' ? 'Land' : 'Country'}
                  </label>
                  <Input
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({...profileForm, country: e.target.value})}
                    placeholder="Nederland"
                    className="rounded-xl"
                  />
                </div>
              </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                    <Button variant="hero" onClick={handleSave} className="flex-1 rounded-full" disabled={isSubmitting}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSubmitting ? (language === 'nl' ? 'Opslaan...' : 'Saving...') : (language === 'nl' ? 'Profiel Opslaan' : 'Save Profile')}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <div className="magical-card p-6 md:p-8 space-y-6">
                  {/* Password Change */}
                  <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  {language === 'nl' ? 'Wachtwoord Wijzigen' : 'Change Password'}
                </h2>
                
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {language === 'nl' ? 'Huidig Wachtwoord' : 'Current Password'}
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                      placeholder="••••••••"
                      className="rounded-xl"
                      disabled={isChangingPassword}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {language === 'nl' ? 'Nieuw Wachtwoord' : 'New Password'}
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                      placeholder="••••••••"
                      className="rounded-xl"
                      minLength={6}
                      disabled={isChangingPassword}
                    />
                    <p className="text-xs text-muted-foreground">
                      {language === 'nl' ? 'Minimaal 6 karakters' : 'Minimum 6 characters'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {language === 'nl' ? 'Bevestig Nieuw Wachtwoord' : 'Confirm New Password'}
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                      placeholder="••••••••"
                      className="rounded-xl"
                      disabled={isChangingPassword}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="outline" 
                    className="w-full rounded-full" 
                    disabled={isChangingPassword || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {isChangingPassword ? (language === 'nl' ? 'Wijzigen...' : 'Changing...') : (language === 'nl' ? 'Wachtwoord Wijzigen' : 'Change Password')}
                  </Button>
                </form>
              </div>

                  {/* Logout Button */}
                  <div className="pt-4 border-t border-border">
                    <Button variant="outline" onClick={handleLogout} className="w-full rounded-full">
                      <LogOut className="w-4 h-4 mr-2" />
                      {language === 'nl' ? 'Uitloggen' : 'Logout'}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {language === 'nl' ? 'Bestelling Details' : 'Order Details'}
              </DialogTitle>
              <DialogDescription>
                {language === 'nl' ? 'Bestelnummer' : 'Order Number'}: <span className="font-mono font-semibold text-primary">{selectedOrder.order_number}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Order Status */}
              <div className="magical-card p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  {language === 'nl' ? 'Status' : 'Status'}
                </h3>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedOrder.created_at).toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="magical-card p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  {language === 'nl' ? 'Verzendgegevens' : 'Shipping Information'}
                </h3>
                <div className="space-y-1 text-sm">
                  <p>{selectedOrder.shipping_address}</p>
                  <p>{selectedOrder.shipping_postal_code} {selectedOrder.shipping_city}</p>
                  <p>{selectedOrder.shipping_country}</p>
                  {selectedOrder.tracking_number && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="font-semibold">{language === 'nl' ? 'Track & Trace' : 'Tracking Number'}:</p>
                      <p className="font-mono text-primary">{selectedOrder.tracking_number}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="magical-card p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  {language === 'nl' ? 'Bestelde Producten' : 'Ordered Items'}
                </h3>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start border-b pb-3 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {language === 'nl' ? 'Aantal' : 'Quantity'}: {item.quantity} × €{item.unit_price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold">€{item.total_price.toFixed(2)}</p>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-border flex justify-between items-center">
                      <span className="font-bold text-lg">{language === 'nl' ? 'Totaal' : 'Total'}:</span>
                      <span className="font-bold text-xl text-primary">€{selectedOrder.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{language === 'nl' ? 'Geen items gevonden' : 'No items found'}</p>
                )}
              </div>

              {/* Help Section */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-muted-foreground mb-2">
                  {language === 'nl' ? 'Vragen over je bestelling?' : 'Questions about your order?'}
                </p>
                <p className="text-sm">
                  {language === 'nl' ? 'Neem contact met ons op via' : 'Contact us at'}{' '}
                  <a href="mailto:orders@sterrenverhalen.nl" className="text-primary font-medium hover:underline">
                    orders@sterrenverhalen.nl
                  </a>
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                {language === 'nl' ? 'Sluiten' : 'Close'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
