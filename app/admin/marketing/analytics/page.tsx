'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Mail, Gift, ShoppingCart, TrendingUp, 
  DollarSign, MousePointerClick, Eye, ArrowUpRight 
} from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      
      const response = await fetch(
        `/api/marketing/analytics?startDate=${startDate}&endDate=${endDate}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-muted-foreground">
          No analytics data available
        </div>
      </div>
    );
  }

  const {
    subscribers,
    campaigns,
    leadMagnets,
    abandonedCarts,
    events,
    revenue,
    leadSources,
    interests,
    engagementTrend,
  } = analytics;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your marketing performance and ROI
          </p>
        </div>
        <div className="flex gap-2">
          <Badge 
            variant={period === '7' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setPeriod('7')}
          >
            Last 7 Days
          </Badge>
          <Badge 
            variant={period === '30' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setPeriod('30')}
          >
            Last 30 Days
          </Badge>
          <Badge 
            variant={period === '90' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setPeriod('90')}
          >
            Last 90 Days
          </Badge>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers?.total_subscribers || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-500" />
              {subscribers?.new_subscribers || 0} new this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Marketing Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${parseFloat(revenue?.total_marketing_revenue || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(revenue?.email_conversions || 0) + (revenue?.cart_recoveries || 0)} conversions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lead Magnets</CardTitle>
            <Gift className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadMagnets?.total_claims || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {parseFloat(leadMagnets?.conversion_rate || 0).toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cart Recovery</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${parseFloat(abandonedCarts?.total_recovered_value || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {parseFloat(abandonedCarts?.recovery_rate || 0).toFixed(1)}% recovery rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="leadmagnets">Lead Magnets</TabsTrigger>
          <TabsTrigger value="carts">Abandoned Carts</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        {/* Email Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Email campaign metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Campaigns</span>
                  <span className="font-bold">{campaigns?.total_campaigns || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sent</span>
                  <span className="font-bold">{campaigns?.sent_campaigns || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Scheduled</span>
                  <span className="font-bold">{campaigns?.scheduled_campaigns || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Rates</CardTitle>
                <CardDescription>Average email engagement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Open Rate</span>
                  <span className="font-bold">
                    {parseFloat(campaigns?.avg_open_rate || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Click Rate</span>
                  <span className="font-bold">
                    {parseFloat(campaigns?.avg_click_rate || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Campaigns This Period</span>
                  <span className="font-bold">{campaigns?.campaigns_this_period || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Attribution</CardTitle>
                <CardDescription>Email-driven revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-bold">
                    ${parseFloat(revenue?.email_revenue || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Conversions</span>
                  <span className="font-bold">{revenue?.email_conversions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Order Value</span>
                  <span className="font-bold">
                    $
                    {revenue?.email_conversions > 0
                      ? (parseFloat(revenue.email_revenue) / revenue.email_conversions).toFixed(2)
                      : '0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Stats</CardTitle>
                <CardDescription>Email list health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Subscribers</span>
                  <span className="font-bold">{subscribers?.total_subscribers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <span className="font-bold text-green-600">
                    {subscribers?.active_subscribers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Unsubscribed</span>
                  <span className="font-bold text-red-600">
                    {subscribers?.unsubscribed || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Churn Rate</span>
                  <span className="font-bold">
                    {subscribers?.total_subscribers > 0
                      ? ((subscribers.unsubscribed / subscribers.total_subscribers) * 100).toFixed(1)
                      : '0'}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement</CardTitle>
                <CardDescription>Subscriber activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Emails Opened</span>
                  <span className="font-bold">
                    {parseFloat(subscribers?.avg_emails_opened || 0).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Emails Clicked</span>
                  <span className="font-bold">
                    {parseFloat(subscribers?.avg_emails_clicked || 0).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">New This Period</span>
                  <span className="font-bold text-green-600">
                    +{subscribers?.new_subscribers || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lead Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Sources</CardTitle>
              <CardDescription>Where subscribers come from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leadSources?.map((source: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-medium capitalize">
                        {source.source?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Total: <strong>{source.subscriber_count}</strong>
                      </span>
                      <span className="text-green-600">
                        +{source.new_this_period} this period
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Interests</CardTitle>
              <CardDescription>Subscriber interest distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {interests?.map((interest: any, index: number) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {interest.interest}: {interest.subscriber_count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Magnets Tab */}
        <TabsContent value="leadmagnets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Lead Magnet Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Magnets</span>
                  <span className="font-bold">{leadMagnets?.active_magnets || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Claims</span>
                  <span className="font-bold">{leadMagnets?.total_claims || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Claims This Period</span>
                  <span className="font-bold text-green-600">
                    +{leadMagnets?.claims_this_period || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Conversions</span>
                  <span className="font-bold">{leadMagnets?.total_conversions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="font-bold text-green-600">
                    {parseFloat(leadMagnets?.conversion_rate || 0).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Abandoned Carts Tab */}
        <TabsContent value="carts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Abandonment Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Abandoned</span>
                  <span className="font-bold">{abandonedCarts?.total_abandoned || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Period</span>
                  <span className="font-bold">{abandonedCarts?.abandoned_this_period || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Abandoned Value</span>
                  <span className="font-bold">
                    ${parseFloat(abandonedCarts?.total_abandoned_value || 0).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recovery Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Recovered Carts</span>
                  <span className="font-bold text-green-600">
                    {abandonedCarts?.recovered_count || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Recovery Rate</span>
                  <span className="font-bold text-green-600">
                    {parseFloat(abandonedCarts?.recovery_rate || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Recovered Value</span>
                  <span className="font-bold text-green-600">
                    ${parseFloat(abandonedCarts?.total_recovered_value || 0).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Potential Value</span>
                  <span className="font-bold">
                    ${parseFloat(abandonedCarts?.total_abandoned_value || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Recovered</span>
                  <span className="font-bold text-green-600">
                    ${parseFloat(abandonedCarts?.total_recovered_value || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Recovery %</span>
                  <span className="font-bold text-green-600">
                    {abandonedCarts?.total_abandoned_value > 0
                      ? ((parseFloat(abandonedCarts.total_recovered_value || 0) / parseFloat(abandonedCarts.total_abandoned_value)) * 100).toFixed(1)
                      : '0'}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Events</CardTitle>
              <CardDescription>Activity tracking for this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(events || {}).map(([eventType, count]) => (
                  <div key={eventType} className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1 capitalize">
                      {eventType.replace(/_/g, ' ')}
                    </div>
                    <div className="text-2xl font-bold">{count as number}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
