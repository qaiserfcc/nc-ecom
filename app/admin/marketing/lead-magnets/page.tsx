'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Gift, TrendingUp, Users } from 'lucide-react';

type LeadMagnet = {
  id: number;
  name: string;
  type: string;
  title: string;
  description: string;
  discount_type: string | null;
  discount_value: number | null;
  requires_email: boolean;
  requires_phone: boolean;
  requires_interests: boolean;
  minimum_purchase: number | null;
  valid_days: number;
  max_uses_per_user: number;
  is_active: boolean;
  total_claims: number;
  total_conversions: number;
  file_url: string | null;
  content: string | null;
  created_at: string;
};

type FormData = {
  name: string;
  type: string;
  title: string;
  description: string;
  discountType: string;
  discountValue: string;
  requiresEmail: boolean;
  requiresPhone: boolean;
  requiresInterests: boolean;
  minimumPurchase: string;
  validDays: string;
  maxUsesPerUser: string;
  isActive: boolean;
  fileUrl: string;
  content: string;
};

const initialFormData: FormData = {
  name: '',
  type: 'discount_code',
  title: '',
  description: '',
  discountType: 'percentage',
  discountValue: '10',
  requiresEmail: true,
  requiresPhone: false,
  requiresInterests: false,
  minimumPurchase: '',
  validDays: '30',
  maxUsesPerUser: '1',
  isActive: true,
  fileUrl: '',
  content: '',
};

export default function LeadMagnetsPage() {
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeadMagnets();
  }, []);

  const fetchLeadMagnets = async () => {
    try {
      const response = await fetch('/api/marketing/lead-magnets');
      if (!response.ok) throw new Error('Failed to fetch lead magnets');
      const data = await response.json();
      setLeadMagnets(data.leadMagnets || []);
    } catch (error) {
      toast.error('Failed to load lead magnets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        discountType: formData.type === 'discount_code' ? formData.discountType : null,
        discountValue: formData.type === 'discount_code' ? parseFloat(formData.discountValue) : null,
        requiresEmail: formData.requiresEmail,
        requiresPhone: formData.requiresPhone,
        requiresInterests: formData.requiresInterests,
        minimumPurchase: formData.minimumPurchase ? parseFloat(formData.minimumPurchase) : null,
        validDays: parseInt(formData.validDays),
        maxUsesPerUser: parseInt(formData.maxUsesPerUser),
        isActive: formData.isActive,
        fileUrl: formData.fileUrl || null,
        content: formData.content || null,
      };

      const url = editingId 
        ? '/api/marketing/lead-magnets' 
        : '/api/marketing/lead-magnets';
      
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...payload, id: editingId } : payload;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save lead magnet');

      toast.success(editingId ? 'Lead magnet updated!' : 'Lead magnet created!');
      setDialogOpen(false);
      setFormData(initialFormData);
      setEditingId(null);
      fetchLeadMagnets();
    } catch (error) {
      toast.error('Failed to save lead magnet');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (magnet: LeadMagnet) => {
    setEditingId(magnet.id);
    setFormData({
      name: magnet.name,
      type: magnet.type,
      title: magnet.title,
      description: magnet.description,
      discountType: magnet.discount_type || 'percentage',
      discountValue: magnet.discount_value?.toString() || '10',
      requiresEmail: magnet.requires_email,
      requiresPhone: magnet.requires_phone,
      requiresInterests: magnet.requires_interests,
      minimumPurchase: magnet.minimum_purchase?.toString() || '',
      validDays: magnet.valid_days.toString(),
      maxUsesPerUser: magnet.max_uses_per_user.toString(),
      isActive: magnet.is_active,
      fileUrl: magnet.file_url || '',
      content: magnet.content || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lead magnet?')) return;

    try {
      const response = await fetch('/api/marketing/lead-magnets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: false }),
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Lead magnet deleted');
      fetchLeadMagnets();
    } catch (error) {
      toast.error('Failed to delete lead magnet');
      console.error(error);
    }
  };

  const calculateConversionRate = (magnet: LeadMagnet) => {
    if (magnet.total_claims === 0) return 0;
    return ((magnet.total_conversions / magnet.total_claims) * 100).toFixed(1);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      discount_code: 'bg-green-500',
      guide: 'bg-blue-500',
      ebook: 'bg-purple-500',
      checklist: 'bg-orange-500',
      quiz: 'bg-pink-500',
      free_sample: 'bg-yellow-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const stats = {
    totalMagnets: leadMagnets.length,
    activeMagnets: leadMagnets.filter(m => m.is_active).length,
    totalClaims: leadMagnets.reduce((sum, m) => sum + m.total_claims, 0),
    totalConversions: leadMagnets.reduce((sum, m) => sum + m.total_conversions, 0),
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lead Magnets</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage lead generation offers
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingId(null);
              setFormData(initialFormData);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Lead Magnet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Lead Magnet' : 'Create Lead Magnet'}
              </DialogTitle>
              <DialogDescription>
                Configure your lead generation offer
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Internal Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Welcome Discount 10%"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Lead Magnet Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discount_code">Discount Code</SelectItem>
                      <SelectItem value="guide">Downloadable Guide</SelectItem>
                      <SelectItem value="ebook">E-book</SelectItem>
                      <SelectItem value="checklist">Checklist</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="free_sample">Free Sample</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Public Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Get 10% Off Your First Order!"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Subscribe and save on premium organic skincare"
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Discount Configuration (only for discount_code type) */}
              {formData.type === 'discount_code' && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold">Discount Configuration</h3>
                  
                  <div>
                    <Label htmlFor="discountType">Discount Type</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value) => setFormData({ ...formData, discountType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage Off</SelectItem>
                        <SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
                        <SelectItem value="free_shipping">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.discountType !== 'free_shipping' && (
                    <div>
                      <Label htmlFor="discountValue">
                        {formData.discountType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                      </Label>
                      <Input
                        id="discountValue"
                        type="number"
                        step="0.01"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="minimumPurchase">Minimum Purchase ($)</Label>
                    <Input
                      id="minimumPurchase"
                      type="number"
                      step="0.01"
                      value={formData.minimumPurchase}
                      onChange={(e) => setFormData({ ...formData, minimumPurchase: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              )}

              {/* File/Content (for downloadable types) */}
              {['guide', 'ebook', 'checklist'].includes(formData.type) && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold">Content</h3>
                  
                  <div>
                    <Label htmlFor="fileUrl">File URL (PDF, ZIP, etc.)</Label>
                    <Input
                      id="fileUrl"
                      type="url"
                      value={formData.fileUrl}
                      onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                      placeholder="https://example.com/files/guide.pdf"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Or Text Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Paste your guide content here..."
                      rows={5}
                    />
                  </div>
                </div>
              )}

              {/* Requirements */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Requirements</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="requiresEmail">Requires Email</Label>
                  <Switch
                    id="requiresEmail"
                    checked={formData.requiresEmail}
                    onCheckedChange={(checked) => setFormData({ ...formData, requiresEmail: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="requiresPhone">Requires Phone</Label>
                  <Switch
                    id="requiresPhone"
                    checked={formData.requiresPhone}
                    onCheckedChange={(checked) => setFormData({ ...formData, requiresPhone: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="requiresInterests">Requires Interests</Label>
                  <Switch
                    id="requiresInterests"
                    checked={formData.requiresInterests}
                    onCheckedChange={(checked) => setFormData({ ...formData, requiresInterests: checked })}
                  />
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Conditions</h3>
                
                <div>
                  <Label htmlFor="validDays">Valid for (days)</Label>
                  <Input
                    id="validDays"
                    type="number"
                    value={formData.validDays}
                    onChange={(e) => setFormData({ ...formData, validDays: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="maxUsesPerUser">Max Uses Per User</Label>
                  <Input
                    id="maxUsesPerUser"
                    type="number"
                    value={formData.maxUsesPerUser}
                    onChange={(e) => setFormData({ ...formData, maxUsesPerUser: e.target.value })}
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Magnets</CardTitle>
            <Gift className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMagnets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeMagnets} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClaims}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversions}</div>
            <p className="text-xs text-muted-foreground">
              From claims
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalClaims > 0 
                ? ((stats.totalConversions / stats.totalClaims) * 100).toFixed(1)
                : '0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Magnets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Lead Magnets</CardTitle>
          <CardDescription>
            Manage your lead generation offers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : leadMagnets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No lead magnets yet. Create one to get started!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Claims</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Conv. Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadMagnets.map((magnet) => (
                  <TableRow key={magnet.id}>
                    <TableCell className="font-medium">{magnet.name}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(magnet.type)}>
                        {magnet.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{magnet.title}</TableCell>
                    <TableCell>{magnet.total_claims}</TableCell>
                    <TableCell>{magnet.total_conversions}</TableCell>
                    <TableCell>{calculateConversionRate(magnet)}%</TableCell>
                    <TableCell>
                      <Badge variant={magnet.is_active ? 'default' : 'secondary'}>
                        {magnet.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(magnet)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(magnet.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
