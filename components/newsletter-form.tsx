'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface NewsletterFormProps {
  variant?: 'inline' | 'card' | 'minimal';
  source?: string;
  leadMagnetType?: 'discount_code' | 'guide' | null;
  showInterests?: boolean;
  showSkinType?: boolean;
  className?: string;
}

const SKIN_TYPES = ['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'];
const INTERESTS = ['Skincare', 'Organic', 'Haircare', 'Makeup', 'Wellness'];

export default function NewsletterForm({
  variant = 'card',
  source = 'website',
  leadMagnetType = null,
  showInterests = false,
  showSkinType = false,
  className = ''
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [skinType, setSkinType] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [discountCode, setDiscountCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!consent) {
      toast.error('Please accept the privacy policy to subscribe');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          interests: selectedInterests,
          skinType: skinType || undefined,
          source,
          leadMagnetType,
          consent
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribed(true);
        if (data.discountCode) {
          setDiscountCode(data.discountCode);
        }
        toast.success(data.message || 'Successfully subscribed!');
        
        // Reset form
        setEmail('');
        setName('');
        setSelectedInterests([]);
        setSkinType('');
        setConsent(false);
      } else {
        toast.error(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  if (subscribed) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg">You're Subscribed!</h3>
            <p className="text-sm text-muted-foreground">
              Check your email for exclusive updates and offers
            </p>
            {discountCode && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium mb-2">Your Welcome Discount:</p>
                <code className="text-lg font-bold text-primary">{discountCode}</code>
                <p className="text-xs text-muted-foreground mt-2">Use this code at checkout!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name (Optional)</Label>
        <Input
          id="name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {showInterests && (
        <div className="space-y-2">
          <Label>Interests</Label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(interest => (
              <Badge
                key={interest}
                variant={selectedInterests.includes(interest) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {showSkinType && (
        <div className="space-y-2">
          <Label htmlFor="skinType">Skin Type (Optional)</Label>
          <select
            id="skinType"
            value={skinType}
            onChange={(e) => setSkinType(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select skin type</option>
            {SKIN_TYPES.map(type => (
              <option key={type} value={type.toLowerCase()}>{type}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-start space-x-2">
        <Checkbox
          id="consent"
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked === true)}
        />
        <Label htmlFor="consent" className="text-sm leading-tight cursor-pointer">
          I agree to receive marketing emails and accept the{' '}
          <a href="/privacy" className="underline">privacy policy</a>
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Subscribing...' : leadMagnetType === 'discount_code' ? 'Get My Discount' : 'Subscribe'}
      </Button>

      {leadMagnetType === 'discount_code' && (
        <p className="text-xs text-center text-muted-foreground">
          🎁 Get 10% off your first order!
        </p>
      )}
    </form>
  );

  if (variant === 'minimal') {
    return (
      <div className={`space-y-3 ${className}`}>
        <FormContent />
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`bg-muted/50 rounded-lg p-6 ${className}`}>
        <h3 className="font-semibold text-lg mb-2">
          {leadMagnetType === 'discount_code' ? '🎁 Get 10% Off!' : 'Join Our Newsletter'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {leadMagnetType === 'discount_code' 
            ? 'Subscribe and get an exclusive discount code!'
            : 'Get exclusive deals and beauty tips delivered to your inbox'}
        </p>
        <FormContent />
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          {leadMagnetType === 'discount_code' ? '🎁 Get 10% Off Your First Order!' : 'Join Our Newsletter'}
        </CardTitle>
        <CardDescription>
          {leadMagnetType === 'discount_code'
            ? 'Subscribe now and receive an instant discount code for your first purchase!'
            : 'Subscribe for exclusive deals, new product launches, and beauty tips'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormContent />
      </CardContent>
    </Card>
  );
}
