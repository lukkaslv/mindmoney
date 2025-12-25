
import { AnalysisResult, Translations } from '../types';

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

  // 1. Background (Dark Gradient)
  const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
  gradient.addColorStop(0, '#020617'); // slate-950
  gradient.addColorStop(1, '#1e1b4b'); // indigo-950
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1920);

  // 2. Neural Grid
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
  ctx.lineWidth = 1;
  for(let i=0; i<1080; i+=100) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1920); ctx.stroke();
  }
  for(let j=0; j<1920; j+=100) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(1080, j); ctx.stroke();
  }

  // 3. Header
  ctx.fillStyle = '#6366f1'; 
  ctx.font = 'bold 30px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GENESIS OS v6 // BEHAVIORAL LAB', 540, 100);
  
  // BRANDING: PSYCHOLOGIST LUKA SULAVA
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 45px sans-serif';
  ctx.fillText('LUKA SULAVA', 540, 170);
  ctx.fillStyle = 'rgba(99, 102, 241, 0.6)';
  ctx.font = 'bold 25px monospace';
  ctx.fillText('@thndrrr', 540, 210);

  // 4. Archetype Badge
  ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
  ctx.beginPath();
  ctx.roundRect(100, 280, 880, 480, 60);
  ctx.fill();
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 90px sans-serif';
  ctx.fillText(archetype.title.toUpperCase(), 540, 460);
  
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'italic 32px serif';
  const quoteWords = archetype.quote.split(' ');
  let line = '';
  let y = 560;
  for(let word of quoteWords) {
      if ((line + word).length > 35) {
          ctx.fillText(line, 540, y);
          line = word + ' ';
          y += 50;
      } else {
          line += word + ' ';
      }
  }
  ctx.fillText(line, 540, y);

  // 5. Metrics
  const startY = 880;
  const metrics = [
    { label: 'Integrity', value: result.integrity, color: '#10b981' },
    { label: 'Neural Sync', value: result.neuroSync, color: '#6366f1' },
    { label: 'Capacity', value: result.capacity, color: '#f59e0b' },
    { label: 'Entropy', value: result.entropyScore, color: '#ef4444' }
  ];

  metrics.forEach((m, i) => {
    const yPos = startY + (i * 170);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 35px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(m.label.toUpperCase(), 140, yPos);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${m.value}%`, 940, yPos);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(140, yPos + 30, 800, 20);
    ctx.fillStyle = m.color;
    ctx.fillRect(140, yPos + 30, 800 * (m.value/100), 20);
  });

  // 6. Verdict Banner
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(0, 1560, 1080, 220);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 50px sans-serif';
  ctx.fillText(verdict.label.toUpperCase(), 540, 1660);
  ctx.font = '30px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('ANOMALY_CODE: ' + result.status, 540, 1710);

  // 7. QR CODE PLACEHOLDER & CTA
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 35px monospace';
  ctx.fillText('JOIN THE MISSION AT T.ME/thndrrr', 540, 1880);

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
};
