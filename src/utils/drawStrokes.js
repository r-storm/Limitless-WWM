export function drawFreehandStroke(ctx, stroke, scaleX, scaleY) {
  const points = stroke.points;
  if (!points || points.length < 2) return;
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0].x * scaleX, points[0].y * scaleY);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x * scaleX, points[i].y * scaleY);
  }
  ctx.stroke();
}

export function drawArrowStroke(ctx, stroke, scaleX, scaleY) {
  const start = stroke.start || stroke.points?.[0];
  const end = stroke.end || stroke.points?.[stroke.points.length - 1];
  if (!start || !end) return;

  const sx = start.x * scaleX;
  const sy = start.y * scaleY;
  const ex = end.x * scaleX;
  const ey = end.y * scaleY;

  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw line
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  // Draw arrowhead
  const angle = Math.atan2(ey - sy, ex - sx);
  const headLen = Math.max(12, stroke.size * 4);

  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - headLen * Math.cos(angle - Math.PI / 6), ey - headLen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - headLen * Math.cos(angle + Math.PI / 6), ey - headLen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
}

export function drawShapeStroke(ctx, stroke, scaleX, scaleY) {
  const start = stroke.start || stroke.points?.[0];
  const end = stroke.end || stroke.points?.[stroke.points.length - 1];
  if (!start) return;

  const sx = start.x * scaleX;
  const sy = start.y * scaleY;
  const ex = (end || start).x * scaleX;
  const ey = (end || start).y * scaleY;

  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (stroke.shape) {
    case 'dot': {
      ctx.beginPath();
      ctx.arc(sx, sy, stroke.size * 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'circle': {
      const radius = Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2);
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'square': {
      const side = Math.max(Math.abs(ex - sx), Math.abs(ey - sy));
      const signX = ex >= sx ? 1 : -1;
      const signY = ey >= sy ? 1 : -1;
      ctx.strokeRect(sx, sy, side * signX, side * signY);
      break;
    }
    case 'rectangle': {
      ctx.strokeRect(sx, sy, ex - sx, ey - sy);
      break;
    }
    case 'triangle': {
      const midX = (sx + ex) / 2;
      ctx.beginPath();
      ctx.moveTo(midX, Math.min(sy, ey));
      ctx.lineTo(Math.min(sx, ex), Math.max(sy, ey));
      ctx.lineTo(Math.max(sx, ex), Math.max(sy, ey));
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'line': {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      break;
    }
  }
}

export function drawStroke(ctx, stroke, scaleX, scaleY) {
  if (!stroke) return;
  if (stroke.type === 'arrow') {
    drawArrowStroke(ctx, stroke, scaleX, scaleY);
  } else if (stroke.type === 'shape') {
    drawShapeStroke(ctx, stroke, scaleX, scaleY);
  } else {
    drawFreehandStroke(ctx, stroke, scaleX, scaleY);
  }
}
