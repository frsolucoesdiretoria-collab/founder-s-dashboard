import { NextRequest, NextResponse } from 'next/server';
import { appointmentReminderJob, vacancyNotificationJob } from '@/lib/background-jobs';

const CRON_SECRET = process.env.CRON_SECRET || '';

/**
 * GET /api/cron?job=reminders|vacancies
 *
 * Called by Vercel Cron, external scheduler, or manual trigger.
 * Protected by CRON_SECRET header.
 */
export async function GET(req: NextRequest) {
  // Validate secret
  const secret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret');
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ status: 'unauthorized' }, { status: 401 });
  }

  const job = req.nextUrl.searchParams.get('job');

  if (job === 'reminders') {
    const result = await appointmentReminderJob();
    return NextResponse.json({ status: 'ok', job: 'reminders', ...result });
  }

  if (job === 'vacancies') {
    const result = await vacancyNotificationJob();
    return NextResponse.json({ status: 'ok', job: 'vacancies', ...result });
  }

  // Run both
  const [reminders, vacancies] = await Promise.all([
    appointmentReminderJob(),
    vacancyNotificationJob(),
  ]);

  return NextResponse.json({
    status: 'ok',
    reminders,
    vacancies,
  });
}
