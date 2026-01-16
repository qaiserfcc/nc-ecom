import { db } from './db';

/**
 * Social Content Database Utilities
 * Helper functions for common social content operations
 */

// ==========================================
// CONTENT OPERATIONS
// ==========================================

export async function getSocialContent(contentId: string) {
  return await db`
    SELECT * FROM social_content
    WHERE id = ${contentId}
  `.catch(() => null);
}

export async function getContentByStatus(status: 'draft' | 'posted' | 'scheduled' | 'failed') {
  return await db`
    SELECT * FROM social_content
    WHERE status = ${status}
    ORDER BY created_at DESC
  `;
}

export async function getContentByPlatform(platform: 'instagram' | 'facebook' | 'both') {
  return await db`
    SELECT * FROM social_content
    WHERE platform = ${platform}
    ORDER BY created_at DESC
  `;
}

export async function getDraftContent(limit: number = 10) {
  return await db`
    SELECT * FROM social_content
    WHERE status = 'draft'
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
}

export async function getContentByDateRange(startDate: Date, endDate: Date) {
  return await db`
    SELECT * FROM social_content
    WHERE created_at >= ${startDate}
      AND created_at <= ${endDate}
    ORDER BY created_at DESC
  `;
}

export async function updateContentStatus(
  contentId: string,
  status: 'draft' | 'posted' | 'scheduled' | 'failed'
) {
  return await db`
    UPDATE social_content
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${contentId}
  `;
}

export async function updatePostMetrics(
  contentId: string,
  likes: number,
  comments: number,
  shares: number,
  impressions: number
) {
  return await db`
    UPDATE social_content
    SET 
      likes = ${likes},
      comments = ${comments},
      shares = ${shares},
      impressions = ${impressions},
      updated_at = NOW()
    WHERE id = ${contentId}
  `;
}

export async function incrementPostCount(accountId: string) {
  return await db`
    UPDATE social_content
    SET post_count = post_count + 1
    WHERE id = ${accountId}
  `;
}

export async function deleteOldContent(daysOld: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return await db`
    DELETE FROM social_content
    WHERE status = 'posted'
      AND created_at < ${cutoffDate}
  `;
}

export async function getContentStats(startDate: Date, endDate: Date) {
  const result = await db`
    SELECT
      COUNT(*) as total_posts,
      COUNT(CASE WHEN status = 'posted' THEN 1 END) as posted_count,
      COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
      COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_count,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
      COALESCE(SUM(likes), 0) as total_likes,
      COALESCE(SUM(comments), 0) as total_comments,
      COALESCE(SUM(shares), 0) as total_shares,
      COALESCE(SUM(impressions), 0) as total_impressions,
      COALESCE(AVG(likes), 0) as avg_likes,
      COALESCE(AVG(comments), 0) as avg_comments,
      COALESCE(AVG(shares), 0) as avg_shares,
      COALESCE(AVG(impressions), 0) as avg_impressions
    FROM social_content
    WHERE created_at >= ${startDate}
      AND created_at <= ${endDate}
  `;
  return result?.[0] || null;
}

// ==========================================
// ACCOUNT OPERATIONS
// ==========================================

export async function getSocialAccount(accountId: string) {
  return await db`
    SELECT * FROM social_accounts
    WHERE id = ${accountId}
  `.catch(() => null);
}

export async function getAccountsByPlatform(platform: 'facebook' | 'instagram') {
  return await db`
    SELECT * FROM social_accounts
    WHERE platform = ${platform}
    ORDER BY created_at DESC
  `;
}

export async function getConnectedAccounts() {
  return await db`
    SELECT * FROM social_accounts
    WHERE is_active = true
    ORDER BY platform, connected_at DESC
  `;
}

export async function getAccountStats() {
  return await db`
    SELECT
      platform,
      COUNT(*) as account_count,
      COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
      COALESCE(SUM(CAST(follower_count AS BIGINT)), 0) as total_followers,
      COALESCE(AVG(CAST(follower_count AS BIGINT)), 0) as avg_followers
    FROM social_accounts
    GROUP BY platform
  `;
}

export async function updateAccountStatus(accountId: string, isActive: boolean) {
  return await db`
    UPDATE social_accounts
    SET is_active = ${isActive}, updated_at = NOW()
    WHERE id = ${accountId}
  `;
}

export async function updateFollowerCount(accountId: string, followerCount: number) {
  return await db`
    UPDATE social_accounts
    SET follower_count = ${followerCount}, updated_at = NOW()
    WHERE id = ${accountId}
  `;
}

export async function updateAccountTokens(
  accountId: string,
  accessToken: string,
  refreshToken?: string
) {
  if (refreshToken) {
    return await db`
      UPDATE social_accounts
      SET access_token = ${accessToken}, refresh_token = ${refreshToken}, updated_at = NOW()
      WHERE id = ${accountId}
    `;
  } else {
    return await db`
      UPDATE social_accounts
      SET access_token = ${accessToken}, updated_at = NOW()
      WHERE id = ${accountId}
    `;
  }
}

// ==========================================
// AUTOMATION OPERATIONS
// ==========================================

export async function getAutomationSchedule(scheduleId: string) {
  return await db`
    SELECT * FROM social_automation_schedule
    WHERE id = ${scheduleId}
  `.catch(() => null);
}

export async function getAllSchedules() {
  return await db`
    SELECT * FROM social_automation_schedule
    ORDER BY created_at DESC
  `;
}

export async function getActiveSchedules() {
  return await db`
    SELECT * FROM social_automation_schedule
    WHERE is_active = true
    ORDER BY next_run_at ASC
  `;
}

export async function getDueSchedules() {
  return await db`
    SELECT * FROM social_automation_schedule
    WHERE is_active = true
      AND next_run_at <= NOW()
    ORDER BY next_run_at ASC
  `;
}

export async function updateScheduleStatus(scheduleId: string, isActive: boolean) {
  return await db`
    UPDATE social_automation_schedule
    SET is_active = ${isActive}, updated_at = NOW()
    WHERE id = ${scheduleId}
  `;
}

export async function updateNextRunTime(scheduleId: string, nextRunAt: Date) {
  return await db`
    UPDATE social_automation_schedule
    SET next_run_at = ${nextRunAt}, updated_at = NOW()
    WHERE id = ${scheduleId}
  `;
}

export async function incrementRunCount(scheduleId: string) {
  return await db`
    UPDATE social_automation_schedule
    SET run_count = run_count + 1, updated_at = NOW()
    WHERE id = ${scheduleId}
  `;
}

export async function recordScheduleError(scheduleId: string, errorMessage: string) {
  return await db`
    UPDATE social_automation_schedule
    SET 
      error_count = error_count + 1,
      last_error = ${errorMessage},
      updated_at = NOW()
    WHERE id = ${scheduleId}
  `;
}

export async function getScheduleStats() {
  return await db`
    SELECT
      COUNT(*) as total_schedules,
      COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
      SUM(run_count) as total_runs,
      SUM(error_count) as total_errors,
      COALESCE(AVG(run_count), 0) as avg_runs,
      COALESCE(AVG(error_count), 0) as avg_errors
    FROM social_automation_schedule
  `;
}

// ==========================================
// ANALYTICS
// ==========================================

export async function getPlatformAnalytics(startDate: Date, endDate: Date) {
  return await db`
    SELECT
      platform,
      COUNT(*) as total_posts,
      COUNT(CASE WHEN status = 'posted' THEN 1 END) as posted_count,
      COALESCE(SUM(likes), 0) as total_likes,
      COALESCE(SUM(comments), 0) as total_comments,
      COALESCE(SUM(shares), 0) as total_shares,
      COALESCE(SUM(impressions), 0) as total_impressions,
      COALESCE(AVG(likes), 0) as avg_likes,
      COALESCE(AVG(CAST(likes AS DECIMAL) / NULLIF(impressions, 0) * 100), 0) as engagement_rate
    FROM social_content
    WHERE created_at >= ${startDate}
      AND created_at <= ${endDate}
    GROUP BY platform
  `;
}

export async function getTopPerformingContent(limit: number = 10) {
  return await db`
    SELECT
      id,
      content_title,
      platform,
      likes,
      comments,
      shares,
      impressions,
      created_at,
      (likes + comments + shares) as total_engagement
    FROM social_content
    WHERE status = 'posted'
    ORDER BY total_engagement DESC
    LIMIT ${limit}
  `;
}

export async function getContentTypePerformance(startDate: Date, endDate: Date) {
  return await db`
    SELECT
      content_type,
      COUNT(*) as total_posts,
      COALESCE(AVG(likes), 0) as avg_likes,
      COALESCE(AVG(comments), 0) as avg_comments,
      COALESCE(AVG(shares), 0) as avg_shares,
      COALESCE(AVG(impressions), 0) as avg_impressions
    FROM social_content
    WHERE created_at >= ${startDate}
      AND created_at <= ${endDate}
      AND status = 'posted'
    GROUP BY content_type
  `;
}

export async function getEngagementTrends(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await db`
    SELECT
      DATE(created_at) as date,
      COUNT(*) as posts,
      COALESCE(SUM(likes), 0) as total_likes,
      COALESCE(SUM(comments), 0) as total_comments,
      COALESCE(SUM(shares), 0) as total_shares,
      COALESCE(AVG(likes), 0) as avg_likes,
      COALESCE(AVG(comments), 0) as avg_comments,
      COALESCE(AVG(shares), 0) as avg_shares
    FROM social_content
    WHERE status = 'posted'
      AND created_at >= ${startDate}
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `;
}

// ==========================================
// BULK OPERATIONS
// ==========================================

export async function bulkUpdateContentStatus(
  contentIds: string[],
  status: 'draft' | 'posted' | 'scheduled' | 'failed'
) {
  return await db`
    UPDATE social_content
    SET status = ${status}, updated_at = NOW()
    WHERE id = ANY(${contentIds})
  `;
}

export async function bulkDeleteContent(contentIds: string[]) {
  return await db`
    DELETE FROM social_content
    WHERE id = ANY(${contentIds})
  `;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Calculate engagement rate
 */
export function calculateEngagementRate(
  likes: number,
  comments: number,
  shares: number,
  impressions: number
): number {
  if (impressions === 0) return 0;
  const totalEngagement = likes + comments + shares;
  return (totalEngagement / impressions) * 100;
}

/**
 * Get content status badge color
 */
export function getStatusBadgeColor(
  status: 'draft' | 'posted' | 'scheduled' | 'failed'
): string {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    posted: 'bg-green-100 text-green-800',
    scheduled: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
  };
  return colors[status];
}

/**
 * Format engagement metrics
 */
export function formatEngagementMetrics(
  likes: number,
  comments: number,
  shares: number
): string {
  const total = likes + comments + shares;
  if (total === 0) return 'No engagement';
  if (total > 1000) return `${(total / 1000).toFixed(1)}K engagement`;
  return `${total} engagement`;
}

/**
 * Get optimal posting time for platform
 */
export function getOptimalPostingTime(platform: 'instagram' | 'facebook'): string {
  const times = {
    instagram: '9:00 AM - 10:00 AM',
    facebook: '1:00 PM - 3:00 PM',
  };
  return times[platform];
}

/**
 * Get content type emoji
 */
export function getContentTypeEmoji(contentType: string): string {
  const emojis: Record<string, string> = {
    promotional: '🎯',
    educational: '📚',
    engagement: '💬',
    announcement: '📢',
    testimonial: '⭐',
    behind_the_scenes: '🎬',
  };
  return emojis[contentType] || '📝';
}

export default {
  // Content
  getSocialContent,
  getContentByStatus,
  getContentByPlatform,
  getDraftContent,
  getContentByDateRange,
  updateContentStatus,
  updatePostMetrics,
  incrementPostCount,
  deleteOldContent,
  getContentStats,
  // Accounts
  getSocialAccount,
  getAccountsByPlatform,
  getConnectedAccounts,
  getAccountStats,
  updateAccountStatus,
  updateFollowerCount,
  updateAccountTokens,
  // Automation
  getAutomationSchedule,
  getAllSchedules,
  getActiveSchedules,
  getDueSchedules,
  updateScheduleStatus,
  updateNextRunTime,
  incrementRunCount,
  recordScheduleError,
  getScheduleStats,
  // Analytics
  getPlatformAnalytics,
  getTopPerformingContent,
  getContentTypePerformance,
  getEngagementTrends,
  // Bulk operations
  bulkUpdateContentStatus,
  bulkDeleteContent,
  // Utilities
  calculateEngagementRate,
  getStatusBadgeColor,
  formatEngagementMetrics,
  getOptimalPostingTime,
  getContentTypeEmoji,
};
