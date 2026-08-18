/**
 * RAJNEESH CHOUDHARY — SOLAR & ELECTRICAL ENGINEER PORTFOLIO
 * High-Tech WebGL & Canvas Interactive Experience
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. SOUND FX SYNTHESIZER (Web Audio API)
  // ==========================================
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = localStorage.getItem('rajneesh_sound_muted') === 'true';
      this.initToggleUI();
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    initToggleUI() {
      const toggleBtn = document.getElementById('soundToggleBtn');
      if (!toggleBtn) return;

      this.updateBtnUI(toggleBtn);

      toggleBtn.addEventListener('click', () => {
        this.init();
        this.muted = !this.muted;
        localStorage.setItem('rajneesh_sound_muted', this.muted);
        this.updateBtnUI(toggleBtn);
        if (!this.muted) this.playTone(880, 'sine', 0.1, 0.1);
      });
    }

    updateBtnUI(btn) {
      if (this.muted) {
        btn.classList.add('muted');
        btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        btn.setAttribute('title', 'Sound Muted — Click to Enable');
      } else {
        btn.classList.remove('muted');
        btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        btn.setAttribute('title', 'Sound Active — Click to Mute');
      }
    }

    playTone(freq = 440, type = 'sine', duration = 0.12, volume = 0.08) {
      if (this.muted) return;
      try {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    playChirp() {
      if (this.muted) return;
      try {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1040, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
      } catch (e) {}
    }

    playPowerUp() {
      if (this.muted) return;
      try {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
      } catch (e) {}
    }
  }

  const sound = new SoundEngine();

  // Attach sound to interactive buttons
  document.querySelectorAll('button, a, .tab-btn, .string-test-card').forEach(el => {
    el.addEventListener('mouseenter', () => sound.playTone(650, 'sine', 0.04, 0.02));
    el.addEventListener('click', () => sound.playChirp());
  });

  // ==========================================
  // 2. CINEMATIC SOLAR STARTUP LOADER
  // ==========================================
  const loader = document.getElementById('solar-loader');
  const progressFill = document.querySelector('.loader-progress-fill');
  const progressPercent = document.querySelector('.loader-percent');
  const loaderSub = document.querySelector('.loader-subtitle');

  if (loader && progressFill && progressPercent) {
    let progress = 0;
    const stages = [
      { pct: 20, msg: "⚡ INITIALIZING PHOTOVOLTAIC SENSORS..." },
      { pct: 45, msg: "🔆 CALIBRATING 15 SOLAR INVERTERS (200-500 kW)..." },
      { pct: 70, msg: "🛡️ VERIFYING EARTH RESISTANCE (<2.4 Ω)..." },
      { pct: 90, msg: "🌐 SYNCHRONIZING 6.5 MW RENEWABLE GRID..." },
      { pct: 100, msg: "✨ SOLAR GRID ONLINE — 100% READY" }
    ];

    let stageIdx = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 4) + 2;
      if (progress > 100) progress = 100;

      progressFill.style.width = `${progress}%`;
      progressPercent.textContent = `${progress}%`;

      if (stageIdx < stages.length && progress >= stages[stageIdx].pct) {
        if (loaderSub) loaderSub.textContent = stages[stageIdx].msg;
        sound.playTone(300 + stageIdx * 120, 'triangle', 0.06, 0.04);
        stageIdx++;
      }

      if (progress >= 100) {
        clearInterval(interval);
        sound.playPowerUp();
        setTimeout(() => {
          loader.classList.add('loaded');
          startTypingEffect();
          initScrollTriggers();
        }, 500);
      }
    }, 35);
  } else {
    startTypingEffect();
    initScrollTriggers();
  }

  // ==========================================
  // 3. HERO VISUAL TOGGLE (PORTRAIT VS 3D STAGE)
  // ==========================================
  const btnShowPortrait = document.getElementById('btnShowPortrait');
  const btnShow3D = document.getElementById('btnShow3D');
  const portraitStage = document.getElementById('portraitStage');
  const threeStage = document.getElementById('threeStage');

  if (btnShowPortrait && btnShow3D && portraitStage && threeStage) {
    btnShowPortrait.addEventListener('click', () => {
      btnShowPortrait.classList.add('active');
      btnShow3D.classList.remove('active');
      portraitStage.classList.remove('hidden');
      threeStage.classList.remove('active');
      sound.playChirp();
    });

    btnShow3D.addEventListener('click', () => {
      btnShow3D.classList.add('active');
      btnShowPortrait.classList.remove('active');
      portraitStage.classList.add('hidden');
      threeStage.classList.add('active');
      sound.playPowerUp();
    });
  }

  // ==========================================
  // 4. CUSTOM GLOWING PHOTON CURSOR
  // ==========================================
  const cursorDot = document.querySelector('.custom-cursor-dot');
  const cursorAura = document.querySelector('.custom-cursor-aura');

  if (cursorDot && cursorAura) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let auraX = mouseX;
    let auraY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    const renderCursor = () => {
      auraX += (mouseX - auraX) * 0.18;
      auraY += (mouseY - auraY) * 0.18;
      cursorAura.style.left = `${auraX}px`;
      cursorAura.style.top = `${auraY}px`;
      requestAnimationFrame(renderCursor);
    };
    renderCursor();

    document.querySelectorAll('a, button, input, textarea, .project-card, .matrix-stat-box, .string-test-card').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // ==========================================
  // 5. DYNAMIC TYPING EFFECT
  // ==========================================
  function startTypingEffect() {
    const textTarget = document.querySelector('.typing-dynamic-text');
    if (!textTarget) return;

    const roles = [
      "Solar PV O&M Engineer",
      "GATE 2021 Qualified",
      "Plant Generation Optimizer",
      "Inverter Diagnostics Specialist",
      "M.E. Digital Communication",
      "Site Operations Leader (40+ Crew)"
    ];

    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let speed = 90;

    const type = () => {
      const currentRole = roles[roleIdx];
      if (isDeleting) {
        textTarget.textContent = currentRole.substring(0, charIdx - 1);
        charIdx--;
        speed = 40;
      } else {
        textTarget.textContent = currentRole.substring(0, charIdx + 1);
        charIdx++;
        speed = 85;
      }

      if (!isDeleting && charIdx === currentRole.length) {
        speed = 1800; // pause at full word
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        speed = 400;
      }

      setTimeout(type, speed);
    };

    type();
  }

  // ==========================================
  // 6. BACKGROUND PHOTON PARTICLE CANVAS
  // ==========================================
  const bgCanvas = document.getElementById('particle-canvas');
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    let width = (bgCanvas.width = window.innerWidth);
    let height = (bgCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = bgCanvas.width = window.innerWidth;
      height = bgCanvas.height = window.innerHeight;
    });

    const particles = [];
    const numParticles = Math.min(Math.floor(window.innerWidth / 16), 80);

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2.2 + 1,
        color: Math.random() > 0.4 ? 'rgba(255, 184, 0,' : 'rgba(0, 245, 212,',
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01
      });
    }

    let pMouseX = width / 2;
    let pMouseY = height / 2;

    window.addEventListener('mousemove', (e) => {
      pMouseX = e.clientX;
      pMouseY = e.clientY;
    });

    const animateParticles = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse interaction
        const dx = pMouseX - p.x;
        const dy = pMouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          p.x -= (dx / dist) * 1.5;
          p.y -= (dy / dist) * 1.5;
        }

        // Draw photon
        p.alpha += Math.sin(Date.now() * p.pulseSpeed * 0.001) * 0.01;
        const clampedAlpha = Math.max(0.1, Math.min(0.85, p.alpha));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${clampedAlpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color.includes('255') ? '#ffb800' : '#00f5d4';
        ctx.fill();

        // Connect nearby particles
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 184, 0, ${(1 - dist2 / 110) * 0.15})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animateParticles);
    };

    animateParticles();
  }

  // ==========================================
  // 7. THREE.JS 3D INTERACTIVE SOLAR PANEL ARRAY
  // ==========================================
  const stageCanvas = document.getElementById('hero-interactive-3d-canvas');
  if (stageCanvas && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, stageCanvas.clientWidth / stageCanvas.clientHeight || 1, 0.1, 1000);
    camera.position.set(0, 6, 12);

    const renderer = new THREE.WebGLRenderer({ canvas: stageCanvas, alpha: true, antialias: true });
    renderer.setSize(stageCanvas.clientWidth || 300, stageCanvas.clientHeight || 300);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0x0f1c3f, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffd700, 3.5);
    sunLight.position.set(8, 12, 10);
    scene.add(sunLight);

    const cyanPointLight = new THREE.PointLight(0x00f5d4, 2, 20);
    cyanPointLight.position.set(-6, 2, -4);
    scene.add(cyanPointLight);

    const solarGroup = new THREE.Group();
    scene.add(solarGroup);

    const frameGeo = new THREE.BoxGeometry(6.4, 0.15, 3.8);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x242e47, metalness: 0.8, roughness: 0.3 });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    solarGroup.add(frameMesh);

    const rows = 3;
    const cols = 5;
    const cellW = 1.15;
    const cellH = 1.1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellGeo = new THREE.BoxGeometry(cellW - 0.08, 0.05, cellH - 0.08);
        const cellMat = new THREE.MeshStandardMaterial({
          color: 0x0a1945,
          emissive: 0x050c26,
          metalness: 0.9,
          roughness: 0.15
        });
        const cell = new THREE.Mesh(cellGeo, cellMat);
        cell.position.x = (c - (cols - 1) / 2) * cellW;
        cell.position.z = (r - (rows - 1) / 2) * cellH;
        cell.position.y = 0.1;
        solarGroup.add(cell);

        const busGeo = new THREE.BoxGeometry(cellW - 0.1, 0.06, 0.02);
        const busMat = new THREE.MeshBasicMaterial({ color: 0xffb800 });
        const bus1 = new THREE.Mesh(busGeo, busMat);
        bus1.position.set(cell.position.x, 0.12, cell.position.z - 0.25);
        const bus2 = new THREE.Mesh(busGeo, busMat);
        bus2.position.set(cell.position.x, 0.12, cell.position.z + 0.25);
        solarGroup.add(bus1, bus2);
      }
    }

    const sunGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffe600 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    solarGroup.rotation.x = 0.35;
    solarGroup.rotation.y = -0.4;

    let targetRotY = -0.4;
    let targetRotX = 0.35;

    stageCanvas.addEventListener('mousemove', (e) => {
      const rect = stageCanvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = nx * 0.8;
      targetRotX = 0.35 - ny * 0.4;
    });

    const animateSolarScene = () => {
      requestAnimationFrame(animateSolarScene);

      solarGroup.rotation.y += (targetRotY - solarGroup.rotation.y) * 0.05;
      solarGroup.rotation.x += (targetRotX - solarGroup.rotation.x) * 0.05;

      const time = Date.now() * 0.001;
      sunMesh.position.x = Math.cos(time * 0.8) * 7;
      sunMesh.position.z = Math.sin(time * 0.8) * 5;
      sunMesh.position.y = 5 + Math.sin(time * 0.5) * 1.5;
      sunLight.position.copy(sunMesh.position);

      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };

    animateSolarScene();

    window.addEventListener('resize', () => {
      if (!stageCanvas.clientWidth || !stageCanvas.clientHeight) return;
      camera.aspect = stageCanvas.clientWidth / stageCanvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(stageCanvas.clientWidth, stageCanvas.clientHeight);
    });
  }

  // ==========================================
  // 8. LAB 1: INVERTER SINE WAVE OSCILLOSCOPE
  // ==========================================
  const oscCanvas = document.getElementById('oscillo-canvas');
  if (oscCanvas) {
    const octx = oscCanvas.getContext('2d');
    let oWidth = (oscCanvas.width = oscCanvas.clientWidth);
    let oHeight = (oscCanvas.height = oscCanvas.clientHeight);

    let freqVal = 50;
    let voltVal = 220;
    let thdVal = 2;
    let waveMode = 'pure';

    const freqInput = document.getElementById('freqSlider');
    const voltInput = document.getElementById('voltSlider');
    const thdInput = document.getElementById('thdSlider');

    if (freqInput) {
      freqInput.addEventListener('input', (e) => {
        freqVal = parseFloat(e.target.value);
        document.getElementById('freqDisplay').textContent = `${freqVal} Hz`;
      });
    }
    if (voltInput) {
      voltInput.addEventListener('input', (e) => {
        voltVal = parseFloat(e.target.value);
        document.getElementById('voltDisplay').textContent = `${voltVal} V`;
      });
    }
    if (thdInput) {
      thdInput.addEventListener('input', (e) => {
        thdVal = parseFloat(e.target.value);
        document.getElementById('thdDisplay').textContent = `${thdVal}%`;
      });
    }

    document.querySelectorAll('.btn-wave-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-wave-mode').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        waveMode = btn.dataset.mode || 'pure';
        sound.playChirp();
      });
    });

    let phase = 0;
    const renderOscillo = () => {
      octx.fillStyle = '#02050e';
      octx.fillRect(0, 0, oWidth, oHeight);

      octx.strokeStyle = 'rgba(0, 245, 212, 0.12)';
      octx.lineWidth = 1;
      const gridSize = 24;

      for (let x = 0; x < oWidth; x += gridSize) {
        octx.beginPath();
        octx.moveTo(x, 0);
        octx.lineTo(x, oHeight);
        octx.stroke();
      }
      for (let y = 0; y < oHeight; y += gridSize) {
        octx.beginPath();
        octx.moveTo(0, y);
        octx.lineTo(oWidth, y);
        octx.stroke();
      }

      octx.strokeStyle = 'rgba(255, 184, 0, 0.3)';
      octx.beginPath();
      octx.moveTo(0, oHeight / 2);
      octx.lineTo(oWidth, oHeight / 2);
      octx.stroke();

      octx.beginPath();
      octx.lineWidth = 2.5;
      octx.strokeStyle = '#00f5d4';
      octx.shadowBlur = 12;
      octx.shadowColor = '#00f5d4';

      const amp = (voltVal / 240) * (oHeight * 0.38);
      const cycles = (freqVal / 50) * 3;

      for (let x = 0; x < oWidth; x++) {
        const t = (x / oWidth) * cycles * Math.PI * 2 + phase;
        let y = 0;

        if (waveMode === 'pure') {
          y = Math.sin(t) * amp + (Math.sin(t * 3) * amp * (thdVal / 100));
        } else if (waveMode === 'modified') {
          const sinVal = Math.sin(t);
          y = (sinVal > 0.3 ? 1 : sinVal < -0.3 ? -1 : 0) * amp;
        } else { // square
          y = (Math.sin(t) >= 0 ? 1 : -1) * amp;
        }

        const plotY = oHeight / 2 - y;
        if (x === 0) octx.moveTo(x, plotY);
        else octx.lineTo(x, plotY);
      }

      octx.stroke();
      octx.shadowBlur = 0;

      phase += 0.04 * (freqVal / 50);
      requestAnimationFrame(renderOscillo);
    };

    renderOscillo();

    window.addEventListener('resize', () => {
      oWidth = oscCanvas.width = oscCanvas.clientWidth;
      oHeight = oscCanvas.height = oscCanvas.clientHeight;
    });
  }

  // ==========================================
  // 9. LAB 2: SOLAR STRING & FAULT DIAGNOSTICS
  // ==========================================
  const stringCards = document.querySelectorAll('.string-test-card');
  const rectifyBtn = document.getElementById('btnRectifyFault');

  const stringsData = {
    '1': { voc: '648 V', isc: '9.4 A', temp: '42.1 °C', ert: '1.8 Ω', status: 'Optimal', isFault: false },
    '2': { voc: '652 V', isc: '9.5 A', temp: '43.0 °C', ert: '1.9 Ω', status: 'Optimal', isFault: false },
    '3': { voc: '412 V', isc: '3.1 A', temp: '58.4 °C', ert: '7.8 Ω', status: 'Diode / Earth Fault', isFault: true, reason: 'Bypass Diode Short + ERT > 5.0 Ω' },
    '4': { voc: '649 V', isc: '9.3 A', temp: '41.8 °C', ert: '1.7 Ω', status: 'Optimal', isFault: false },
    '5': { voc: '655 V', isc: '9.6 A', temp: '42.5 °C', ert: '2.1 Ω', status: 'Optimal', isFault: false },
    '6': { voc: '650 V', isc: '9.4 A', temp: '42.9 °C', ert: '1.9 Ω', status: 'Optimal', isFault: false },
  };

  let activeStringId = '3';

  function updateDiagnosticUI(strId) {
    const data = stringsData[strId];
    if (!data) return;

    activeStringId = strId;
    stringCards.forEach(c => {
      c.classList.remove('active-selected');
      if (c.dataset.strId === strId) c.classList.add('active-selected');
    });

    const vocEl = document.getElementById('diagVoc');
    const iscEl = document.getElementById('diagIsc');
    const tempEl = document.getElementById('diagTemp');
    const ertEl = document.getElementById('diagErt');
    const statusEl = document.getElementById('diagStatus');
    const titleEl = document.getElementById('diagTitleStr');

    if (titleEl) titleEl.textContent = `String #${strId} Diagnostic`;
    if (vocEl) vocEl.textContent = data.voc;
    if (iscEl) iscEl.textContent = data.isc;
    if (tempEl) tempEl.textContent = data.temp;
    if (ertEl) {
      ertEl.textContent = data.ert;
      ertEl.className = data.isFault ? 'val gold' : 'val green';
    }
    if (statusEl) {
      statusEl.textContent = data.status;
      statusEl.className = data.isFault ? 'val' : 'val green';
      statusEl.style.color = data.isFault ? '#ef4444' : '#10b981';
    }

    if (rectifyBtn) {
      rectifyBtn.style.display = data.isFault ? 'block' : 'none';
    }
  }

  stringCards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.strId;
      updateDiagnosticUI(id);
      sound.playChirp();
    });
  });

  if (rectifyBtn) {
    rectifyBtn.addEventListener('click', () => {
      sound.playPowerUp();
      rectifyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Rectifying Fault & ERT...';
      rectifyBtn.disabled = true;

      setTimeout(() => {
        stringsData[activeStringId] = {
          voc: '651 V',
          isc: '9.5 A',
          temp: '42.4 °C',
          ert: '1.8 Ω',
          status: 'Optimal (Fault Cleared)',
          isFault: false
        };

        const targetCard = document.querySelector(`.string-test-card[data-str-id="${activeStringId}"]`);
        if (targetCard) {
          targetCard.classList.remove('faulty');
          const badge = targetCard.querySelector('.string-status-badge');
          if (badge) {
            badge.className = 'string-status-badge status-normal';
            badge.textContent = 'Normal';
          }
        }

        updateDiagnosticUI(activeStringId);
        rectifyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Fault Cleared Successfully!';
        setTimeout(() => {
          rectifyBtn.disabled = false;
          rectifyBtn.innerHTML = '⚡ Auto-Rectify String Fault';
          rectifyBtn.style.display = 'none';
        }, 2000);
      }, 1000);
    });
  }

  // ==========================================
  // 10. LAB 3: DUAL-AXIS SOLAR TRACKER SIMULATOR
  // ==========================================
  const trackerCanvas = document.getElementById('tracker-canvas');
  if (trackerCanvas) {
    const tctx = trackerCanvas.getContext('2d');
    let tWidth = (trackerCanvas.width = trackerCanvas.clientWidth);
    let tHeight = (trackerCanvas.height = trackerCanvas.clientHeight);

    let sunAngle = 45;
    let panelAngle = 45;
    let isDraggingSun = false;

    const effFill = document.getElementById('trackerEffFill');
    const effVal = document.getElementById('trackerEffVal');
    const wattsVal = document.getElementById('trackerWattsVal');

    const updateTrackerMetrics = () => {
      const alignmentDiff = Math.abs(sunAngle - panelAngle);
      const efficiency = Math.max(70, Math.round(99.8 - alignmentDiff * 0.6));
      const watts = Math.round((efficiency / 100) * 540);

      if (effFill) effFill.style.width = `${efficiency}%`;
      if (effVal) effVal.textContent = `${efficiency}%`;
      if (wattsVal) wattsVal.textContent = `${watts} W`;
    };

    const drawTracker = () => {
      tctx.clearRect(0, 0, tWidth, tHeight);

      tctx.fillStyle = '#060a17';
      tctx.fillRect(0, 0, tWidth, tHeight);

      const groundY = tHeight - 40;

      tctx.strokeStyle = 'rgba(255, 184, 0, 0.25)';
      tctx.lineWidth = 2;
      tctx.beginPath();
      tctx.moveTo(0, groundY);
      tctx.lineTo(tWidth, groundY);
      tctx.stroke();

      const centerX = tWidth / 2;
      tctx.fillStyle = '#1b284f';
      tctx.fillRect(centerX - 10, groundY - 60, 20, 60);

      tctx.beginPath();
      tctx.arc(centerX, groundY - 60, 12, 0, Math.PI * 2);
      tctx.fillStyle = '#ffb800';
      tctx.fill();

      tctx.save();
      tctx.translate(centerX, groundY - 60);
      tctx.rotate((-panelAngle * Math.PI) / 180 + Math.PI / 2);

      tctx.fillStyle = '#0a1945';
      tctx.strokeStyle = '#00f5d4';
      tctx.lineWidth = 3;
      tctx.fillRect(-70, -6, 140, 12);
      tctx.strokeRect(-70, -6, 140, 12);

      tctx.strokeStyle = 'rgba(255, 184, 0, 0.5)';
      tctx.lineWidth = 1;
      for (let x = -50; x <= 50; x += 25) {
        tctx.beginPath();
        tctx.moveTo(x, -6);
        tctx.lineTo(x, 6);
        tctx.stroke();
      }
      tctx.restore();

      const orbitR = Math.min(tWidth, tHeight) * 0.42;
      tctx.beginPath();
      tctx.arc(centerX, groundY - 60, orbitR, Math.PI, 0, false);
      tctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      tctx.setLineDash([4, 6]);
      tctx.stroke();
      tctx.setLineDash([]);

      const sunRad = (sunAngle * Math.PI) / 180;
      const sunX = centerX - Math.cos(sunRad) * orbitR;
      const sunY = (groundY - 60) - Math.sin(sunRad) * orbitR;

      tctx.beginPath();
      tctx.moveTo(sunX, sunY);
      tctx.lineTo(centerX, groundY - 60);
      tctx.strokeStyle = 'rgba(255, 184, 0, 0.35)';
      tctx.lineWidth = 1.5;
      tctx.stroke();

      tctx.beginPath();
      tctx.arc(sunX, sunY, 16, 0, Math.PI * 2);
      tctx.fillStyle = '#ffd700';
      tctx.shadowColor = '#ff9100';
      tctx.shadowBlur = 25;
      tctx.fill();
      tctx.shadowBlur = 0;

      tctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      tctx.font = '10px "Fira Code", monospace';
      tctx.fillText('☀️ Drag Sun Position', sunX - 45, sunY - 24);

      panelAngle += (sunAngle - panelAngle) * 0.12;
      updateTrackerMetrics();

      requestAnimationFrame(drawTracker);
    };

    drawTracker();

    const handleSunDrag = (e) => {
      const rect = trackerCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const cx = rect.left + tWidth / 2;
      const cy = rect.top + (tHeight - 100);

      const dx = clientX - cx;
      const dy = cy - clientY;

      let deg = (Math.atan2(dy, -dx) * 180) / Math.PI;
      if (deg < 10) deg = 10;
      if (deg > 170) deg = 170;

      sunAngle = deg;
    };

    trackerCanvas.addEventListener('mousedown', (e) => {
      isDraggingSun = true;
      handleSunDrag(e);
    });
    window.addEventListener('mousemove', (e) => {
      if (isDraggingSun) handleSunDrag(e);
    });
    window.addEventListener('mouseup', () => { isDraggingSun = false; });

    trackerCanvas.addEventListener('touchstart', (e) => {
      isDraggingSun = true;
      handleSunDrag(e);
    });
    window.addEventListener('touchmove', (e) => {
      if (isDraggingSun) handleSunDrag(e);
    });
    window.addEventListener('touchend', () => { isDraggingSun = false; });

    window.addEventListener('resize', () => {
      tWidth = trackerCanvas.width = trackerCanvas.clientWidth;
      tHeight = trackerCanvas.height = trackerCanvas.clientHeight;
    });
  }

  // ==========================================
  // 11. LAB TAB SWITCHING LOGIC
  // ==========================================
  document.querySelectorAll('.lab-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      document.querySelectorAll('.lab-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.lab-view-panel').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(tabId);
      if (targetPanel) targetPanel.classList.add('active');
      sound.playChirp();
    });
  });

  // ==========================================
  // 12. SCROLL REVEALS & LIVE STAT COUNTERS
  // ==========================================
  function initScrollTriggers() {
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    });

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      let currentSection = '';
      sections.forEach(sec => {
        const top = sec.offsetTop - 120;
        if (window.scrollY >= top) {
          currentSection = sec.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
          link.classList.add('active');
        }
      });
    });

    const counters = document.querySelectorAll('.count-num');
    let animated = false;

    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          counters.forEach(counter => {
            const target = parseFloat(counter.dataset.target);
            const isFloat = counter.dataset.target.includes('.');
            let current = 0;
            const duration = 1600;
            const stepTime = 25;
            const steps = duration / stepTime;
            const increment = target / steps;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              counter.textContent = isFloat ? current.toFixed(1) : Math.round(current);
            }, stepTime);
          });
        }
      });
    }, { threshold: 0.3 });

    const statsContainer = document.querySelector('.stats-glass-container');
    if (statsContainer) countObserver.observe(statsContainer);

    const skillCards = document.querySelectorAll('.skill-category-card');
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.2 });

    skillCards.forEach(card => skillObserver.observe(card));
  }

  // ==========================================
  // 13. MODAL & CONTACT ACTIONS
  // ==========================================
  const hireModal = document.getElementById('hireModal');
  const openHireBtns = document.querySelectorAll('.open-hire-modal');
  const closeModalBtns = document.querySelectorAll('.btn-close-modal, .btn-modal-dismiss');

  openHireBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      hireModal?.classList.add('active');
      sound.playPowerUp();
    });
  });

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      hireModal?.classList.remove('active');
      sound.playChirp();
    });
  });

  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navWrap = document.querySelector('.nav-links-wrap');

  if (mobileBtn && navWrap) {
    mobileBtn.addEventListener('click', () => {
      navWrap.classList.toggle('mobile-open');
      sound.playChirp();
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navWrap.classList.remove('mobile-open'));
    });
  }

  const contactForm = document.getElementById('contactDirectForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const statusBox = document.getElementById('contactStatusAlert');
      sound.playPowerUp();

      if (statusBox) {
        statusBox.classList.add('success');
        statusBox.innerHTML = '<i class="fa-solid fa-circle-check"></i> Thank you! Message dispatched to Rajneesh Choudhary.';
        statusBox.style.display = 'block';
      }

      contactForm.reset();
      setTimeout(() => {
        if (statusBox) statusBox.style.display = 'none';
      }, 5000);
    });
  }
});
