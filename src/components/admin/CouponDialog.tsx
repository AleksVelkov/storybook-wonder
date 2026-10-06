import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface Coupon {
  id?: number;
  code: string;
  discount_percentage: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  max_usage: number | null;
  max_uses_per_user: number | null;
}

interface CouponDialogProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon | null;
  token: string;
  onSuccess: () => void;
}

export function CouponDialog({ isOpen, onClose, coupon, token, onSuccess }: CouponDialogProps) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Coupon>({
    code: '',
    discount_percentage: 10,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true,
    max_usage: null,
    max_uses_per_user: null,
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        ...coupon,
        valid_from: coupon.valid_from.split('T')[0],
        valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
      });
    } else {
      setFormData({
        code: '',
        discount_percentage: 10,
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: '',
        is_active: true,
        max_usage: null,
        max_uses_per_user: null,
      });
    }
  }, [coupon, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      toast.error(language === 'nl' ? 'Couponcode is verplicht' : 'Coupon code is required');
      return;
    }

    if (formData.discount_percentage < 1 || formData.discount_percentage > 100) {
      toast.error(language === 'nl' ? 'Korting moet tussen 1 en 100% zijn' : 'Discount must be between 1 and 100%');
      return;
    }

    setLoading(true);
    try {
      const url = coupon 
        ? `${API_URL}/api/coupons/${coupon.id}`
        : `${API_URL}/api/coupons`;
      
      const method = coupon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: formData.code.toUpperCase().trim(),
          discount_percentage: formData.discount_percentage,
          valid_from: formData.valid_from,
          valid_until: formData.valid_until || null,
          is_active: formData.is_active,
          max_usage: formData.max_usage || null,
          max_uses_per_user: formData.max_uses_per_user || null,
        }),
      });

      if (response.ok) {
        toast.success(
          coupon
            ? (language === 'nl' ? 'Coupon bijgewerkt!' : 'Coupon updated!')
            : (language === 'nl' ? 'Coupon aangemaakt!' : 'Coupon created!')
        );
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || (language === 'nl' ? 'Fout bij opslaan coupon' : 'Error saving coupon'));
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error(language === 'nl' ? 'Kan geen verbinding maken met de server' : 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {coupon
              ? (language === 'nl' ? 'Coupon Bewerken' : 'Edit Coupon')
              : (language === 'nl' ? 'Nieuwe Coupon' : 'New Coupon')}
          </DialogTitle>
          <DialogDescription>
            {language === 'nl'
              ? 'Vul de coupongegevens in. Velden met * zijn verplicht.'
              : 'Fill in the coupon details. Fields with * are required.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Coupon Code */}
          <div>
            <Label htmlFor="code">{language === 'nl' ? 'Couponcode' : 'Coupon Code'} *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="SUMMER25"
              className="uppercase"
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'nl' ? 'Bijv. WELCOME10, SUMMER25, BLACKFRIDAY' : 'E.g. WELCOME10, SUMMER25, BLACKFRIDAY'}
            </p>
          </div>

          {/* Discount Percentage */}
          <div>
            <Label htmlFor="discount">{language === 'nl' ? 'Korting %' : 'Discount %'} *</Label>
            <Input
              id="discount"
              type="number"
              min="1"
              max="100"
              value={formData.discount_percentage}
              onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
              required
              disabled={loading}
            />
          </div>

          {/* Valid From and Until */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valid_from">{language === 'nl' ? 'Geldig vanaf' : 'Valid from'} *</Label>
              <Input
                id="valid_from"
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="valid_until">{language === 'nl' ? 'Geldig tot (optioneel)' : 'Valid until (optional)'}</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'nl' ? 'Laat leeg voor geen vervaldatum' : 'Leave empty for no expiration'}
              </p>
            </div>
          </div>

          {/* Max Usage Limits */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-3">{language === 'nl' ? 'Gebruiksbeperkingen (optioneel)' : 'Usage Limits (optional)'}</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_usage">{language === 'nl' ? 'Max totaal gebruik' : 'Max total usage'}</Label>
                <Input
                  id="max_usage"
                  type="number"
                  min="1"
                  value={formData.max_usage || ''}
                  onChange={(e) => setFormData({ ...formData, max_usage: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder={language === 'nl' ? 'Onbeperkt' : 'Unlimited'}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'nl' ? 'Totaal aantal keren dat coupon gebruikt kan worden' : 'Total times coupon can be used'}
                </p>
              </div>

              <div>
                <Label htmlFor="max_uses_per_user">{language === 'nl' ? 'Max per gebruiker' : 'Max per user'}</Label>
                <Input
                  id="max_uses_per_user"
                  type="number"
                  min="1"
                  value={formData.max_uses_per_user || ''}
                  onChange={(e) => setFormData({ ...formData, max_uses_per_user: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder={language === 'nl' ? 'Onbeperkt' : 'Unlimited'}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'nl' ? 'Aantal keren per klant' : 'Times per customer'}
                </p>
              </div>
            </div>

            <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
              💡 {language === 'nl'
                ? 'Laat leeg voor onbeperkt gebruik. Gebruik 1 voor eenmalige coupons.'
                : 'Leave empty for unlimited usage. Use 1 for single-use coupons.'}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 accent-primary"
              disabled={loading}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              {language === 'nl' ? 'Coupon is actief' : 'Coupon is active'}
            </Label>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {language === 'nl' ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading
                ? (language === 'nl' ? 'Bezig...' : 'Saving...')
                : coupon
                ? (language === 'nl' ? 'Bijwerken' : 'Update')
                : (language === 'nl' ? 'Aanmaken' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

