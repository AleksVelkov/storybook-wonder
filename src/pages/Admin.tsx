import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { OrderDetailsModal } from '@/components/admin/OrderDetailsModal';
import { CouponDialog } from '@/components/admin/CouponDialog';
import { Shield, Users, ShoppingBag, Package, BarChart, Ticket, Plus, Trash2, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  last_login: string;
}

interface Order {
  id: number;
  order_number: string;
  user_id: number;
  status: string;
  total_amount: number;
  created_at: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
}

interface Coupon {
  id: number;
  code: string;
  discount_percentage: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  usage_count: number;
  max_usage: number | null;
  max_uses_per_user: number | null;
  created_at: string;
}

export default function Admin() {
  const { language } = useLanguage();
  const { user, token, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalRevenue: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const ordersPerPage = 15;

  useEffect(() => {
    if (user?.is_admin && token) {
      fetchAdminData();
    }
  }, [user, token]);

  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch users
      const usersRes = await fetch(`${API_URL}/api/users?limit=100`, { headers });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
        setStats(prev => ({ ...prev, totalUsers: usersData.total || 0 }));
      }

      // Fetch orders (if endpoint exists)
      try {
        const ordersRes = await fetch(`${API_URL}/api/orders?limit=100`, { headers });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
          setStats(prev => ({ 
            ...prev, 
            totalOrders: ordersData.total || 0,
            totalRevenue: ordersData.orders?.reduce((sum: number, o: Order) => sum + o.total_amount, 0) || 0
          }));
        }
      } catch (error) {
        console.log('Orders endpoint not available yet');
      }

      // Fetch products (if endpoint exists)
      try {
        const productsRes = await fetch(`${API_URL}/api/products`, { headers });
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.products || productsData || []);
        }
      } catch (error) {
        console.log('Products endpoint not available yet');
      }

      // Fetch coupons
      await fetchCoupons();
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const couponsRes = await fetch(`${API_URL}/api/coupons`, { headers });
      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        setCoupons(couponsData || []);
      }
    } catch (error) {
      console.log('Error fetching coupons:', error);
    }
  };

  const handleViewOrder = async (orderId: number) => {
    setLoadingOrderDetails(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, { headers });
      
      if (response.ok) {
        const orderData = await response.json();
        setSelectedOrder(orderData);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOrderUpdate = () => {
    fetchAdminData(); // Refresh all data
    handleCloseModal();
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm(language === 'nl' ? 'Weet je zeker dat je deze coupon wilt verwijderen?' : 'Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/coupons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to delete coupon:', error);
    }
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <>
        <Helmet>
          <title>{language === 'nl' ? 'Laden...' : 'Loading...'} | Sterren Verhalen</title>
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

  // Redirect if not admin
  if (!user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{language === 'nl' ? 'Beheerderspaneel' : 'Admin Panel'} | Sterren Verhalen</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-12 md:py-16 bg-gradient-to-b from-background to-accent/20">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {language === 'nl' ? 'Beheerderspaneel' : 'Admin Panel'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'nl' ? 'Beheer je webshop' : 'Manage your webshop'}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="magical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'nl' ? 'Totaal Gebruikers' : 'Total Users'}
                    </p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-10 h-10 text-primary opacity-50" />
                </div>
              </div>

              <div className="magical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'nl' ? 'Totaal Bestellingen' : 'Total Orders'}
                    </p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalOrders}</p>
                  </div>
                  <ShoppingBag className="w-10 h-10 text-primary opacity-50" />
                </div>
              </div>

              <div className="magical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'nl' ? 'Totale Omzet' : 'Total Revenue'}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      €{stats.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <BarChart className="w-10 h-10 text-primary opacity-50" />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="magical-card p-6">
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="users">
                    <Users className="w-4 h-4 mr-2" />
                    {language === 'nl' ? 'Gebruikers' : 'Users'}
                  </TabsTrigger>
                  <TabsTrigger value="orders">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {language === 'nl' ? 'Bestellingen' : 'Orders'}
                  </TabsTrigger>
                  <TabsTrigger value="products">
                    <Package className="w-4 h-4 mr-2" />
                    {language === 'nl' ? 'Producten' : 'Products'}
                  </TabsTrigger>
                  <TabsTrigger value="coupons">
                    <Ticket className="w-4 h-4 mr-2" />
                    {language === 'nl' ? 'Coupons' : 'Coupons'}
                  </TabsTrigger>
                </TabsList>

                {/* Users Tab */}
                <TabsContent value="users">
                  {loadingData ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-semibold">ID</th>
                            <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Naam' : 'Name'}</th>
                            <th className="text-left py-3 px-4 font-semibold">Email</th>
                            <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Status' : 'Status'}</th>
                            <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Aangemaakt' : 'Created'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr key={u.id} className="border-b border-border hover:bg-accent/50">
                              <td className="py-3 px-4">{u.id}</td>
                              <td className="py-3 px-4">
                                {u.first_name} {u.last_name}
                                {u.is_admin && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded">Admin</span>}
                              </td>
                              <td className="py-3 px-4">{u.email}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-xs ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {u.is_active ? (language === 'nl' ? 'Actief' : 'Active') : (language === 'nl' ? 'Inactief' : 'Inactive')}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-muted-foreground">
                                {new Date(u.created_at).toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {users.length === 0 && (
                        <p className="text-center py-8 text-muted-foreground">
                          {language === 'nl' ? 'Geen gebruikers gevonden' : 'No users found'}
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders">
                  {loadingData ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      {orders.length > 0 ? (
                        <>
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Bestelnummer' : 'Order Number'}</th>
                                <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Klant' : 'Customer'}</th>
                                <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Status' : 'Status'}</th>
                                <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Bedrag' : 'Amount'}</th>
                                <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Datum' : 'Date'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders
                                .slice((ordersPage - 1) * ordersPerPage, ordersPage * ordersPerPage)
                                .map((order) => (
                                <tr 
                                  key={order.id} 
                                  className="border-b border-border hover:bg-accent/50 cursor-pointer transition-colors"
                                  onClick={() => handleViewOrder(order.id)}
                                >
                                  <td className="py-3 px-4 font-mono text-sm">{order.order_number}</td>
                                  <td className="py-3 px-4">
                                    {order.email ? (
                                      <div>
                                        <div className="font-medium">{order.first_name} {order.last_name}</div>
                                        <div className="text-xs text-muted-foreground">{order.email}</div>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 font-semibold">€{order.total_amount.toFixed(2)}</td>
                                  <td className="py-3 px-4 text-sm text-muted-foreground">
                                    {new Date(order.created_at).toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Pagination Controls */}
                          {orders.length > ordersPerPage && (
                            <div className="flex items-center justify-between mt-4 px-4">
                              <p className="text-sm text-muted-foreground">
                                {language === 'nl'
                                  ? `${(ordersPage - 1) * ordersPerPage + 1}-${Math.min(ordersPage * ordersPerPage, orders.length)} van ${orders.length} bestellingen`
                                  : `${(ordersPage - 1) * ordersPerPage + 1}-${Math.min(ordersPage * ordersPerPage, orders.length)} of ${orders.length} orders`}
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                                  disabled={ordersPage === 1}
                                >
                                  {language === 'nl' ? 'Vorige' : 'Previous'}
                                </Button>
                                {Array.from({ length: Math.ceil(orders.length / ordersPerPage) }, (_, i) => i + 1).map((page) => (
                                  <Button
                                    key={page}
                                    size="sm"
                                    variant={ordersPage === page ? 'default' : 'outline'}
                                    onClick={() => setOrdersPage(page)}
                                    className="w-8 h-8 p-0"
                                  >
                                    {page}
                                  </Button>
                                ))}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setOrdersPage(p => Math.min(Math.ceil(orders.length / ordersPerPage), p + 1))}
                                  disabled={ordersPage >= Math.ceil(orders.length / ordersPerPage)}
                                >
                                  {language === 'nl' ? 'Volgende' : 'Next'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-center py-8 text-muted-foreground">
                          {language === 'nl' ? 'Geen bestellingen gevonden' : 'No orders found'}
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products">
                  {loadingData ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      {products.length > 0 ? (
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-3 px-4 font-semibold">ID</th>
                              <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Titel' : 'Title'}</th>
                              <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Prijs' : 'Price'}</th>
                              <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Voorraad' : 'Stock'}</th>
                              <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Status' : 'Status'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((product) => (
                              <tr key={product.id} className="border-b border-border hover:bg-accent/50">
                                <td className="py-3 px-4">{product.id}</td>
                                <td className="py-3 px-4">{product.title}</td>
                                <td className="py-3 px-4">€{product.price.toFixed(2)}</td>
                                <td className="py-3 px-4">{product.stock_quantity}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded text-xs ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {product.is_active ? (language === 'nl' ? 'Actief' : 'Active') : (language === 'nl' ? 'Inactief' : 'Inactive')}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-center py-8 text-muted-foreground">
                          {language === 'nl' ? 'Geen producten gevonden' : 'No products found'}
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Coupons Tab */}
                <TabsContent value="coupons">
                  {loadingData ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : (
                    <div className="magical-card">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">{language === 'nl' ? 'Couponbeheer' : 'Coupon Management'}</h2>
                        <Button onClick={() => {
                          setEditingCoupon(null);
                          setShowCouponDialog(true);
                        }} variant="hero">
                          <Plus className="w-4 h-4 mr-2" />
                          {language === 'nl' ? 'Nieuwe Coupon' : 'New Coupon'}
                        </Button>
                      </div>
                      {coupons.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Code' : 'Code'}</th>
                                <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Korting' : 'Discount'}</th>
                                <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Geldig van' : 'Valid from'}</th>
                                <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Geldig tot' : 'Valid until'}</th>
                                <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Totaal gebruik' : 'Total usage'}</th>
                                <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Per gebruiker' : 'Per user'}</th>
                                <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Status' : 'Status'}</th>
                                <th className="text-left py-3 px-4 font-semibold">{language === 'nl' ? 'Acties' : 'Actions'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {coupons.map((coupon) => (
                                <tr key={coupon.id} className="border-b border-border hover:bg-muted/50">
                                  <td className="py-3 px-4 font-mono font-bold text-primary">{coupon.code}</td>
                                  <td className="py-3 px-4">{coupon.discount_percentage}%</td>
                                  <td className="py-3 px-4">{new Date(coupon.valid_from).toLocaleDateString()}</td>
                                  <td className="py-3 px-4">{new Date(coupon.valid_until).toLocaleDateString()}</td>
                                  <td className="py-3 px-4">
                                    {coupon.usage_count} / {coupon.max_usage || '∞'}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="text-sm">
                                      {coupon.max_uses_per_user === 1 ? (
                                        <span className="text-orange-600 font-medium">{language === 'nl' ? '1x (eenmalig)' : '1x (single-use)'}</span>
                                      ) : coupon.max_uses_per_user ? (
                                        <span className="text-blue-600 font-medium">{coupon.max_uses_per_user}x</span>
                                      ) : (
                                        <span className="text-green-600">∞ ({language === 'nl' ? 'onbeperkt' : 'unlimited'})</span>
                                      )}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {coupon.is_active ? (language === 'nl' ? 'Actief' : 'Active') : (language === 'nl' ? 'Inactief' : 'Inactive')}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="outline" onClick={() => {
                                        setEditingCoupon(coupon);
                                        setShowCouponDialog(true);
                                      }}>
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button size="sm" variant="destructive" onClick={() => handleDeleteCoupon(coupon.id)}>
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-center py-8 text-muted-foreground">
                          {language === 'nl' ? 'Geen coupons gevonden' : 'No coupons found'}
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleOrderUpdate}
        token={token || ''}
      />

      {/* Coupon Dialog */}
      <CouponDialog
        isOpen={showCouponDialog}
        onClose={() => {
          setShowCouponDialog(false);
          setEditingCoupon(null);
        }}
        coupon={editingCoupon}
        token={token || ''}
        onSuccess={() => {
          fetchCoupons();
        }}
      />
    </>
  );
}

