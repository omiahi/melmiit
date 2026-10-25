/**
 * A Mongol ger (yurt) in silhouette: lattice walls, a shallow conical roof
 * rising to the toono (crown), a lit doorway and smoke from the stove pipe.
 */

export interface GerOptions {
  fill: string;
  /** warm light in the doorway, 0 (dark) to 1 */
  glow?: number;
  /** seconds, for the drifting smoke */
  t?: number;
  smoke?: boolean;
  /** pale felt bands (büslüür) around the wall */
  bands?: string;
  /** puff sprite for smoke, drawn once by the caller */
  puff?: HTMLCanvasElement;
}

/**
 * @param x centre of the ger
 * @param groundY where the walls meet the ground
 * @param w width of the ger
 */
export function drawGer(ctx: CanvasRenderingContext2D, x: number, groundY: number, w: number, o: GerOptions) {
  const half = w / 2;
  const wallH = w * 0.3;
  const rise = w * 0.25;
  const eave = w * 0.035; // roof overhangs the wall slightly
  const roofTop = groundY - wallH - rise;
  const crownHalf = w * 0.075;
  const wallTop = groundY - wallH;

  ctx.save();

  // warm pool of light on the ground in front of the door
  if (o.glow) {
    const g = ctx.createRadialGradient(x, groundY, 0, x, groundY, w * 0.9);
    g.addColorStop(0, `rgba(240,190,110,${0.28 * o.glow})`);
    g.addColorStop(1, 'rgba(240,190,110,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - w, groundY - w * 0.5, w * 2, w * 0.7);
  }

  ctx.fillStyle = o.fill;
  ctx.beginPath();
  // walls: very slightly flared at the base, as the lattice is
  ctx.moveTo(x - half, groundY);
  ctx.lineTo(x - half + w * 0.01, wallTop);
  // eave, then the roof up to the crown
  ctx.lineTo(x - half - eave, wallTop + w * 0.012);
  // the roof poles bow slightly outward, giving the felt a soft dome
  ctx.quadraticCurveTo(x - half * 0.62, wallTop - rise * 0.78, x - crownHalf, roofTop);
  ctx.lineTo(x + crownHalf, roofTop);
  ctx.quadraticCurveTo(x + half * 0.62, wallTop - rise * 0.78, x + half + eave, wallTop + w * 0.012);
  ctx.lineTo(x + half - w * 0.01, wallTop);
  ctx.lineTo(x + half, groundY);
  ctx.closePath();
  ctx.fill();

  // toono: the raised wooden crown
  ctx.fillRect(x - crownHalf * 0.8, roofTop - w * 0.018, crownHalf * 1.6, w * 0.022);

  // felt bands around the wall and roof
  if (o.bands) {
    ctx.strokeStyle = o.bands;
    ctx.lineWidth = Math.max(0.6, w * 0.012);
    for (const f of [0.3, 0.72]) {
      const y = wallTop + wallH * f;
      ctx.beginPath();
      ctx.moveTo(x - half + 1, y);
      ctx.quadraticCurveTo(x, y + w * 0.02, x + half - 1, y);
      ctx.stroke();
    }
    // ropes over the roof, drawn as faint lines from crown to eave
    ctx.lineWidth = Math.max(0.5, w * 0.008);
    for (const f of [-0.6, -0.25, 0.25, 0.6]) {
      ctx.beginPath();
      ctx.moveTo(x + f * crownHalf * 1.4, roofTop + w * 0.01);
      ctx.quadraticCurveTo(x + f * half * 0.7, wallTop - rise * 0.55, x + f * (half + eave * 0.5), wallTop + w * 0.004);
      ctx.stroke();
    }
  }

  // the door, facing south, lit from inside
  const dw = w * 0.15;
  const dh = wallH * 0.8;
  if (o.glow) {
    const dg = ctx.createLinearGradient(0, groundY - dh, 0, groundY);
    dg.addColorStop(0, `rgba(255,214,140,${0.75 * o.glow})`);
    dg.addColorStop(1, `rgba(232,150,70,${0.95 * o.glow})`);
    ctx.fillStyle = dg;
    ctx.shadowColor = `rgba(255,190,110,${0.8 * o.glow})`;
    ctx.shadowBlur = w * 0.25;
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
  }
  ctx.fillRect(x - dw / 2, groundY - dh, dw, dh);
  ctx.shadowBlur = 0;

  // stove pipe and smoke
  if (o.smoke) {
    const px = x + crownHalf * 0.3;
    ctx.fillStyle = o.fill;
    ctx.fillRect(px - w * 0.012, roofTop - w * 0.09, w * 0.024, w * 0.08);
    if (o.puff) {
      const t = o.t ?? 0;
      for (let i = 0; i < 7; i++) {
        const life = ((t * 0.18 + i / 7) % 1 + 1) % 1; // each puff rises and fades
        const sx = px + Math.sin(life * 3 + i) * w * 0.05 + life * w * 0.45;
        const sy = roofTop - w * 0.1 - life * w * 0.9;
        const r = w * (0.05 + life * 0.22);
        ctx.globalAlpha = (1 - life) * life * 0.5;
        ctx.drawImage(o.puff, sx - r, sy - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
    }
  }

  ctx.restore();
}
