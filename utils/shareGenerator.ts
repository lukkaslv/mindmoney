
import { AnalysisResult, Translations } from '../types';

// Helper to wrap text on Canvas
const wrapText = (
  ctx: CanvasRenderingContext2D, 
  text: string, 
  x: number, 
  y: number, 
  maxWidth: number, 
  lineHeight: number
): number => {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
};

export const generateShareImage = async (
  result: AnalysisResult, 
  t: Translations
): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Instagram Story Resolution
  canvas.width = 1080;
  canvas.height = 1920;

  const archetype = t.archetypes[result.archetypeKey];
  const verdict = t.verdicts[result.verdictKey];

  // 1. Background (Deep Premium Gradient)
  const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
  gradient.addColorStop(0, '#020617'); // slate-950
  gradient.addColorStop(0.5, '#0f172a'); // slate-900
  gradient.addColorStop(1, '#1e1b4b'); // indigo-950
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1920);

  // 2. Mesh Grid (Subtle Background Detail)
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
  ctx.lineWidth = 1;
  for(let i=0; i<canvas.width; i+=120) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
  }
  for(let j=0; j<canvas.height; j+=120) {
    ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
  }

  // 3. Header
  ctx.fillStyle = '#6366f1'; 
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GENESIS OS // PERSONAL BLUEPRINT', 540, 100);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 64px sans-serif';
  ctx.fillText('LUKA SULAVA', 540, 190);
  ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
  ctx.font = 'bold 30px monospace';
  ctx.fillText('@thndrrr', 540, 240);

  // 4. Archetype Box
  const boxX = 80, boxY = 300, boxW = 920, boxH = 550;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 80);
  ctx.fill();
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 80px sans-serif';
  ctx.fillText(archetype.title.toUpperCase(), 540, boxY + 120);
  
  // Quote (Wrapped)
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'italic 34px serif';
  wrapText(ctx, `"${archetype.quote}"`, 540, boxY + 220, 800, 45);

  // Description (Wrapped)
  ctx.font = '300 28px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  wrapText(ctx, archetype.desc, 540, boxY + 380, 820, 38);

  // 5. Metrics Section
  const startY = 920;
  const metrics = [
    { label: t.results.integrity, value: result.integrity, color: '#10b981' },
    { label: t.results.neuro_sync, value: result.neuroSync, color: '#6366f1' },
    { label: t.results.capacity, value: result.capacity, color: '#f59e0b' },
    { label: t.results.entropy, value: result.entropyScore, color: '#ef4444' }
  ];

  metrics.forEach((m, i) => {
    const yPos = startY + (i * 180);
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(m.label.toUpperCase(), 120, yPos);
    
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${m.value}%`, 960, yPos);
    
    // Progress Bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(120, yPos + 35, 840, 25);
    ctx.fillStyle = m.color;
    ctx.fillRect(120, yPos + 35, 840 * (m.value/100), 25);
  });

  // 6. Verdict Banner
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(0, 1600, 1080, 240);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '900 50px sans-serif';
  ctx.fillText(verdict.label.toUpperCase(), 540, 1710);
  ctx.font = 'bold 28px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('IDENTIFIER: ' + result.status, 540, 1770);

  // 7. Call to Action
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px monospace';
  ctx.fillText('T.ME/thndrrr // START YOUR JOURNEY', 540, 1900);

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
};