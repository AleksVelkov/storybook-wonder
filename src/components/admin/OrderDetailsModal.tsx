import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { 
  Package, User, Mail, Phone, MapPin, Calendar, CreditCard, 
  Truck, Send, X, Edit, Save, Sparkles, BookOpen, Users, Tag
} from 'lucide-react';
import type { CharacterFeatures } from '@/components/CharacterAvatar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface PersonalizationData {
  childName?: string;
  childAge?: string;
  hobbies?: string;
  favoriteFood?: string;
  interestingFact?: string;
  personalMessage?: string;
  theme?: string;
  animal?: string;
  pageCount?: number;
  character?: CharacterFeatures;
  allCharacters?: Array<{
    name: string;
    age?: string;
    features: CharacterFeatures;
  }>;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  subtotal?: number;
  discount_amount?: number;
  shipping_cost?: number;
  coupon_code?: string;
  currency: string;
  created_at: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  tracking_number?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  personalization_data?: string | null;
}

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  token: string;
}

export function OrderDetailsModal({ order, isOpen, onClose, onUpdate, token }: OrderDetailsModalProps) {
  const { language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [editForm, setEditForm] = useState({
    status: order?.status || 'pending',
    tracking_number: order?.tracking_number || '',
  });

  if (!order) return null;

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

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast.success(language === 'nl' ? 'Bestelling bijgewerkt!' : 'Order updated!');
        setIsEditing(false);
        onUpdate();
      } else {
        throw new Error('Failed to update order');
      }
    } catch (error) {
      toast.error(language === 'nl' ? 'Fout bij bijwerken' : 'Update failed');
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject || !emailMessage) {
      toast.error(language === 'nl' ? 'Onderwerp en bericht zijn verplicht' : 'Subject and message are required');
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch(`${API_URL}/api/orders/${order.id}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
        }),
      });

      if (response.ok) {
        toast.success(language === 'nl' ? 'E-mail verzonden!' : 'Email sent!');
        setEmailSubject('');
        setEmailMessage('');
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      toast.error(language === 'nl' ? 'Fout bij verzenden' : 'Send failed');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {language === 'nl' ? 'Besteldetails' : 'Order Details'} - {order.order_number}
          </DialogTitle>
          <DialogDescription>
            {language === 'nl' ? 'Bekijk en beheer bestelgegevens' : 'View and manage order information'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            {isEditing ? (
              <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{language === 'nl' ? 'In afwachting' : 'Pending'}</SelectItem>
                  <SelectItem value="processing">{language === 'nl' ? 'Verwerken' : 'Processing'}</SelectItem>
                  <SelectItem value="shipped">{language === 'nl' ? 'Verzonden' : 'Shipped'}</SelectItem>
                  <SelectItem value="delivered">{language === 'nl' ? 'Afgeleverd' : 'Delivered'}</SelectItem>
                  <SelectItem value="cancelled">{language === 'nl' ? 'Geannuleerd' : 'Cancelled'}</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            )}
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveChanges} size="sm" className="gap-2">
                    <Save className="w-4 h-4" />
                    {language === 'nl' ? 'Opslaan' : 'Save'}
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                    {language === 'nl' ? 'Annuleren' : 'Cancel'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-2">
                  <Edit className="w-4 h-4" />
                  {language === 'nl' ? 'Bewerken' : 'Edit'}
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              {language === 'nl' ? 'Klantgegevens' : 'Customer Information'}
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-accent/20 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{order.first_name} {order.last_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{order.email}</span>
              </div>
              {order.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{order.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(order.created_at).toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US')}</span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              {language === 'nl' ? 'Verzendgegevens' : 'Shipping Information'}
            </h3>
            <div className="bg-accent/20 p-4 rounded-lg space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                <div>
                  <p>{order.shipping_address}</p>
                  <p>{order.shipping_postal_code} {order.shipping_city}</p>
                  <p>{order.shipping_country}</p>
                </div>
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Track & Trace</label>
                  <Input
                    value={editForm.tracking_number}
                    onChange={(e) => setEditForm({...editForm, tracking_number: e.target.value})}
                    placeholder={language === 'nl' ? 'Track & Trace nummer' : 'Tracking number'}
                  />
                </div>
              ) : order.tracking_number && (
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <code className="bg-background px-2 py-1 rounded">{order.tracking_number}</code>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                {language === 'nl' ? 'Bestelde Producten' : 'Order Items'}
              </h3>
              
              {order.items.map((item) => {
                let personalization: PersonalizationData | null = null;
                if (item.personalization_data) {
                  try {
                    personalization = JSON.parse(item.personalization_data);
                  } catch (e) {
                    console.error('Failed to parse personalization data:', e);
                  }
                }

                return (
                  <div key={item.id} className="border rounded-lg overflow-hidden">
                    {/* Product Header */}
                    <div className="bg-accent/20 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">{item.product_name}</h4>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{language === 'nl' ? 'Aantal' : 'Quantity'}: {item.quantity}</span>
                            <span>{language === 'nl' ? 'Prijs' : 'Price'}: €{item.unit_price.toFixed(2)}</span>
                            <span className="font-semibold text-foreground">
                              {language === 'nl' ? 'Totaal' : 'Total'}: €{item.total_price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Personalization Details */}
                    {personalization && (
                      <div className="p-4 space-y-4 bg-background">
                        <h5 className="font-semibold flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          {language === 'nl' ? 'Personalisatie Details' : 'Personalization Details'}
                        </h5>

                        {/* Character(s) Information */}
                        {personalization.allCharacters && personalization.allCharacters.length > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Users className="w-4 h-4" />
                              {language === 'nl' ? 'Personages' : 'Characters'} ({personalization.allCharacters.length})
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {personalization.allCharacters.map((char, idx) => (
                                <div key={idx} className="border rounded-lg p-3 bg-accent/10">
                                  <p className="font-semibold text-sm mb-1">{char.name}</p>
                                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                                    {char.age && <span>{language === 'nl' ? 'Leeftijd' : 'Age'}: {char.age}</span>}
                                    <span>{char.features.gender === 'boy' ? (language === 'nl' ? 'Jongen' : 'Boy') : (language === 'nl' ? 'Meisje' : 'Girl')}</span>
                                    <span>{language === 'nl' ? 'Haar' : 'Hair'}: {char.features.hairColor} ({char.features.hairStyle})</span>
                                    <span>{language === 'nl' ? 'Ogen' : 'Eyes'}: {char.features.eyeColor}</span>
                                    <span>{language === 'nl' ? 'Huid' : 'Skin'}: {char.features.skinTone}</span>
                                    {char.features.hasGlasses && <span>👓 {language === 'nl' ? 'Bril' : 'Glasses'}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : personalization.character ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <User className="w-4 h-4" />
                              {language === 'nl' ? 'Personage' : 'Character'}
                            </div>
                            <div className="border rounded-lg p-3 bg-accent/10">
                              {personalization.childName && <p className="font-semibold text-sm mb-1">{personalization.childName}</p>}
                              <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                                {personalization.childAge && <span>{language === 'nl' ? 'Leeftijd' : 'Age'}: {personalization.childAge}</span>}
                                <span>{personalization.character.gender === 'boy' ? (language === 'nl' ? 'Jongen' : 'Boy') : (language === 'nl' ? 'Meisje' : 'Girl')}</span>
                                <span>{language === 'nl' ? 'Haar' : 'Hair'}: {personalization.character.hairColor} ({personalization.character.hairStyle})</span>
                                <span>{language === 'nl' ? 'Ogen' : 'Eyes'}: {personalization.character.eyeColor}</span>
                                <span>{language === 'nl' ? 'Huid' : 'Skin'}: {personalization.character.skinTone}</span>
                                {personalization.character.hasGlasses && <span>👓 {language === 'nl' ? 'Bril' : 'Glasses'}</span>}
                              </div>
                            </div>
                          </div>
                        ) : (personalization.childName || personalization.childAge) && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <User className="w-4 h-4" />
                              {language === 'nl' ? 'Kind Informatie' : 'Child Information'}
                            </div>
                            <div className="bg-accent/10 rounded-lg p-3 text-sm">
                              {personalization.childName && <p><strong>{language === 'nl' ? 'Naam' : 'Name'}:</strong> {personalization.childName}</p>}
                              {personalization.childAge && <p><strong>{language === 'nl' ? 'Leeftijd' : 'Age'}:</strong> {personalization.childAge}</p>}
                            </div>
                          </div>
                        )}

                        {/* Story Details */}
                        {(personalization.theme || personalization.animal || personalization.pageCount) && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <BookOpen className="w-4 h-4" />
                              {language === 'nl' ? 'Verhaal Details' : 'Story Details'}
                            </div>
                            <div className="bg-accent/10 rounded-lg p-3 text-sm space-y-1">
                              {personalization.theme && <p><strong>{language === 'nl' ? 'Thema' : 'Theme'}:</strong> {personalization.theme}</p>}
                              {personalization.animal && <p><strong>{language === 'nl' ? 'Dier' : 'Animal'}:</strong> {personalization.animal}</p>}
                              {personalization.pageCount && <p><strong>{language === 'nl' ? 'Pagina\'s' : 'Pages'}:</strong> {personalization.pageCount}</p>}
                            </div>
                          </div>
                        )}

                        {/* Additional Details */}
                        {(personalization.hobbies || personalization.favoriteFood || personalization.interestingFact) && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Sparkles className="w-4 h-4" />
                              {language === 'nl' ? 'Extra Details' : 'Additional Details'}
                            </div>
                            <div className="bg-accent/10 rounded-lg p-3 text-sm space-y-1">
                              {personalization.hobbies && <p><strong>{language === 'nl' ? 'Hobbies' : 'Hobbies'}:</strong> {personalization.hobbies}</p>}
                              {personalization.favoriteFood && <p><strong>{language === 'nl' ? 'Favoriete Eten' : 'Favorite Food'}:</strong> {personalization.favoriteFood}</p>}
                              {personalization.interestingFact && <p><strong>{language === 'nl' ? 'Interessant Feit' : 'Interesting Fact'}:</strong> {personalization.interestingFact}</p>}
                            </div>
                          </div>
                        )}

                        {/* Personal Message */}
                        {personalization.personalMessage && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Mail className="w-4 h-4" />
                              {language === 'nl' ? 'Persoonlijk Bericht' : 'Personal Message'}
                            </div>
                            <div className="bg-accent/10 rounded-lg p-3 text-sm italic">
                              "{personalization.personalMessage}"
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Order Total Breakdown */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-accent/20 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{language === 'nl' ? 'Subtotaal' : 'Subtotal'}:</span>
                    <span>€{(order.subtotal || order.total_amount).toFixed(2)}</span>
                  </div>
                  {order.shipping_cost !== undefined && order.shipping_cost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {language === 'nl' ? 'Verzendkosten' : 'Shipping'}:
                      </span>
                      <span>€{order.shipping_cost.toFixed(2)}</span>
                    </div>
                  )}
                  {order.discount_amount !== undefined && order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {language === 'nl' ? 'Korting' : 'Discount'}
                        {order.coupon_code && ` (${order.coupon_code})`}:
                      </span>
                      <span>-€{order.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{language === 'nl' ? 'Totaal' : 'Total'}:</span>
                    <span>€{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Send Email to Customer */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Send className="w-5 h-5" />
              {language === 'nl' ? 'E-mail naar Klant' : 'Email Customer'}
            </h3>
            <div className="space-y-3 bg-accent/20 p-4 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium">{language === 'nl' ? 'Onderwerp' : 'Subject'}</label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder={language === 'nl' ? 'E-mail onderwerp' : 'Email subject'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{language === 'nl' ? 'Bericht' : 'Message'}</label>
                <Textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder={language === 'nl' ? 'Type je bericht...' : 'Type your message...'}
                  rows={4}
                />
              </div>
              <Button 
                onClick={handleSendEmail} 
                disabled={isSendingEmail || !emailSubject || !emailMessage}
                className="w-full gap-2"
              >
                <Send className="w-4 h-4" />
                {isSendingEmail 
                  ? (language === 'nl' ? 'Verzenden...' : 'Sending...') 
                  : (language === 'nl' ? 'E-mail Verzenden' : 'Send Email')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


