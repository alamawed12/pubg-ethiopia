import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export interface SquadPlayer {
  id: string;
  referenceId: string;
  fullName: string;
  inGameName: string;
  pubgUid: string;
  phoneNumber: string;
  category: string;
  ticketTier: string;
  status: string;
  squadDetails: string | null;
  createdAt: string;
}

export interface TeamGroup {
  teamName: string;
  memberCount: number;
  isFull: boolean;
  members: SquadPlayer[];
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';

    // Fetch all players interested in tournaments or having a teamName
    const players = await prisma.registration.findMany({
      where: {
        OR: [
          { teamName: { not: null } },
          { category: { in: ['tournament_player', 'team_rep'] } },
          { tournamentInterest: true },
        ],
      },
      select: {
        id: true,
        referenceId: true,
        fullName: true,
        inGameName: true,
        pubgUid: true,
        phoneNumber: true,
        category: true,
        ticketTier: true,
        status: true,
        teamName: true,
        squadDetails: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const teamsMap = new Map<string, SquadPlayer[]>();
    const soloPlayers: SquadPlayer[] = [];

    for (const player of players) {
      const cleanTeam = player.teamName?.trim();
      const formattedPlayer: SquadPlayer = {
        id: player.id,
        referenceId: player.referenceId,
        fullName: player.fullName,
        inGameName: player.inGameName,
        pubgUid: player.pubgUid,
        phoneNumber: player.phoneNumber,
        category: player.category,
        ticketTier: player.ticketTier,
        status: player.status,
        squadDetails: player.squadDetails,
        createdAt: player.createdAt.toISOString(),
      };

      if (cleanTeam && cleanTeam.length > 0) {
        // Find existing team key case-insensitively
        let existingKey: string | null = null;
        for (const key of teamsMap.keys()) {
          if (key.toLowerCase() === cleanTeam.toLowerCase()) {
            existingKey = key;
            break;
          }
        }
        const targetKey = existingKey || cleanTeam;
        const currentList = teamsMap.get(targetKey) || [];
        currentList.push(formattedPlayer);
        teamsMap.set(targetKey, currentList);
      } else {
        soloPlayers.push(formattedPlayer);
      }
    }

    let teams: TeamGroup[] = Array.from(teamsMap.entries()).map(([teamName, members]) => ({
      teamName,
      memberCount: members.length,
      isFull: members.length >= 4,
      members,
    }));

    // Sort by memberCount descending
    teams.sort((a, b) => b.memberCount - a.memberCount);

    // Filter by search query if provided
    if (search) {
      teams = teams.filter(
        (t) =>
          t.teamName.toLowerCase().includes(search) ||
          t.members.some(
            (m) =>
              m.inGameName.toLowerCase().includes(search) ||
              m.fullName.toLowerCase().includes(search) ||
              m.pubgUid.includes(search)
          )
      );
    }

    const fullSquads = teams.filter((t) => t.isFull);
    const partialSquads = teams.filter((t) => !t.isFull);

    return NextResponse.json({
      success: true,
      stats: {
        totalTeams: teamsMap.size,
        fullSquadsCount: fullSquads.length,
        partialSquadsCount: partialSquads.length,
        soloPlayersCount: soloPlayers.length,
        totalTournamentPlayers: players.length,
      },
      teams,
      soloPlayers,
    });
  } catch (error) {
    console.error('[ADMIN_TEAMS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
