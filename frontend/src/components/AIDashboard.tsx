import { AdvisorHUD } from './AdvisorHUD';
import { PlayerStats } from './PlayerStats';
import { PostHandAnalysis } from './PostHandAnalysis';
import type { FullAnalysisResponse } from '../lib/api';

interface AIDashboardProps {
  fullAnalysis: FullAnalysisResponse | null;
  loading: boolean;
  onRunAnalysis: () => void;
  showdownResult: any;
  playerStats: Record<string, any>;
  onNewHand: (isNextHand?: boolean) => void;
  theoryMode?: boolean;
  isPlayerTurn?: boolean;
  hasCards?: boolean;
}

export function AIDashboard({
  fullAnalysis,
  loading,
  onRunAnalysis,
  showdownResult,
  playerStats,
  onNewHand,
  isPlayerTurn = false,
  hasCards = false,
  userName = 'You'
}: AIDashboardProps & { userName?: string }) {

  return (
    <div className="flex-1 flex flex-col gap-4">
      {showdownResult ? (
        <PostHandAnalysis
          showdownResult={showdownResult}
          onNewHand={() => onNewHand(true)}
          userName={userName}
        />
      ) : (
        <>
          {/* Unified AI Tactical HUD - only show when it's player's turn */}
          {isPlayerTurn && (
            <AdvisorHUD
              analysis={fullAnalysis}
              loading={loading}
              onRefresh={onRunAnalysis}
              hasCards={hasCards}
            />
          )}

          {/* Legacy Player Behavior Panel (Fallback/Extra) */}
          {Object.keys(playerStats).length > 0 && (
            <PlayerStats
              stats={playerStats}
            />
          )}
        </>
      )}
    </div>
  );
}
