import { useRef, useState, useEffect, useCallback } from 'react';
import MapCanvas from './MapCanvas';
import PlacedPlayerToken from './PlacedPlayerToken';
import PlacedTeamToken from './PlacedTeamToken';
import PlacedMarkerToken from './PlacedMarkerToken';
import mapImage from '../../assets/MapV2.jpeg';

export default function PlannerWorkspace({
  mode,
  shapeType,
  penColor,
  penSize,
  placedPlayers,
  teams,
  markers,
  strokes,
  currentStroke,
  onPlacePlayer,
  onMovePlayer,
  onRemovePlayer,
  onPlaceTeam,
  onMoveTeam,
  onRemoveTeamFromMap,
  onPlaceMarker,
  onMoveMarker,
  onRemoveMarker,
  onUpdateMarkerText,
  onUpdateMarkerFontSize,
  onModeChange,
  onBeginStroke,
  onContinueStroke,
  onEndStroke,
  timedDrawing,
  onExpireStrokes,
}) {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Text input state
  const [textInput, setTextInput] = useState(null); // { x, y } in percent

  // Selection state
  const [selectedMarkers, setSelectedMarkers] = useState(new Set());
  const [selectedTeams, setSelectedTeams] = useState(new Set());
  const [selectionRect, setSelectionRect] = useState(null);
  const selectionStart = useRef(null);

  // Group drag state
  const groupSnapshots = useRef(null);

  // Clear selection when mode changes
  useEffect(() => {
    setSelectedMarkers(new Set());
    setSelectedTeams(new Set());
    setSelectionRect(null);
  }, [mode]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const getPercentPos = useCallback((clientX, clientY) => {
    const el = containerRef.current;
    if (!el) return { x: 50, y: 50 };
    const rect = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)),
    };
  }, []);

  // Rubber-band selection handlers
  const handleWorkspacePointerDown = useCallback((e) => {
    // Text mode — click to place text input
    if (mode === 'text') {
      if (e.target !== containerRef.current && !e.target.closest('img[alt="War map"]')) return;
      e.preventDefault();
      const pos = getPercentPos(e.clientX, e.clientY);
      setTextInput(pos);
      return;
    }

    if (mode !== 'select') return;
    // Only start selection on the workspace itself (not on tokens)
    if (e.target !== containerRef.current && !e.target.closest('img[alt="War map"]')) return;
    e.preventDefault();
    const pos = getPercentPos(e.clientX, e.clientY);
    selectionStart.current = pos;
    setSelectionRect({ x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });
    // Clear selection on click
    setSelectedMarkers(new Set());
    setSelectedTeams(new Set());
  }, [mode, getPercentPos]);

  const handleWorkspacePointerMove = useCallback((e) => {
    if (!selectionStart.current) return;
    const pos = getPercentPos(e.clientX, e.clientY);
    setSelectionRect({
      x1: selectionStart.current.x,
      y1: selectionStart.current.y,
      x2: pos.x,
      y2: pos.y,
    });
  }, [getPercentPos]);

  const handleWorkspacePointerUp = useCallback(() => {
    if (!selectionStart.current || !selectionRect) {
      selectionStart.current = null;
      setSelectionRect(null);
      return;
    }

    const minX = Math.min(selectionRect.x1, selectionRect.x2);
    const maxX = Math.max(selectionRect.x1, selectionRect.x2);
    const minY = Math.min(selectionRect.y1, selectionRect.y2);
    const maxY = Math.max(selectionRect.y1, selectionRect.y2);

    // Only select if the rect is meaningful (not just a click)
    if (maxX - minX > 1 || maxY - minY > 1) {
      const newMarkers = new Set();
      for (const m of markers) {
        if (m.x >= minX && m.x <= maxX && m.y >= minY && m.y <= maxY) {
          newMarkers.add(m.id);
        }
      }
      const newTeams = new Set();
      for (const t of teams) {
        if (t.x !== null && t.x >= minX && t.x <= maxX && t.y >= minY && t.y <= maxY) {
          newTeams.add(t.id);
        }
      }
      setSelectedMarkers(newMarkers);
      setSelectedTeams(newTeams);
    }

    selectionStart.current = null;
    setSelectionRect(null);
  }, [selectionRect, markers, teams]);

  // Group drag handlers — called by tokens
  const handleGroupDragStart = useCallback(() => {
    const snaps = [];
    for (const id of selectedMarkers) {
      const m = markers.find(mk => mk.id === id);
      if (m) snaps.push({ type: 'marker', id, x: m.x, y: m.y });
    }
    for (const id of selectedTeams) {
      const t = teams.find(tk => tk.id === id);
      if (t && t.x !== null) snaps.push({ type: 'team', id, x: t.x, y: t.y });
    }
    groupSnapshots.current = snaps;
  }, [selectedMarkers, selectedTeams, markers, teams]);

  const handleGroupDragMove = useCallback((deltaX, deltaY) => {
    if (!groupSnapshots.current) return;
    for (const snap of groupSnapshots.current) {
      const newX = Math.max(0, Math.min(100, snap.x + deltaX));
      const newY = Math.max(0, Math.min(100, snap.y + deltaY));
      if (snap.type === 'marker') onMoveMarker(snap.id, newX, newY);
      else onMoveTeam(snap.id, newX, newY);
    }
  }, [onMoveMarker, onMoveTeam]);

  const handleGroupDragEnd = useCallback(() => {
    groupSnapshots.current = null;
  }, []);

  // Drag-and-drop from panel
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const pos = getPercentPos(e.clientX, e.clientY);

    const teamId = e.dataTransfer.getData('application/team-id');
    if (teamId) {
      onPlaceTeam(teamId, pos.x, pos.y);
      return;
    }

    const markerType = e.dataTransfer.getData('application/marker-type');
    if (markerType) {
      onPlaceMarker(markerType, pos.x, pos.y);
    }
  }, [getPercentPos, onPlaceTeam, onPlaceMarker]);

  const placedTeams = teams.filter(t => t.x !== null && t.y !== null);

  // Selection rect visual coords
  const rectStyle = selectionRect ? {
    left: `${Math.min(selectionRect.x1, selectionRect.x2)}%`,
    top: `${Math.min(selectionRect.y1, selectionRect.y2)}%`,
    width: `${Math.abs(selectionRect.x2 - selectionRect.x1)}%`,
    height: `${Math.abs(selectionRect.y2 - selectionRect.y1)}%`,
  } : null;

  return (
    <div
      ref={containerRef}
      data-workspace
      className="relative flex-1 bg-[var(--color-bg-base)] select-none"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPointerDown={handleWorkspacePointerDown}
      onPointerMove={handleWorkspacePointerMove}
      onPointerUp={handleWorkspacePointerUp}
      onPointerCancel={handleWorkspacePointerUp}
    >
      {/* Map image */}
      <img
        src={mapImage}
        alt="War map"
        className="absolute inset-0 w-full h-full object-contain z-0"
        onLoad={() => setMapLoaded(true)}
        draggable={false}
      />

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="text-sm text-[var(--color-text-muted)]">Loading map...</div>
        </div>
      )}

      {/* Drawing canvas */}
      <MapCanvas
        mode={mode}
        shapeType={shapeType}
        penColor={penColor}
        penSize={penSize}
        strokes={strokes}
        currentStroke={currentStroke}
        onBeginStroke={onBeginStroke}
        onContinueStroke={onContinueStroke}
        onEndStroke={onEndStroke}
        containerSize={containerSize}
        timedDrawing={timedDrawing}
        onExpireStrokes={onExpireStrokes}
      />

      {/* Selection rectangle */}
      {selectionRect && rectStyle && (
        <div
          className="absolute z-30 border-2 border-cyan-400 bg-cyan-400/10 pointer-events-none"
          style={rectStyle}
        />
      )}

      {/* Text input */}
      {textInput && (
        <div
          className="absolute z-40"
          style={{ left: `${textInput.x}%`, top: `${textInput.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <input
            autoFocus
            type="text"
            placeholder="Type text..."
            className="px-2 py-1 text-sm rounded-md border border-cyan-500 bg-black/80 text-white focus:outline-none min-w-[120px]"
            style={{ color: penColor }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                onPlaceMarker('text', textInput.x, textInput.y, { text: e.target.value.trim(), color: penColor, fontSize: 14 });
                setTextInput(null);
                onModeChange('select');
              }
              if (e.key === 'Escape') { setTextInput(null); onModeChange('select'); }
            }}
            onBlur={(e) => {
              if (e.target.value.trim()) {
                onPlaceMarker('text', textInput.x, textInput.y, { text: e.target.value.trim(), color: penColor, fontSize: 14 });
              }
              setTextInput(null);
              onModeChange('select');
            }}
          />
        </div>
      )}

      {/* Placed team tokens */}
      {placedTeams.map(team => (
        <PlacedTeamToken
          key={team.id}
          team={team}
          mode={mode}
          selected={selectedTeams.has(team.id)}
          onMove={onMoveTeam}
          onRemoveFromMap={onRemoveTeamFromMap}
          onGroupDragStart={handleGroupDragStart}
          onGroupDragMove={handleGroupDragMove}
          onGroupDragEnd={handleGroupDragEnd}
        />
      ))}

      {/* Placed marker tokens */}
      {markers.map(marker => (
        <PlacedMarkerToken
          key={marker.id}
          marker={marker}
          mode={mode}
          selected={selectedMarkers.has(marker.id)}
          onMove={onMoveMarker}
          onRemove={onRemoveMarker}
          onResizeText={onUpdateMarkerFontSize}
          onGroupDragStart={handleGroupDragStart}
          onGroupDragMove={handleGroupDragMove}
          onGroupDragEnd={handleGroupDragEnd}
        />
      ))}

      {/* Individual placed player tokens (not in any team) */}
      {Object.entries(placedPlayers).map(([name, data]) => (
        <PlacedPlayerToken
          key={name}
          name={name}
          x={data.x}
          y={data.y}
          teamColor={null}
          mode={mode}
          onMove={onMovePlayer}
          onRemove={onRemovePlayer}
        />
      ))}
    </div>
  );
}
