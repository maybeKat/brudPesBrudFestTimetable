const fs = require('fs');

const PX_PER_MIN = 2;

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

const DAY1 = {
  dayNum: 1,
  scheduleDay: 13,
  startTime: '14:00',
  endTime: '22:00',
  stages: {
    'АНГАР': [
      { start: '14:00', end: '15:30', name: 'NATIVE OUTSIDER' },
      { start: '15:30', end: '16:30', name: 'SOMINARYST' },
      { start: '16:30', end: '17:10', name: 'СКАЛО (LIVE)' },
      { start: '17:10', end: '17:50', name: 'SPORTCAFÉ' },
      { start: '17:50', end: '18:40', name: 'ҐРУНТ ПАЛАЄ' },
      { start: '18:40', end: '19:20', name: 'BOANTHROPY' },
      { start: '19:20', end: '21:00', name: 'DJ MELL G' },
      { start: '21:00', end: '22:00', name: 'IVAN BIOS' },
    ],
    'ДВІР': [
      { start: '14:00', end: '15:30', name: 'KLIM' },
      { start: '15:30', end: '17:00', name: 'DARIALISM' },
      { start: '17:00', end: '18:00', name: 'DEYS RUDE QUARTET' },
      { start: '18:00', end: '19:20', name: 'HANNA b2b SHULTS.SASHAA' },
      { start: '19:20', end: '20:00', name: 'BERLINER DÖNER' },
      { start: '20:00', end: '21:00', name: 'ЗЛИПНІ' },
      { start: '21:00', end: '22:00', name: 'CRASHBOOMBANG' },
    ],
    'KELLER': [
      { start: '16:00', end: '17:00', name: 'DEMIAN FERIY (LIVE)' },
      { start: '17:00', end: '17:45', name: 'НЕВТОМА' },
      { start: '17:45', end: '18:30', name: 'ВИСТАВКА ДИСТОРШН' },
      { start: '18:30', end: '19:30', name: 'SYMONENKO (LIVE)' },
      { start: '19:30', end: '20:30', name: 'MAAT (LIVE)' },
      { start: '20:30', end: '22:00', name: 'JANE b2b BÉLLIS' },
    ],
  },
};

const DAY2 = {
  dayNum: 2,
  scheduleDay: 14,
  startTime: '15:00',
  endTime: '22:00',
  stages: {
    'АНГАР': [
      { start: '15:00', end: '16:40', name: 'NAST-X' },
      { start: '16:40', end: '17:20', name: 'ДІЛО ДРЯНЬ' },
      { start: '17:20', end: '18:00', name: 'FREQ.CRIME' },
      { start: '18:00', end: '19:00', name: 'ALEX SAVAGE' },
      { start: '19:00', end: '20:00', name: 'KNIVES' },
      { start: '20:00', end: '21:00', name: 'ДК ЕНЕРГЕТИК' },
      { start: '21:00', end: '22:00', name: 'VERA LOGDANIDI' },
    ],
    'ДВІР': [
      { start: '15:00', end: '16:00', name: 'ANNA SOLOVEI' },
      { start: '16:00', end: '17:00', name: 'BOGDAN ZAIETS (LIVE)' },
      { start: '17:00', end: '17:30', name: '4:21 KRU' },
      { start: '17:30', end: '19:00', name: 'OLES b2b MAKS YOS' },
      { start: '19:00', end: '20:00', name: 'HYPHEN DASH' },
      { start: '20:00', end: '21:00', name: 'VØVK' },
      { start: '21:00', end: '22:00', name: 'STARS AND MELLOW' },
    ],
    'KELLER': [
      { start: '15:00', end: '16:00', name: 'PARKING SPOT (LIVE)' },
      { start: '16:00', end: '17:00', name: 'OLEKSANDR YAVDYK' },
      { start: '17:00', end: '17:45', name: 'MARYANA KLOCHKO (LIVE)' },
      { start: '17:45', end: '18:30', name: 'XARAKTER' },
      { start: '18:30', end: '19:15', name: 'TYSK (LIVE)' },
      { start: '19:15', end: '20:45', name: 'TAQADDAM b2b BEY O BEY' },
      { start: '20:45', end: '22:00', name: 'CANTRUST b2b MONOTRONIQUE' },
    ],
  },
};

function generateHTML(day) {
  const { dayNum, scheduleDay, startTime, endTime, stages } = day;
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const totalMin = endMin - startMin;
  const totalHeight = totalMin * PX_PER_MIN;
  const stageNames = Object.keys(stages);

  // Time grid lines + labels (every 30 min)
  let timeLabels = '';
  let gridLines = '';
  for (let min = startMin; min <= endMin; min += 30) {
    const top = (min - startMin) * PX_PER_MIN;
    const label = minutesToTime(min);
    const isFirst = min === startMin;
    const transform = isFirst ? 'translateY(4px)' : 'translateY(-50%)';
    timeLabels += `<div class="time-label" style="top:${top}px;transform:${transform}">${label}</div>\n`;
  }

  // Stage columns with artist cards
  let stageColumnsHTML = '';
  const allActs = [];

  stageNames.forEach((stageName, stageIdx) => {
    const acts = stages[stageName];
    let cardsHTML = '';

    acts.forEach((act, actIdx) => {
      const actStart = timeToMinutes(act.start);
      const actEnd = timeToMinutes(act.end);
      const top = (actStart - startMin) * PX_PER_MIN;
      const height = (actEnd - actStart) * PX_PER_MIN;
      const id = `act-${stageIdx}-${actIdx}`;
      const durationMin = actEnd - actStart;
      const durationH = Math.floor(durationMin / 60);
      const durationM = durationMin % 60;
      const durationStr = durationH > 0
        ? (durationM > 0 ? `${durationH} год ${durationM} хв` : `${durationH} год`)
        : `${durationMin} хв`;

      allActs.push({ id, start: actStart, end: actEnd });

      const formattedName = act.name
        .replace(/ b2b /gi, '<br><span class="card-b2b">b2b</span><br>');

      cardsHTML += `<div class="artist-card" id="${id}" data-start="${actStart}" data-end="${actEnd}" style="top:${top}px;height:${height}px">
  <span class="card-time">${act.start}</span>
  <span class="card-name">${formattedName}</span>
  <span class="card-duration">${durationStr}</span>
</div>\n`;
    });

    stageColumnsHTML += `<div class="stage-column">${cardsHTML}</div>\n`;
  });

  const stageHeadersHTML = stageNames.map(n => `<div class="stage-header-wrap">
      <div class="stage-header-inner">
        <div class="stage-flames"><img src="photo-output.png" alt="🔥"></div>
        <div class="stage-header">${n}</div>
      </div>
    </div>`).join('\n');
  const actsJSON = JSON.stringify(allActs);

  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>Розклад день ${dayNum}</title>
  <style>
    @font-face {
      font-family: 'PP Pangram Sans';
      src: url('../2025/PPPangramSans-Semibold.otf') format('opentype');
      font-weight: 600;
    }
    @font-face {
      font-family: 'PP Pangram Sans';
      src: url('../2025/PPPangramSans-Bold.otf') format('opentype');
      font-weight: 700;
    }

    *, *::before, *::after { box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      background: #0a0a0a;
      color: #fff;
      font-family: 'PP Pangram Sans', Arial, sans-serif;
      overflow-x: hidden;
    }

    .schedule-wrapper {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    /* ── Day badge top bar ── */
    .day-bar {
      background: #f5d800;
      color: #000;
      font-weight: 700;
      text-align: center;
      font-size: clamp(0.7em, 3vw, 1em);
      padding: clamp(6px, 1.5vw, 10px) 12px;
      letter-spacing: 0.08em;
      flex-shrink: 0;
    }

    /* ── Header ── */
    .schedule-header {
      display: flex;
      flex-shrink: 0;
      background: #0a0a0a;
      position: sticky;
      top: 0;
      z-index: 20;
      padding: 8px 4px 0;
      gap: 4px;
    }

    .time-gutter-header {
      width: 52px;
      flex-shrink: 0;
    }

    .stage-header-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 0;
    }

    .stage-header-inner {
      display: inline-flex;
      flex-direction: column;
      align-items: stretch;
    }

    .stage-flames {
      line-height: 1;
      margin-bottom: -3px;
    }

    .stage-flames img {
      display: block;
      width: auto;
      height: 40px;
    }

    @media (max-width: 600px) {
      .stage-flames img {
        height: clamp(24px, 7vw, 40px);
      }
    }

    .stage-header {
      text-align: center;
      font-weight: 700;
      font-size: clamp(0.65em, 2.2vw, 0.95em);
      padding: 6px 8px;
      background: #222;
      color: #fff;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }

    .stage-header-wrap:nth-child(2) .stage-header {
      clip-path: polygon(0% 0%, 96% 0%, 100% 100%, 4% 100%);
    }
    .stage-header-wrap:nth-child(3) .stage-header {
      clip-path: polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%);
    }
    .stage-header-wrap:nth-child(4) .stage-header {
      clip-path: polygon(2% 0%, 98% 0%, 94% 100%, 6% 100%);
    }

    /* ── Scrollable body ── */
    .schedule-scroll {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .schedule-body {
      position: relative;
      display: flex;
      height: ${totalHeight}px;
      padding-top: 8px;
    }

    /* ── Time gutter ── */
    .time-gutter {
      width: 52px;
      flex-shrink: 0;
      position: relative;
    }

    .time-label {
      position: absolute;
      right: 6px;
      font-size: 0.7em;
      color: rgb(255, 167, 34);
      transform: translateY(-50%);
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      font-weight: 600;
    }

    .time-label.time-active {
      color: #fff;
      font-weight: 700;
    }

    /* ── Grid lines ── */
    .grid-lines {
      position: absolute;
      left: 52px;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;
    }

    .grid-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(255,136,25,0.15);
    }

    /* ── Stage columns ── */
    .stage-column {
      flex: 1;
      position: relative;
    }

    /* ── Artist cards ── */
    .artist-card {
      position: absolute;
      left: 3px;
      right: 3px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 4px;
      padding: 5px 7px;
      cursor: pointer;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 2px;
    }

    .artist-card:hover {
      background: rgba(255,255,255,0.1);
    }

    .artist-card.highlighted {
      background: rgba(255, 167, 34, 0.15);
      border-color: rgba(255, 167, 34, 0.5);
    }

    .artist-card.active {
      background: rgba(255, 167, 34, 0.25);
      border-color: rgb(255, 167, 34);
    }

    .card-time {
      font-size: clamp(0.55em, 2vw, 0.65em);
      color: rgb(255, 167, 34);
      font-weight: 600;
    }

    .card-name {
      font-size: clamp(0.6em, 2.6vw, 0.82em);
      font-weight: 700;
      line-height: 1.2;
      color: #fff;
      word-break: break-word;
      overflow-wrap: break-word;
      white-space: normal;
    }

    .card-b2b {
      font-size: 0.75em;
      color: rgb(255, 167, 34);
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .card-duration {
      font-size: 0.6em;
      color: rgba(255,255,255,0.35);
    }

    /* ── Current time line ── */
    .current-time-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background: rgb(255, 167, 34);
      z-index: 10;
      pointer-events: none;
    }

    .current-time-line::before {
      content: '';
      position: absolute;
      left: -4px;
      top: -4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgb(255, 167, 34);
    }
  </style>
</head>
<body>
  <div class="schedule-wrapper">
    <div class="day-bar">DAY ${dayNum} &nbsp;·&nbsp; ${scheduleDay} ЧЕРВНЯ</div>
    <div class="schedule-header">
      <div class="time-gutter-header"></div>
      ${stageHeadersHTML}
    </div>
    <div class="schedule-scroll" id="scroll">
      <div class="schedule-body">
        <div class="time-gutter">
          ${timeLabels}
        </div>
        <div class="grid-lines">
          ${gridLines}
        </div>
        ${stageColumnsHTML}
        <div class="current-time-line" id="current-time-line" style="display:none"></div>
      </div>
    </div>
  </div>

  <script>
    const timeZone = 'Europe/Kyiv';
    const scheduleDay = ${scheduleDay};
    const scheduleMonth = 6;
    const scheduleYear = 2026;
    const startMin = ${startMin};
    const pxPerMin = ${PX_PER_MIN};
    const allActs = ${actsJSON};

    const now = new Date(new Date().toLocaleString('en-US', { timeZone }));
    const isFestivalDay =
      now.getDate() === scheduleDay &&
      now.getMonth() + 1 === scheduleMonth &&
      now.getFullYear() === scheduleYear;

    function getCurrentMinutes() {
      const t = new Date(new Date().toLocaleString('en-US', { timeZone }));
      return t.getHours() * 60 + t.getMinutes();
    }

    function minutesToTop(min) {
      return (min - startMin) * pxPerMin;
    }

    function updateCurrentTimeLine() {
      const line = document.getElementById('current-time-line');
      const min = getCurrentMinutes();
      if (min < startMin || min > ${endMin}) {
        line.style.display = 'none';
        return;
      }
      line.style.display = 'block';
      line.style.top = minutesToTop(min) + 'px';
    }

    let activeTimeLabel = null;

    function clearHighlights() {
      document.querySelectorAll('.artist-card').forEach(c => {
        c.classList.remove('highlighted', 'active');
      });
      if (activeTimeLabel) {
        activeTimeLabel.classList.remove('time-active');
        activeTimeLabel = null;
      }
    }

    function highlightConcurrent(clickedCard) {
      const start = parseInt(clickedCard.dataset.start);
      const end = parseInt(clickedCard.dataset.end);

      document.querySelectorAll('.artist-card').forEach(card => {
        const s = parseInt(card.dataset.start);
        const e = parseInt(card.dataset.end);
        if (!(e <= start || s >= end)) card.classList.add('highlighted');
      });

      clickedCard.classList.remove('highlighted');
      clickedCard.classList.add('active');
    }

    function highlightAtTime(timeMin, label) {
      document.querySelectorAll('.artist-card').forEach(card => {
        const s = parseInt(card.dataset.start);
        const e = parseInt(card.dataset.end);
        if (timeMin >= s && timeMin < e) card.classList.add('highlighted');
      });
      label.classList.add('time-active');
      activeTimeLabel = label;
    }

    document.addEventListener('DOMContentLoaded', () => {
      if (isFestivalDay) {
        updateCurrentTimeLine();
        setInterval(updateCurrentTimeLine, 30000);

        const min = getCurrentMinutes();
        const top = minutesToTop(min);
        document.getElementById('scroll').scrollTop = Math.max(0, top - 150);
      }

      document.querySelectorAll('.artist-card').forEach(card => {
        card.addEventListener('click', (e) => {
          e.stopPropagation();
          const isActive = card.classList.contains('active');
          clearHighlights();
          if (!isActive) highlightConcurrent(card);
        });
      });

      document.querySelectorAll('.time-label').forEach(label => {
        label.addEventListener('click', (e) => {
          e.stopPropagation();
          const isActive = label.classList.contains('time-active');
          clearHighlights();
          if (!isActive) {
            const [h, m] = label.textContent.split(':').map(Number);
            highlightAtTime(h * 60 + m, label);
          }
        });
      });

      document.addEventListener('click', () => clearHighlights());
    });
  </script>
</body>
</html>`;
}

fs.mkdirSync('/Users/katerynazhezherya/Documents/bpbf26/2025', { recursive: true });
fs.writeFileSync('/Users/katerynazhezherya/Documents/bpbf26/2025/день1.html', generateHTML(DAY1), 'utf8');
fs.writeFileSync('/Users/katerynazhezherya/Documents/bpbf26/2025/день2.html', generateHTML(DAY2), 'utf8');
console.log('Generated день1.html and день2.html');
