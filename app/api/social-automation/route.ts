import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - Fetch automation schedules
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get('active');

    let query = 'SELECT * FROM social_automation_schedule WHERE 1=1';
    const params: any[] = [];

    if (isActive !== null) {
      query += ' AND is_active = $' + (params.length + 1);
      params.push(isActive === 'true');
    }

    query += ' ORDER BY created_at DESC';

    const data = await executeQuery(query, params);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching automation schedules:', error);
    return NextResponse.json({ error: 'Failed to fetch automation schedules' }, { status: 500 });
  }
}

// POST - Create automation schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      frequency,
      dayOfWeek,
      timeOfDay,
      generateCount,
      selectedPlatforms,
      contentType,
      includeHashtags,
      hashtagCount,
      useProductImages,
      enableAiOptimization,
      userId,
    } = body;

    if (!name || !frequency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate next run time
    const nextRunAt = calculateNextRun(frequency, dayOfWeek, timeOfDay);

    const result = await executeQuery(
      `INSERT INTO social_automation_schedule
      (name, description, frequency, day_of_week, time_of_day, generate_count, 
       selected_platforms, content_type, include_hashtags, hashtag_count, 
       use_product_images, enable_ai_optimization, next_run_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        name,
        description,
        frequency,
        dayOfWeek,
        timeOfDay,
        generateCount || 3,
        selectedPlatforms,
        contentType || 'promotional',
        includeHashtags !== false,
        hashtagCount || 5,
        useProductImages !== false,
        enableAiOptimization !== false,
        nextRunAt,
        userId,
      ]
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating automation schedule:', error);
    return NextResponse.json({ error: 'Failed to create automation schedule' }, { status: 500 });
  }
}

// PUT - Update automation schedule
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (key !== 'id') {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    values.push(id);

    const result = await executeQuery(
      `UPDATE social_automation_schedule SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating automation schedule:', error);
    return NextResponse.json({ error: 'Failed to update automation schedule' }, { status: 500 });
  }
}

// DELETE - Remove automation schedule
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    await executeQuery('DELETE FROM social_automation_schedule WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting automation schedule:', error);
    return NextResponse.json({ error: 'Failed to delete automation schedule' }, { status: 500 });
  }
}

// Helper function to calculate next run time
function calculateNextRun(frequency: string, dayOfWeek?: number, timeOfDay?: string): Date {
  const now = new Date();
  const nextRun = new Date(now);

  if (frequency === 'daily') {
    nextRun.setDate(nextRun.getDate() + 1);
    if (timeOfDay) {
      const [hours, minutes] = timeOfDay.split(':').map(Number);
      nextRun.setHours(hours, minutes, 0, 0);
    } else {
      nextRun.setHours(8, 0, 0, 0); // Default 8 AM
    }
  } else if (frequency === 'weekly' && dayOfWeek !== undefined) {
    let daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7 || 7;
    nextRun.setDate(nextRun.getDate() + daysUntilTarget);
    if (timeOfDay) {
      const [hours, minutes] = timeOfDay.split(':').map(Number);
      nextRun.setHours(hours, minutes, 0, 0);
    } else {
      nextRun.setHours(8, 0, 0, 0);
    }
  }

  return nextRun;
}
