import { useState, useCallback, useEffect, useRef } from 'react';

const TEAM_COLOR_PRESETS = [
  { color: '#3B82F6', name: 'Blue Team' },
  { color: '#EF4444', name: 'Red Team' },
  { color: '#22C55E', name: 'Green Team' },
  { color: '#F59E0B', name: 'Gold Team' },
  { color: '#A855F7', name: 'Purple Team' },
  { color: '#06B6D4', name: 'Cyan Team' },
];

export { TEAM_COLOR_PRESETS };

const STORAGE_KEY = 'planner-state';

function makeEmptyCanvas(id, name) {
  return { id, name, teams: [], markers: [], strokes: [], placedPlayers: {}, redoStack: [] };
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // New format (version 2)
    if (parsed.version === 2) {
      return {
        version: 2,
        activeCanvasIndex: parsed.activeCanvasIndex || 0,
        canvases: parsed.canvases.map(c => ({
          ...c,
          teams: c.teams || [],
          markers: c.markers || [],
          strokes: c.strokes || [],
          placedPlayers: c.placedPlayers || {},
          redoStack: [],
        })),
      };
    }

    // Old format — migrate
    const teams = parsed.teams || [];
    const strokes = parsed.strokes || [];
    return {
      version: 2,
      activeCanvasIndex: 0,
      canvases: [{
        id: 'canvas-1',
        name: 'Strategy 1',
        teams,
        strokes,
        placedPlayers: {},
        redoStack: [],
      }],
    };
  } catch {
    return null;
  }
}

let teamIdCounter = 0;

function initTeamIdCounter(canvases) {
  let max = 0;
  for (const c of canvases) {
    for (const t of c.teams) {
      const num = parseInt(t.id.split('-')[1]);
      if (num > max) max = num;
    }
  }
  teamIdCounter = max + 1;
}

let markerIdCounter = 0;

function initMarkerIdCounter(canvases) {
  let max = 0;
  for (const c of canvases) {
    for (const m of (c.markers || [])) {
      const num = parseInt(m.id.split('-')[1]);
      if (num > max) max = num;
    }
  }
  markerIdCounter = max + 1;
}

let canvasIdCounter = 0;

function initCanvasIdCounter(canvases) {
  let max = 0;
  for (const c of canvases) {
    const num = parseInt(c.id.split('-')[1]);
    if (num > max) max = num;
  }
  canvasIdCounter = max;
}

export default function usePlannerState() {
  const [mode, setMode] = useState('select');
  const [shapeType, setShapeType] = useState('circle');
  const [penColor, setPenColor] = useState('#ffffff');
  const [penSize, setPenSize] = useState(3);

  const [canvases, setCanvases] = useState(() => {
    const saved = loadSavedState();
    if (saved) {
      initTeamIdCounter(saved.canvases);
      initMarkerIdCounter(saved.canvases);
      initCanvasIdCounter(saved.canvases);
      return saved.canvases;
    }
    canvasIdCounter = 1;
    return [makeEmptyCanvas('canvas-1', 'Strategy 1')];
  });

  const [activeCanvasIndex, setActiveCanvasIndex] = useState(() => {
    const saved = loadSavedState();
    return saved ? Math.min(saved.activeCanvasIndex, (saved.canvases || []).length - 1) : 0;
  });

  // Derive active canvas values
  const activeCanvas = canvases[activeCanvasIndex] || canvases[0];
  const teams = activeCanvas.teams;
  const markers = activeCanvas.markers || [];
  const strokes = activeCanvas.strokes;
  const placedPlayers = activeCanvas.placedPlayers;
  const redoStack = activeCanvas.redoStack;

  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;
  const redoRef = useRef(redoStack);
  redoRef.current = redoStack;

  const [currentStroke, setCurrentStroke] = useState(null);
  const currentStrokeRef = useRef(null);
  const [timedDrawing, setTimedDrawing] = useState(false);

  // Helper to update only the active canvas
  const updateActiveCanvas = useCallback((updater) => {
    setCanvases(prev => prev.map((c, i) => i === activeCanvasIndex ? updater(c) : c));
  }, [activeCanvasIndex]);

  // --- Canvas management actions ---

  const addCanvas = useCallback(() => {
    setCanvases(prev => {
      if (prev.length >= 10) return prev;
      const id = `canvas-${++canvasIdCounter}`;
      const name = `Strategy ${prev.length + 1}`;
      const next = [...prev, makeEmptyCanvas(id, name)];
      setActiveCanvasIndex(next.length - 1);
      return next;
    });
  }, []);

  const removeCanvas = useCallback((index) => {
    setCanvases(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== index);
      setActiveCanvasIndex(ai => {
        if (ai >= next.length) return next.length - 1;
        if (ai > index) return ai - 1;
        return ai;
      });
      return next;
    });
  }, []);

  const switchCanvas = useCallback((index) => {
    setActiveCanvasIndex(index);
    currentStrokeRef.current = null;
    setCurrentStroke(null);
  }, []);

  const renameCanvas = useCallback((index, name) => {
    setCanvases(prev => prev.map((c, i) => i === index ? { ...c, name } : c));
  }, []);

  // Debounced localStorage save
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          version: 2,
          activeCanvasIndex,
          canvases: canvases.map(c => ({
            id: c.id,
            name: c.name,
            teams: c.teams,
            markers: c.markers || [],
            strokes: c.strokes.filter(s => !s.createdAt),
            placedPlayers: c.placedPlayers,
          })),
        }));
      } catch {
        // Storage full or unavailable
      }
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [canvases, activeCanvasIndex]);

  // --- Individual player actions ---

  const placePlayer = useCallback((name, x, y) => {
    updateActiveCanvas(c => ({ ...c, placedPlayers: { ...c.placedPlayers, [name]: { x, y } } }));
  }, [updateActiveCanvas]);

  const movePlayer = useCallback((name, x, y) => {
    updateActiveCanvas(c => {
      if (!c.placedPlayers[name]) return c;
      return { ...c, placedPlayers: { ...c.placedPlayers, [name]: { ...c.placedPlayers[name], x, y } } };
    });
  }, [updateActiveCanvas]);

  const removePlayer = useCallback((name) => {
    updateActiveCanvas(c => {
      const next = { ...c.placedPlayers };
      delete next[name];
      return { ...c, placedPlayers: next };
    });
  }, [updateActiveCanvas]);

  // --- Team actions ---

  const addTeam = useCallback(() => {
    updateActiveCanvas(c => {
      if (c.teams.length >= 6) return c;
      const usedColors = new Set(c.teams.map(t => t.color));
      const preset = TEAM_COLOR_PRESETS.find(p => !usedColors.has(p.color)) || TEAM_COLOR_PRESETS[0];
      return { ...c, teams: [...c.teams, {
        id: `team-${++teamIdCounter}`,
        name: preset.name,
        color: preset.color,
        members: [],
        x: null,
        y: null,
      }] };
    });
  }, [updateActiveCanvas]);

  const removeTeam = useCallback((teamId) => {
    updateActiveCanvas(c => ({ ...c, teams: c.teams.filter(t => t.id !== teamId) }));
  }, [updateActiveCanvas]);

  const renameTeam = useCallback((teamId, newName) => {
    updateActiveCanvas(c => ({ ...c, teams: c.teams.map(t => t.id === teamId ? { ...t, name: newName } : t) }));
  }, [updateActiveCanvas]);

  const changeTeamColor = useCallback((teamId, newColor) => {
    updateActiveCanvas(c => ({ ...c, teams: c.teams.map(t => t.id === teamId ? { ...t, color: newColor } : t) }));
  }, [updateActiveCanvas]);

  const placeTeam = useCallback((teamId, x, y) => {
    updateActiveCanvas(c => ({ ...c, teams: c.teams.map(t => t.id === teamId ? { ...t, x, y } : t) }));
  }, [updateActiveCanvas]);

  const moveTeam = useCallback((teamId, x, y) => {
    updateActiveCanvas(c => ({ ...c, teams: c.teams.map(t => t.id === teamId ? { ...t, x, y } : t) }));
  }, [updateActiveCanvas]);

  const removeTeamFromMap = useCallback((teamId) => {
    updateActiveCanvas(c => ({ ...c, teams: c.teams.map(t => t.id === teamId ? { ...t, x: null, y: null } : t) }));
  }, [updateActiveCanvas]);

  // --- Marker actions ---

  const placeMarker = useCallback((type, x, y, extra) => {
    updateActiveCanvas(c => ({
      ...c,
      markers: [...(c.markers || []), { id: `marker-${markerIdCounter++}`, type, x, y, ...extra }],
    }));
  }, [updateActiveCanvas]);

  const updateMarkerText = useCallback((markerId, text) => {
    updateActiveCanvas(c => ({
      ...c,
      markers: (c.markers || []).map(m => m.id === markerId ? { ...m, text } : m),
    }));
  }, [updateActiveCanvas]);

  const updateMarkerFontSize = useCallback((markerId, fontSize) => {
    updateActiveCanvas(c => ({
      ...c,
      markers: (c.markers || []).map(m => m.id === markerId ? { ...m, fontSize } : m),
    }));
  }, [updateActiveCanvas]);

  const moveMarker = useCallback((markerId, x, y) => {
    updateActiveCanvas(c => ({
      ...c,
      markers: (c.markers || []).map(m => m.id === markerId ? { ...m, x, y } : m),
    }));
  }, [updateActiveCanvas]);

  const removeMarker = useCallback((markerId) => {
    updateActiveCanvas(c => ({
      ...c,
      markers: (c.markers || []).filter(m => m.id !== markerId),
    }));
  }, [updateActiveCanvas]);

  const addPlayerToTeam = useCallback((playerName, teamId) => {
    updateActiveCanvas(c => {
      // Remove from placedPlayers
      let nextPlaced = c.placedPlayers;
      if (c.placedPlayers[playerName]) {
        nextPlaced = { ...c.placedPlayers };
        delete nextPlaced[playerName];
      }
      // Update teams
      const nextTeams = c.teams.map(t => {
        if (t.id === teamId) {
          if (t.members.includes(playerName)) return t;
          return { ...t, members: [...t.members, playerName] };
        }
        if (t.members.includes(playerName)) {
          return { ...t, members: t.members.filter(m => m !== playerName) };
        }
        return t;
      });
      return { ...c, placedPlayers: nextPlaced, teams: nextTeams };
    });
  }, [updateActiveCanvas]);

  const removePlayerFromTeam = useCallback((playerName, teamId) => {
    updateActiveCanvas(c => ({
      ...c,
      teams: c.teams.map(t => {
        if (t.id === teamId) {
          return { ...t, members: t.members.filter(m => m !== playerName) };
        }
        return t;
      }),
    }));
  }, [updateActiveCanvas]);

  const addPlayersToTeam = useCallback((playerNames, teamId) => {
    updateActiveCanvas(c => {
      // Remove from placedPlayers
      const nextPlaced = { ...c.placedPlayers };
      let changed = false;
      for (const name of playerNames) {
        if (nextPlaced[name]) { delete nextPlaced[name]; changed = true; }
      }
      // Update teams
      const nextTeams = c.teams.map(t => {
        if (t.id === teamId) {
          const newMembers = playerNames.filter(n => !t.members.includes(n));
          if (newMembers.length === 0) return t;
          return { ...t, members: [...t.members, ...newMembers] };
        }
        const filtered = t.members.filter(m => !playerNames.includes(m));
        return filtered.length !== t.members.length ? { ...t, members: filtered } : t;
      });
      return { ...c, placedPlayers: changed ? nextPlaced : c.placedPlayers, teams: nextTeams };
    });
  }, [updateActiveCanvas]);

  // --- Drawing actions ---

  const beginStroke = useCallback((x, y, color, size, type, shape) => {
    const strokeData = { type: type || 'freehand', points: [{ x, y }], color, size };
    if (type === 'shape') strokeData.shape = shape;
    currentStrokeRef.current = strokeData;
    setCurrentStroke(strokeData);
  }, []);

  const continueStroke = useCallback((x, y) => {
    setCurrentStroke(prev => {
      if (!prev) return prev;
      const next = { ...prev, points: [...prev.points, { x, y }] };
      currentStrokeRef.current = next;
      return next;
    });
  }, []);

  const endStroke = useCallback(() => {
    const prev = currentStrokeRef.current;
    currentStrokeRef.current = null;
    setCurrentStroke(null);

    if (!prev) return;
    const hasMultiplePoints = prev.points.length > 1;
    const isDot = prev.type === 'shape' && prev.shape === 'dot';

    if (hasMultiplePoints || isDot) {
      let finished;
      if (prev.type === 'shape') {
        finished = {
          type: 'shape',
          shape: prev.shape,
          start: prev.points[0],
          end: prev.points[prev.points.length - 1],
          color: prev.color,
          size: prev.size,
        };
      } else if (prev.type === 'arrow') {
        finished = {
          type: 'arrow',
          start: prev.points[0],
          end: prev.points[prev.points.length - 1],
          color: prev.color,
          size: prev.size,
        };
      } else {
        finished = { type: 'freehand', points: prev.points, color: prev.color, size: prev.size };
      }
      if (timedDrawing) finished.createdAt = Date.now();
      updateActiveCanvas(c => ({ ...c, redoStack: [], strokes: [...c.strokes, finished] }));
    }
  }, [timedDrawing, updateActiveCanvas]);

  const undoStroke = useCallback(() => {
    const current = strokesRef.current;
    if (current.length === 0) return;
    const removed = current[current.length - 1];
    updateActiveCanvas(c => ({
      ...c,
      strokes: c.strokes.slice(0, -1),
      redoStack: [...c.redoStack, removed],
    }));
  }, [updateActiveCanvas]);

  const redoStroke = useCallback(() => {
    const current = redoRef.current;
    if (current.length === 0) return;
    const stroke = current[current.length - 1];
    updateActiveCanvas(c => ({
      ...c,
      redoStack: c.redoStack.slice(0, -1),
      strokes: [...c.strokes, stroke],
    }));
  }, [updateActiveCanvas]);

  const expireStrokes = useCallback(() => {
    updateActiveCanvas(c => {
      const now = Date.now();
      const next = c.strokes.filter(s => !s.createdAt || now - s.createdAt <= 10000);
      return next.length === c.strokes.length ? c : { ...c, strokes: next };
    });
  }, [updateActiveCanvas]);

  const clearDrawing = useCallback(() => {
    updateActiveCanvas(c => ({ ...c, redoStack: [], strokes: [] }));
    setCurrentStroke(null);
  }, [updateActiveCanvas]);

  return {
    mode, setMode,
    shapeType, setShapeType,
    penColor, setPenColor,
    penSize, setPenSize,
    placedPlayers,
    teams,
    strokes,
    currentStroke,
    placePlayer, movePlayer, removePlayer,
    addTeam, removeTeam, renameTeam, changeTeamColor,
    placeTeam, moveTeam, removeTeamFromMap,
    markers, placeMarker, moveMarker, removeMarker, updateMarkerText, updateMarkerFontSize,
    addPlayerToTeam, removePlayerFromTeam, addPlayersToTeam,
    timedDrawing, setTimedDrawing,
    beginStroke, continueStroke, endStroke,
    redoStack,
    undoStroke, redoStroke, clearDrawing, expireStrokes,
    // Canvas management
    canvases,
    activeCanvasIndex,
    addCanvas, removeCanvas, switchCanvas, renameCanvas,
  };
}
