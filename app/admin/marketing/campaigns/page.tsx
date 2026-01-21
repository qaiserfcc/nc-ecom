'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight, Send, Save, Eye, Edit, Copy, Trash, Mail } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Campaign {
  id: number;
  name: string;
  subject: string;
  preview_text?: string;
  html_content?: string;
  campaign_type: 'promotional' | 'newsletter' | 'transactional';
  status: 'draft' | 'scheduled' | 'sent';
  scheduled_for: string | null;
  sent_at: string | null;
  total_recipients: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  open_rate: number;
  click_rate: number;
  target_interests?: string[];
  target_segment?: string;
  created_at: string;
}

export default function CampaignsPage() {
  const { data, mutate } = useSWR<{ success: boolean; campaigns: Campaign[] }>('/api/marketing/campaigns', fetcher);
  const campaigns = data?.campaigns || [];
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Email Campaigns</h2>
          <p className="text-muted-foreground">
            Create and manage email marketing campaigns
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Mail className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      <CampaignsList campaigns={campaigns} onEdit={(campaign) => {
        setSelectedCampaign(campaign);
        setCreateDialogOpen(true);
      }} onMutate={mutate} />

      <CreateCampaignDialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setSelectedCampaign(null);
        }}
        campaign={selectedCampaign}
        onSuccess={() => {
          mutate();
          setCreateDialogOpen(false);
          setSelectedCampaign(null);
        }}
      />
    </div>
  );
}

function CampaignsList({ campaigns, onEdit, onMutate }: { campaigns: Campaign[]; onEdit: (campaign: Campaign) => void; onMutate: () => void }) {
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      const res = await fetch('/api/marketing/campaigns', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Failed to delete campaign');
      toast({ title: 'Campaign deleted successfully' });
      onMutate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete campaign', variant: 'destructive' });
    }
  };

  const handleDuplicate = async (campaign: Campaign) => {
    try {
      const res = await fetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${campaign.name} (Copy)`,
          subject: campaign.subject,
          preview_text: campaign.preview_text,
          html_content: campaign.html_content,
          campaign_type: campaign.campaign_type,
          status: 'draft',
        }),
      });

      if (!res.ok) throw new Error('Failed to duplicate campaign');
      toast({ title: 'Campaign duplicated successfully' });
      onMutate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to duplicate campaign', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'scheduled': return 'bg-blue-500';
      case 'sent': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'promotional': return 'bg-purple-500';
      case 'newsletter': return 'bg-blue-500';
      case 'transactional': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Campaigns</CardTitle>
        <CardDescription>Manage your email campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Open Rate</TableHead>
              <TableHead>Click Rate</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>
                  <Badge className={getTypeColor(campaign.campaign_type)}>
                    {campaign.campaign_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </TableCell>
                <TableCell>{campaign.total_recipients || 0}</TableCell>
                <TableCell>{campaign.open_rate ? `${campaign.open_rate.toFixed(1)}%` : '-'}</TableCell>
                <TableCell>{campaign.click_rate ? `${campaign.click_rate.toFixed(1)}%` : '-'}</TableCell>
                <TableCell>
                  {campaign.scheduled_for ? format(new Date(campaign.scheduled_for), 'MMM d, yyyy') : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(campaign)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDuplicate(campaign)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(campaign.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

interface FormData {
  name: string;
  subject: string;
  preview_text: string;
  campaign_type: 'promotional' | 'newsletter' | 'transactional';
  html_content: string;
  target_interests: string[];
  target_segment: string;
  scheduled_for: Date | null;
  send_immediately: boolean;
  test_email: string;
}

function CreateCampaignDialog({ open, onClose, campaign, onSuccess }: {
  open: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onSuccess: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    subject: '',
    preview_text: '',
    campaign_type: 'promotional',
    html_content: '',
    target_interests: [],
    target_segment: 'all',
    scheduled_for: null,
    send_immediately: true,
    test_email: '',
  });
  const [estimatedRecipients, setEstimatedRecipients] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        subject: campaign.subject,
        preview_text: campaign.preview_text || '',
        campaign_type: campaign.campaign_type,
        html_content: campaign.html_content || '',
        target_interests: campaign.target_interests || [],
        target_segment: campaign.target_segment || 'all',
        scheduled_for: campaign.scheduled_for ? new Date(campaign.scheduled_for) : null,
        send_immediately: !campaign.scheduled_for,
        test_email: '',
      });
    } else {
      setFormData({
        name: '',
        subject: '',
        preview_text: '',
        campaign_type: 'promotional',
        html_content: '',
        target_interests: [],
        target_segment: 'all',
        scheduled_for: null,
        send_immediately: true,
        test_email: '',
      });
    }
    setCurrentStep(1);
  }, [campaign, open]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!open || !formData.name) return;

    const interval = setInterval(async () => {
      try {
        await fetch('/api/marketing/campaigns', {
          method: campaign ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            id: campaign?.id,
            status: 'draft',
          }),
        });
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [open, formData, campaign]);

  // Fetch estimated recipients when targeting changes
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const params = new URLSearchParams();
        if (formData.target_segment !== 'all') {
          params.append('segment', formData.target_segment);
        }
        if (formData.target_interests.length > 0) {
          params.append('interests', formData.target_interests.join(','));
        }

        const res = await fetch(`/api/marketing/campaigns/estimate?${params}`);
        const data = await res.json();
        setEstimatedRecipients(data.count || 0);
      } catch (error) {
        console.error('Failed to fetch recipients:', error);
      }
    };

    fetchRecipients();
  }, [formData.target_segment, formData.target_interests]);

  const handleSave = async (status: 'draft' | 'scheduled' | 'sent') => {
    setSaving(true);

    try {
      const payload = {
        ...formData,
        status,
        scheduled_for: formData.send_immediately ? null : formData.scheduled_for,
      };

      const res = await fetch('/api/marketing/campaigns', {
        method: campaign ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign ? { ...payload, id: campaign.id } : payload),
      });

      if (!res.ok) throw new Error('Failed to save campaign');

      toast({ title: `Campaign ${status === 'draft' ? 'saved' : status === 'scheduled' ? 'scheduled' : 'sent'} successfully` });
      onSuccess();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save campaign', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!formData.test_email) {
      toast({ title: 'Error', description: 'Please enter a test email', variant: 'destructive' });
      return;
    }

    try {
      const res = await fetch('/api/marketing/campaigns/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.test_email,
          subject: formData.subject,
          html_content: formData.html_content,
        }),
      });

      if (!res.ok) throw new Error('Failed to send test email');
      toast({ title: 'Test email sent successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send test email', variant: 'destructive' });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.subject;
      case 2:
        return formData.html_content.length > 0;
      case 3:
        return true;
      case 4:
        return formData.send_immediately || formData.scheduled_for;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
          <DialogDescription>
            Step {currentStep} of 5
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === currentStep ? 'bg-primary text-primary-foreground' :
                step < currentStep ? 'bg-green-500 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              {step < 5 && <div className="w-12 h-1 bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Summer Sale 2024"
              />
            </div>

            <div>
              <Label htmlFor="type">Campaign Type *</Label>
              <Select
                value={formData.campaign_type}
                onValueChange={(value: any) => setFormData({ ...formData, campaign_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotional">
                    <div>
                      <div className="font-medium">Promotional</div>
                      <div className="text-xs text-muted-foreground">Product launches, sales, offers</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="newsletter">
                    <div>
                      <div className="font-medium">Newsletter</div>
                      <div className="text-xs text-muted-foreground">Regular updates, news</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="transactional">
                    <div>
                      <div className="font-medium">Transactional</div>
                      <div className="text-xs text-muted-foreground">Order confirmations, receipts</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject Line * <span className="text-xs text-muted-foreground">(max 100 chars)</span></Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value.slice(0, 100) })}
                placeholder="e.g., Save 30% on Summer Skincare Essentials"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">{formData.subject.length}/100 characters</p>
            </div>

            <div>
              <Label htmlFor="preview_text">Preview Text <span className="text-xs text-muted-foreground">(shown in inbox)</span></Label>
              <Input
                id="preview_text"
                value={formData.preview_text}
                onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                placeholder="Limited time offer - Shop now!"
              />
            </div>
          </div>
        )}

        {/* Step 2: Content */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Email Content *</Label>
              <Textarea
                id="content"
                value={formData.html_content}
                onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                placeholder="Write your email content here... You can use {{name}}, {{email}}, {{discount_code}} for personalization."
                rows={15}
                className="font-mono"
              />
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, html_content: formData.html_content + '{{name}}' })}
                >
                  Insert {'{{name}}'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, html_content: formData.html_content + '{{email}}' })}
                >
                  Insert {'{{email}}'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, html_content: formData.html_content + '{{discount_code}}' })}
                >
                  Insert {'{{discount_code}}'}
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded p-4 max-h-64 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: formData.html_content.replace(/{{name}}/g, 'John Doe').replace(/{{email}}/g, 'john@example.com').replace(/{{discount_code}}/g, 'SAVE30') }} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Audience */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Target Segment</Label>
              <Select
                value={formData.target_segment}
                onValueChange={(value) => setFormData({ ...formData, target_segment: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscribers</SelectItem>
                  <SelectItem value="active">Active Subscribers (opened in last 30 days)</SelectItem>
                  <SelectItem value="inactive">Inactive Subscribers</SelectItem>
                  <SelectItem value="custom">Custom Criteria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.target_segment === 'custom' && (
              <div>
                <Label>Filter by Interests</Label>
                <div className="space-y-2 mt-2">
                  {['Skincare', 'Organic', 'Haircare', 'Makeup', 'Wellness'].map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={formData.target_interests.includes(interest.toLowerCase())}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              target_interests: [...formData.target_interests, interest.toLowerCase()],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              target_interests: formData.target_interests.filter((i) => i !== interest.toLowerCase()),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={interest}>{interest}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Estimated Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{estimatedRecipients.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">subscribers will receive this campaign</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Schedule */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <Label>Send Timing</Label>
              <RadioGroup
                value={formData.send_immediately ? 'immediate' : 'scheduled'}
                onValueChange={(value) => setFormData({ ...formData, send_immediately: value === 'immediate' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="immediate" id="immediate" />
                  <Label htmlFor="immediate">Send Immediately</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scheduled" id="scheduled" />
                  <Label htmlFor="scheduled">Schedule for Later</Label>
                </div>
              </RadioGroup>
            </div>

            {!formData.send_immediately && (
              <div>
                <Label>Schedule Date & Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduled_for ? format(formData.scheduled_for, 'PPP p') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.scheduled_for || undefined}
                      onSelect={(date) => setFormData({ ...formData, scheduled_for: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="border-t pt-4">
              <Label htmlFor="test_email">Send Test Email</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="test_email"
                  type="email"
                  value={formData.test_email}
                  onChange={(e) => setFormData({ ...formData, test_email: e.target.value })}
                  placeholder="your@email.com"
                />
                <Button type="button" variant="outline" onClick={handleSendTest}>
                  Send Test
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Name:</div>
                  <div>{formData.name}</div>
                  
                  <div className="font-medium">Type:</div>
                  <div className="capitalize">{formData.campaign_type}</div>
                  
                  <div className="font-medium">Subject:</div>
                  <div>{formData.subject}</div>
                  
                  <div className="font-medium">Recipients:</div>
                  <div>{estimatedRecipients.toLocaleString()} subscribers</div>
                  
                  <div className="font-medium">Schedule:</div>
                  <div>
                    {formData.send_immediately ? 'Immediate' : formData.scheduled_for ? format(formData.scheduled_for, 'PPP p') : '-'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Email Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded p-4 max-h-96 overflow-y-auto">
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-sm font-medium">Subject: {formData.subject}</p>
                    <p className="text-xs text-muted-foreground">{formData.preview_text}</p>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: formData.html_content.replace(/{{name}}/g, 'John Doe').replace(/{{email}}/g, 'john@example.com').replace(/{{discount_code}}/g, 'SAVE30') }} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep < 5 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={() => handleSave(formData.send_immediately ? 'sent' : 'scheduled')} disabled={saving}>
                  <Send className="h-4 w-4 mr-2" />
                  {formData.send_immediately ? 'Send Now' : 'Schedule'}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
