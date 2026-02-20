import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get total counts
    const totalStudents = await prisma.student.count();
    const totalEvents = await prisma.event.count();
    const totalCampaigns = await prisma.campaign.count();
    const totalInteractions = await prisma.interaction.count();

    // Get interaction breakdown
    const interactionsByType = await prisma.interaction.groupBy({
      by: ['type'],
      _count: true,
    });

    // Get recent campaigns with engagement
    const recentCampaigns = await prisma.campaign.findMany({
      take: 10,
      orderBy: {
        sentAt: 'desc',
      },
      include: {
        event: {
          include: {
            center: true,
            _count: {
              select: {
                interactions: true,
              },
            },
          },
        },
      },
    });

    const campaignStats = recentCampaigns.map(campaign => ({
      campaignId: campaign.id,
      eventTitle: campaign.event.title,
      centerName: campaign.event.center.name,
      targeted: campaign.targetedCount,
      interactions: campaign.event._count.interactions,
      conversionRate: campaign.targetedCount > 0 
        ? (campaign.event._count.interactions / campaign.targetedCount) * 100 
        : 0,
      sentAt: campaign.sentAt,
    }));

    return NextResponse.json({
      summary: {
        totalStudents,
        totalEvents,
        totalCampaigns,
        totalInteractions,
      },
      interactionsByType: Object.fromEntries(
        interactionsByType.map(i => [i.type, i._count])
      ),
      campaignStats,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
