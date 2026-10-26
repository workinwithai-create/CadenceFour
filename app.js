// CadenceFour app.js — lookahead scheduler on AudioContext clock
// Rules 1-4: LOOKAHEAD_MS=25, SCHEDULE_AHEAD=0.12, mutable state, OfflineAudioContext export length exact, user BPM/key/chords persist
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.12;
const SAMPLE_RATE = 48000;

const state = {
  bpm: 92,
  key: 'A minor',
  chords: ['Am', 'F', 'C', 'G'],
  bars: 8,
  recipe: 'authentic',
  mutes: {},
  playing: false
};

let ctx, master, compressor, timerId, nextStepTime, step, activeSources = [];
const buffers = {};

const SAMPLE_BASE = 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@044fab8e1456bfafc5776e86dfd6bb8697149aef/FluidR3_GM/';
const SAMPLES = {
  piano: ['acoustic_grand_piano-mp3/A3.mp3', 'acoustic_grand_piano-mp3/C4.mp3'],
  upright: ['acoustic_bass-mp3/E2.mp3'],
  nylon: ['acoustic_guitar_nylon-mp3/A3.mp3'],
  trumpet: ['trumpet-mp3/C4.mp3'],
  violin: ['violin-mp3/A4.mp3']
  // kit omitted until exact FluidR3 drum paths confirmed; will name missing
};

async function loadSamples() {
  const status = document.getElementById('status');
  let loaded = 0;
  const total = Object.values(SAMPLES).flat().length;
  for (const [voice, paths] of Object.entries(SAMPLES)) {
    buffers[voice] = [];
    for (const p of paths) {
      try {
        const res = await fetch(SAMPLE_BASE + p);
        if (!res.ok) throw new Error(voice);
        const arr = await res.arrayBuffer();
        const buf = await ctx.decodeAudioData(arr.slice(0));
        buffers[voice].push({buf, raw: arr});
        loaded++;
        status.textContent = `Loaded ${loaded}/${total}`;
      } catch (e) {
        status.textContent = `Missing instrument: ${voice}`;
        return false;
      }
    }
  }
  status.textContent = 'Chairs seated. Tap to play.';
  return true;
}

function initAudio() {
  if (ctx) return;
  ctx = new AudioContext({sampleRate: SAMPLE_RATE});
  compressor = ctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-1, 0);
  compressor.ratio.setValueAtTime(20, 0);
  master = ctx.createGain();
  master.connect(compressor);
  compressor.connect(ctx.destination);
}

function scheduleStep(stepNum, time) {
  const isDownbeat = stepNum % 16 === 0;
  if (isDownbeat && !state.mutes.upright) {
    playNote('upright', 0, time, 0.4);
  }
  if (isDownbeat && !state.mutes.piano) {
    playNote('piano', 0, time, 0.6);
  }
  // Cadence recipes expand here on next pass
}

function playNote(voice, sampleIdx, time, duration) {
  if (!buffers[voice] || !buffers[voice][sampleIdx]) return;
  const src = ctx.createBufferSource();
  src.buffer = buffers[voice][sampleIdx].buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(0.6, time + 0.005);
  g.gain.linearRampToValueAtTime(0, time + duration);
  src.connect(g);
  g.connect(master);
  src.start(time);
  src.stop(time + duration + 0.01);
  activeSources.push(src);
}

function scheduler() {
  while (nextStepTime < ctx.currentTime + SCHEDULE_AHEAD) {
    scheduleStep(step, nextStepTime);
    const stepDur = 60 / state.bpm / 4;
    nextStepTime += stepDur;
    step = (step + 1) % (state.bars * 16);
  }
}

function start() {
  initAudio();
  if (ctx.state !== 'running') ctx.resume();
  nextStepTime = ctx.currentTime + 0.1;
  step = 0;
  if (timerId) clearInterval(timerId);
  timerId = setInterval(scheduler, LOOKAHEAD_MS);
  state.playing = true;
  requestAnimationFrame(function loop() {
    if (state.playing) requestAnimationFrame(loop);
  });
}

function stop() {
  if (timerId) clearInterval(timerId);
  activeSources.forEach(s => { try { s.stop(); } catch(e) {} });
  activeSources = [];
  state.playing = false;
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    const saved = JSON.parse(localStorage.getItem('cadencefour') || '{}');
    Object.assign(state, saved);
  } catch(e) {}
  document.getElementById('bpm').value = state.bpm;
  document.getElementById('playA').onclick = () => { state.recipe = 'pocket'; start(); };
  document.getElementById('playB').onclick = () => { state.recipe = 'full'; start(); };
  document.getElementById('playR').onclick = () => { state.recipe = 'resolve'; start(); };
  document.getElementById('stop').onclick = stop;
  document.getElementById('bpm').onchange = e => {
    state.bpm = Math.max(60, Math.min(180, +e.target.value));
    localStorage.setItem('cadencefour', JSON.stringify(state));
  };
  document.body.addEventListener('click', async () => {
    if (!ctx) {
      initAudio();
      await loadSamples();
    }
  }, {once: false});
});

async function exportWav() {
  const length = Math.round(state.bars * 4 * 60 / state.bpm * SAMPLE_RATE);
  alert(`Export length at ${state.bpm} BPM / ${state.bars} bars / 48kHz would be ${length} samples. Full OfflineAudioContext + tail fold + 24-bit in next milestone.`);
}
document.getElementById('exportWav').onclick = exportWav;
