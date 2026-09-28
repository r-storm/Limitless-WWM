import { useEffect } from 'react';
import usePlannerState from '../../hooks/usePlannerState';
import PlannerWorkspace from '../planner/PlannerWorkspace';
import PlannerToolbar from '../planner/PlannerToolbar';
import PlayerPanel from '../planner/PlayerPanel';
import CanvasTabs from '../planner/CanvasTabs';

export default function PlannerPage() {
  const state = usePlannerState();
  const { undoStroke, redoStroke } = state;

  // Ctrl+Z undo / Ctrl+Shift+Z redo shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoStroke();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redoStroke();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redoStroke();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undoStroke, redoStroke]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex flex-col">
      <div className="relative flex-1 flex flex-col min-h-0">
        <PlannerToolbar
          mode={state.mode}
          onModeChange={state.setMode}
          shapeType={state.shapeType}
          onShapeTypeChange={state.setShapeType}
          penColor={state.penColor}
          onPenColorChange={state.setPenColor}
          penSize={state.penSize}
          onPenSizeChange={state.setPenSize}
          onUndo={state.undoStroke}
          onRedo={state.redoStroke}
          onClear={state.clearDrawing}
          strokeCount={state.strokes.length}
          redoCount={state.redoStack.length}
          timedDrawing={state.timedDrawing}
          onTimedDrawingChange={state.setTimedDrawing}
        />

        <CanvasTabs
          canvases={state.canvases}
          activeIndex={state.activeCanvasIndex}
          onSelect={state.switchCanvas}
          onAdd={state.addCanvas}
          onRemove={state.removeCanvas}
          onRename={state.renameCanvas}
        />

        <PlannerWorkspace
          mode={state.mode}
          shapeType={state.shapeType}
          penColor={state.penColor}
          penSize={state.penSize}
          placedPlayers={state.placedPlayers}
          teams={state.teams}
          markers={state.markers}
          strokes={state.strokes}
          currentStroke={state.currentStroke}
          onPlacePlayer={state.placePlayer}
          onMovePlayer={state.movePlayer}
          onRemovePlayer={state.removePlayer}
          onPlaceTeam={state.placeTeam}
          onMoveTeam={state.moveTeam}
          onRemoveTeamFromMap={state.removeTeamFromMap}
          onPlaceMarker={state.placeMarker}
          onMoveMarker={state.moveMarker}
          onRemoveMarker={state.removeMarker}
          onUpdateMarkerText={state.updateMarkerText}
          onUpdateMarkerFontSize={state.updateMarkerFontSize}
          onModeChange={state.setMode}
          onBeginStroke={state.beginStroke}
          onContinueStroke={state.continueStroke}
          onEndStroke={state.endStroke}
          timedDrawing={state.timedDrawing}
          onExpireStrokes={state.expireStrokes}
        />

        {/* Bottom drawer */}
        <PlayerPanel
          teams={state.teams}
          onAddTeam={state.addTeam}
          onRemoveTeam={state.removeTeam}
          onRenameTeam={state.renameTeam}
          onChangeTeamColor={state.changeTeamColor}
        />
      </div>
    </div>
  );
}
