// --- AUDIO SYNTHESIZER FOR CYBERPUNK SOUND EFFECTS ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playCyberSound(freq = 440, duration = 0.05, type = 'sine') {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

// Hover & Click audio hooks
document.querySelectorAll('.cyber-btn, .nav-item, .filter-btn').forEach(elem => {
  elem.addEventListener('mouseenter', () => playCyberSound(600, 0.03, 'square'));
  elem.addEventListener('click', () => playCyberSound(900, 0.08, 'sawtooth'));
});

// --- CANVAS PARTICLE GRID BACKGROUND ---
const canvas = document.getElementById('cyber-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = (Math.random() - 0.5) * 0.8;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(this.x, this.y, 2, 2);
  }
}

for (let i = 0; i < 65; i++) particles.push(new Particle());

function animateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.strokeStyle = `rgba(56, 189, 248, ${1 - dist / 120})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animateCanvas);
}
animateCanvas();

// --- PROJECT FILTERING ---
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// --- LIGHT/DARK THEME TOGGLE ---
const themeBtn = document.getElementById('theme-toggle-btn');
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
});

// --- RESUME MODAL HANDLER ---
const resumeBtn = document.getElementById('resume-modal-btn');
const resumeModal = document.getElementById('resume-modal');
const closeResumeBtn = document.getElementById('close-resume-modal');

resumeBtn.addEventListener('click', () => resumeModal.classList.add('open'));
closeResumeBtn.addEventListener('click', () => resumeModal.classList.remove('open'));

// --- TERMINAL CLI MODE INTERACTION ---
const cliToggleBtn = document.getElementById('cli-toggle-btn');
const cliOverlay = document.getElementById('cli-overlay');
const cliCloseBtn = document.getElementById('cli-close-btn');
const cliInput = document.getElementById('cli-input');
const cliOutput = document.getElementById('cli-output');

cliToggleBtn.addEventListener('click', () => {
  cliOverlay.classList.remove('hidden');
  cliInput.focus();
});

cliCloseBtn.addEventListener('click', () => {
  cliOverlay.classList.add('hidden');
});

cliInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const cmd = cliInput.value.trim().toLowerCase();
    cliInput.value = '';

    const p = document.createElement('p');
    p.innerHTML = `<span class="cli-prompt">art@cyber-pc:~$</span> ${cmd}`;
    cliOutput.appendChild(p);

    const res = document.createElement('p');
    res.style.color = '#94a3b8';

    switch (cmd) {
      case 'help':
        res.innerHTML = 'Commands: <span style="color:#38bdf8">about, skills, projects, contact, clear, exit</span>';
        break;
      case 'about':
        res.innerText = 'Art Lenard B. Bradecina - Computer Engineering student specializing in embedded systems & IoT.';
        break;
      case 'skills':
        res.innerText = 'C++, ESP32, Arduino, MPPT Solar Controllers, Sensors, Circuit Analysis.';
        break;
      case 'projects':
        res.innerText = '1. NeuroComm AAC Board & Smart Necklace\n2. Automated Solar Subsurface Irrigation System';
        break;
      case 'contact':
        res.innerText = 'Email: artlenardbradecina@gmail.com';
        break;
      case 'clear':
        cliOutput.innerHTML = '';
        return;
      case 'exit':
        cliOverlay.classList.add('hidden');
        return;
      default:
        res.innerText = `Command not recognized: '${cmd}'. Type 'help' for options.`;
    }
    cliOutput.appendChild(res);
    cliOutput.scrollTop = cliOutput.scrollHeight;
  }
});
