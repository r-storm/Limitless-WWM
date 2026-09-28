import { useRef, useEffect, useCallback } from 'react';
import classNames from '../../utils/classNames';
import { drawStroke } from '../../utils/drawStrokes';

export default function MapCanvas({
  mode,
  shapeType,
  penColor,
  penSize,
  strokes,
  currentStroke,
  onBeginStroke,
  onContinueStroke,
  onEndStroke,
  containerSize,
  onExpireStrokes,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const isDrawing = mode === 'draw' || mode === 'arrow' || mode === 'shape';

  const hasTimedStrokes = strokes.some(s => s.createdAt);

  // Animated redraw loop for timed strokes
  useEffect(() => {
    if (!hasTimedStrokes) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    function tick() {
      const canvas = canvasRef.current;
      if (!canvas || !containerSize) return;
      canvas.width = containerSize.width;
      canvas.height = containerSize.height;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scaleX = containerSize.width / 100;
      const scaleY = containerSize.height / 100;
      const now = Date.now();

      for (const stroke of strokes) {
        if (stroke.createdAt) {
          const elapsed = now - stroke.createdAt;
          ctx.globalAlpha = Math.max(0, (10000 - elapsed) / 10000);
        } else {
          ctx.globalAlpha = 1.0;
        }
        drawStroke(ctx, stroke, scaleX, scaleY);
      }
      ctx.globalAlpha = 1.0;
      if (currentStroke) {
        drawStroke(ctx, currentStroke, scaleX, scaleY);
      }

      onExpireStrokes();
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [hasTimedStrokes, strokes, currentStroke, containerSize, onExpireStrokes]);

  // Static redraw when no timed strokes
  useEffect(() => {
    if (hasTimedStrokes) return;
    const canvas = canvasRef.current;
    if (!canvas || !containerSize) return;
    canvas.width = containerSize.width;
    canvas.height = containerSize.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = containerSize.width / 100;
    const scaleY = containerSize.height / 100;

    for (const stroke of strokes) {
      drawStroke(ctx, stroke, scaleX, scaleY);
    }
    if (currentStroke) {
      drawStroke(ctx, currentStroke, scaleX, scaleY);
    }
  }, [hasTimedStrokes, strokes, currentStroke, containerSize]);

  const getPercentPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const handlePointerDown = useCallback((e) => {
    if (!isDrawing) return;
    e.preventDefault();
    e.target.setPointerCapture(e.pointerId);
    const pos = getPercentPos(e);
    if (mode === 'shape') {
      onBeginStroke(pos.x, pos.y, penColor, penSize, 'shape', shapeType);
      if (shapeType === 'dot') {
        onEndStroke();
      }
    } else {
      onBeginStroke(pos.x, pos.y, penColor, penSize, mode);
    }
  }, [isDrawing, getPercentPos, onBeginStroke, onEndStroke, penColor, penSize, mode, shapeType]);

  const handlePointerMove = useCallback((e) => {
    if (!isDrawing || !currentStroke) return;
    e.preventDefault();
    const pos = getPercentPos(e);
    onContinueStroke(pos.x, pos.y);
  }, [isDrawing, currentStroke, getPercentPos, onContinueStroke]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawing) return;
    onEndStroke();
  }, [isDrawing, onEndStroke]);

  return (
    <canvas
      ref={canvasRef}
      className={classNames(
        'absolute inset-0 w-full h-full',
        isDrawing ? 'z-30 cursor-crosshair' : 'z-10 pointer-events-none',
      )}
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
}
