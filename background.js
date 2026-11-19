/**
 * PORTFOLIO.OS // CINEMATIC SUPERHERO CANVAS BACKGROUND ENGINE
 * Features:
 * 1. Spider-Man: Procedural pendulum web-swinging kinematics, web lines, athletic posture & eye lenses.
 * 2. Batman: Gotham gargoyle rooftop perch, procedural billowing cape physics, glowing cowl eyes.
 * 3. Bat-Signal & Bats: Sweeping volumetric spotlight with Bat crest, distant bat swarm.
 * 4. Atmosphere: Multi-layer parallax skyline, rolling volumetric fog, ambient red/blue embers & raindrops.
 * 5. Optimized 60 FPS requestAnimationFrame with delta-time & window resize handling.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('cinematic-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });

  // State & Metrics
  let width = 0;
  let height = 0;
  let dpr = 1;

  // Parallax target & current values
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let scrollY = 0;
  let targetScrollY = 0;

  // Time tracking
  let lastTime = performance.now();
  let totalTime = 0;

  // Global Theme Mode ('dual', 'spider', 'batman')
  let currentThemeMode = document.body.getAttribute('data-theme') || 'dual';

  // Listen for mode changes from HUD
  window.addEventListener('themeModeChanged', (e) => {
    currentThemeMode = e.detail.mode || 'dual';
  });

  /* -------------------------------------------------------------
     RESIZE HANDLER
  ------------------------------------------------------------- */
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);

    initSkyline();
    initParticles();
    initBats();
  }

  /* -------------------------------------------------------------
     PARALLAX MOUSE & SCROLL LISTENERS
  ------------------------------------------------------------- */
  window.addEventListener('mousemove', (e) => {
    // Normalized between -1 and 1
    mouse.targetX = (e.clientX / width - 0.5) * 2;
    mouse.targetY = (e.clientY / height - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  }, { passive: true });

  /* -------------------------------------------------------------
     1. SKYLINE GENERATOR (Far, Mid, Near Layers)
  ------------------------------------------------------------- */
  let farBuildings = [];
  let midBuildings = [];

  function initSkyline() {
    farBuildings = [];
    midBuildings = [];

    // Far Layer (Dark silhouette towers with soft window lights)
    let curX = -50;
    while (curX < width + 100) {
      const bWidth = 60 + Math.random() * 90;
      const bHeight = height * (0.35 + Math.random() * 0.3);
      const spire = Math.random() > 0.6;
      const windows = [];

      // Generate subtle windows
      const rows = Math.floor(bHeight / 18);
      const cols = Math.floor(bWidth / 14);
      for (let r = 2; r < rows - 2; r++) {
        for (let c = 1; c < cols - 1; c++) {
          if (Math.random() > 0.72) {
            windows.push({
              rx: c * 14 + 3,
              ry: r * 18 + 3,
              color: Math.random() > 0.5 ? 'rgba(255, 235, 180, 0.45)' : 'rgba(0, 180, 216, 0.4)',
              flickerSpeed: 0.5 + Math.random() * 1.5,
              offset: Math.random() * Math.PI * 2
            });
          }
        }
      }

      farBuildings.push({
        x: curX,
        w: bWidth,
        h: bHeight,
        spire: spire,
        windows: windows
      });

      curX += bWidth + (Math.random() * 20 - 10);
    }

    // Mid Layer (Gothic spires, water towers, art deco geometry)
    curX = -40;
    while (curX < width + 100) {
      const bWidth = 80 + Math.random() * 120;
      const bHeight = height * (0.22 + Math.random() * 0.25);
      const hasWaterTower = Math.random() > 0.75;
      const hasSpire = Math.random() > 0.5;

      midBuildings.push({
        x: curX,
        w: bWidth,
        h: bHeight,
        hasWaterTower: hasWaterTower,
        hasSpire: hasSpire
      });

      curX += bWidth + 5 + Math.random() * 25;
    }
  }

  /* -------------------------------------------------------------
     2. ATMOSPHERIC PARTICLES (Rain & Embers)
  ------------------------------------------------------------- */
  let particles = [];
  const PARTICLE_COUNT = 75;

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(true));
    }
  }

  function createParticle(randomY = false) {
    const isSpiderSide = Math.random() > 0.5; // Left (Gotham Blue) vs Right (Spider Red)
    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : -10,
      size: 1 + Math.random() * 2.5,
      speedY: 0.6 + Math.random() * 1.8,
      speedX: (Math.random() - 0.5) * 0.8,
      alpha: 0.2 + Math.random() * 0.6,
      pulse: Math.random() * Math.PI * 2,
      isSpider: isSpiderSide,
      color: isSpiderSide ? 'rgba(255, 42, 95,' : 'rgba(0, 180, 216,'
    };
  }

  /* -------------------------------------------------------------
     3. BAT SWARM (Distant gliding bats)
  ------------------------------------------------------------- */
  let bats = [];
  const BAT_COUNT = 8;

  function initBats() {
    bats = [];
    for (let i = 0; i < BAT_COUNT; i++) {
      bats.push({
        x: Math.random() * (width * 0.45),
        y: height * 0.15 + Math.random() * (height * 0.35),
        speedX: -0.6 - Math.random() * 0.8,
        speedY: (Math.random() - 0.5) * 0.4,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 0.12 + Math.random() * 0.08,
        scale: 0.5 + Math.random() * 0.6,
        alpha: 0.35 + Math.random() * 0.45
      });
    }
  }

  /* -------------------------------------------------------------
     4. SPIDER-MAN KINEMATICS & SWING SIMULATOR
  ------------------------------------------------------------- */
  const spiderman = {
    // Current World Position
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    angleVelocity: 0,

    // Web Anchor Point (High above skyline)
    anchorX: 0,
    anchorY: -50,
    ropeLength: 320,

    // Swing Cycle State: 'swinging', 'flight', 'shoot'
    state: 'swinging',
    cycleTimer: 0,
    swingPhase: 0,

    // Visual attributes
    scale: 0.75,
    flip: false
  };

  function updateSpiderMan(dt, time) {
    const screenRight = width;
    const baseSwingCenter = width * 0.72; // Operates on right side of screen

    if (spiderman.anchorX === 0) {
      spiderman.anchorX = baseSwingCenter;
      spiderman.anchorY = -20;
    }

    // Pendulum Swing Physics
    if (spiderman.state === 'swinging') {
      spiderman.swingPhase += dt * 1.1; // Smooth, realistic, slow movements

      // Harmonic angular motion
      const maxAmplitude = 0.65; // ~37 degrees
      spiderman.angle = Math.sin(spiderman.swingPhase) * maxAmplitude;
      spiderman.angleVelocity = Math.cos(spiderman.swingPhase) * maxAmplitude * 1.1;

      // Position from anchor point
      spiderman.x = spiderman.anchorX + Math.sin(spiderman.angle) * spiderman.ropeLength;
      spiderman.y = spiderman.anchorY + Math.cos(spiderman.angle) * spiderman.ropeLength;

      // When reaching peak of upward forward swing, release web and initiate flight!
      if (spiderman.swingPhase > Math.PI * 0.95 && spiderman.swingPhase < Math.PI * 1.05) {
        spiderman.state = 'flight';
        spiderman.cycleTimer = 0;
        spiderman.vx = 2.4;
        spiderman.vy = -1.2;
      }
    } else if (spiderman.state === 'flight') {
      spiderman.cycleTimer += dt;
      spiderman.x += spiderman.vx;
      spiderman.y += spiderman.vy;
      spiderman.vy += 0.04; // Gentle gravity

      // After brief apex flight, shoot next anchor line forward
      if (spiderman.cycleTimer > 1.2 || spiderman.x > screenRight - 60) {
        // Shift anchor forward or loop back smoothly
        if (spiderman.x > screenRight - 80) {
          spiderman.anchorX = width * 0.58;
          spiderman.x = spiderman.anchorX - 180;
          spiderman.y = height * 0.35;
        } else {
          spiderman.anchorX = spiderman.x + 140;
        }
        spiderman.anchorY = -30 + Math.random() * 40;
        spiderman.ropeLength = 280 + Math.random() * 80;
        spiderman.state = 'swinging';
        spiderman.swingPhase = -Math.PI * 0.45;
      }
    }
  }

  function drawSpiderMan(ctx, pX, pY) {
    const x = spiderman.x + pX * 0.08;
    const y = spiderman.y + pY * 0.08;

    // Web Line
    if (spiderman.state === 'swinging') {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(spiderman.anchorX + pX * 0.04, spiderman.anchorY + pY * 0.04);
      // Subtle natural catenary curve for web tension
      const midX = (spiderman.anchorX + pX * 0.04 + x) / 2;
      const midY = (spiderman.anchorY + pY * 0.04 + y) / 2 + 6;
      ctx.quadraticCurveTo(midX, midY, x, y - 10);

      // Web Line Glow
      ctx.strokeStyle = 'rgba(255, 42, 95, 0.5)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Core Web Strand
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }

    // Spider-Man Character Silhouette & Form
    ctx.save();
    ctx.translate(x, y);

    // Tilt body with swing angle
    const tilt = spiderman.state === 'swinging' ? spiderman.angle * 0.85 : 0.3;
    ctx.rotate(tilt);

    const s = spiderman.scale;
    ctx.scale(s, s);

    // Subtle red ambient hero glow behind silhouette
    const radGlow = ctx.createRadialGradient(0, 0, 5, 0, 0, 45);
    radGlow.addColorStop(0, 'rgba(255, 42, 95, 0.28)');
    radGlow.addColorStop(1, 'rgba(255, 42, 95, 0)');
    ctx.fillStyle = radGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.fill();

    // Body Silhouette (Iconic agile Spider-Man pose)
    ctx.fillStyle = '#0f1420'; // Dark suit base
    ctx.strokeStyle = '#ff2a5f'; // Red neon suit edge accents
    ctx.lineWidth = 1.2;

    // Head
    ctx.beginPath();
    ctx.ellipse(0, -18, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing White Eye Lenses (Spider-Man iconic mask eyes)
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ff2a5f';
    ctx.shadowBlur = 10;
    // Left Eye
    ctx.beginPath();
    ctx.moveTo(-7, -20);
    ctx.lineTo(-2, -18);
    ctx.lineTo(-5, -14);
    ctx.closePath();
    ctx.fill();
    // Right Eye
    ctx.beginPath();
    ctx.moveTo(7, -20);
    ctx.lineTo(2, -18);
    ctx.lineTo(5, -14);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Torso (Lean athletic triangular chest)
    ctx.fillStyle = '#0a0d14';
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.lineTo(8, -8);
    ctx.lineTo(5, 14);
    ctx.lineTo(-5, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Spider Chest Emblem
    ctx.fillStyle = '#ff2a5f';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Upper Arm (holding web high)
    ctx.strokeStyle = '#ff2a5f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(7, -6);
    ctx.lineTo(16, -20);
    ctx.lineTo(12, -32); // Hand on web line
    ctx.stroke();

    // Trailing Arm (balance)
    ctx.beginPath();
    ctx.moveTo(-7, -6);
    ctx.lineTo(-18, 4);
    ctx.lineTo(-24, 15);
    ctx.stroke();

    // Legs (Dynamic bent athletic posture)
    // Left leg
    ctx.beginPath();
    ctx.moveTo(-5, 14);
    ctx.lineTo(-16, 26);
    ctx.lineTo(-12, 42);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(5, 14);
    ctx.lineTo(14, 28);
    ctx.lineTo(22, 40);
    ctx.stroke();

    ctx.restore();
  }

  /* -------------------------------------------------------------
     5. BATMAN & GOTHAM GARGOYLE ROOFTOP
  ------------------------------------------------------------- */
  const batman = {
    // Rooftop perch coordinates (Left side)
    x: 0,
    y: 0,
    scale: 0.9,
    capeNodes: 7,
    capePoints: []
  };

  function updateBatman(time) {
    batman.x = Math.max(70, width * 0.12);
    batman.y = height * 0.58;

    // Procedural Cape Wind Simulation
    if (batman.capePoints.length === 0) {
      for (let i = 0; i < batman.capeNodes; i++) {
        batman.capePoints.push({ x: 0, y: 0 });
      }
    }

    const windSpeed = 1.4;
    for (let i = 0; i < batman.capeNodes; i++) {
      const nodePhase = time * windSpeed - i * 0.45;
      const wave = Math.sin(nodePhase) * (6 + i * 4);
      batman.capePoints[i].x = -i * 12 + wave * 0.8;
      batman.capePoints[i].y = i * 16 + wave * 0.3;
    }
  }

  function drawBatman(ctx, pX, pY) {
    const x = batman.x + pX * 0.07;
    const y = batman.y + pY * 0.07;

    ctx.save();
    ctx.translate(x, y);

    const s = batman.scale;
    ctx.scale(s, s);

    // 1. Gotham Stone Gargoyle / Cornice Pedestal
    ctx.fillStyle = '#060a12';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;

    // Gargoyle head & stone beak
    ctx.beginPath();
    ctx.moveTo(-45, 65);
    ctx.lineTo(25, 65);
    ctx.lineTo(45, 75);
    ctx.lineTo(60, 90);
    ctx.lineTo(50, 110);
    ctx.lineTo(-50, 130);
    ctx.lineTo(-65, 80);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Stone claws grasping ledge
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(38, 72, 7, 0, Math.PI * 2);
    ctx.arc(48, 74, 6, 0, Math.PI * 2);
    ctx.fill();

    // 2. Billowing Cape Physics (Scalloped bat-wing edges)
    ctx.fillStyle = '#070c16';
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(-6, 8); // Cape shoulder attach

    // Curve along procedural cape nodes
    for (let i = 0; i < batman.capePoints.length; i++) {
      const cp = batman.capePoints[i];
      ctx.lineTo(cp.x - 10, cp.y + 10);
    }

    // Scalloped bottom bat wings
    ctx.quadraticCurveTo(-45, 95, -25, 85);
    ctx.quadraticCurveTo(-15, 90, 0, 75);
    ctx.quadraticCurveTo(10, 80, 15, 65);
    ctx.lineTo(8, 12);
    ctx.closePath();
    ctx.fill();

    // Subtle edge highlight on cape
    ctx.stroke();

    // 3. Batman Silhouette Figure (Perched / Standing tall)
    ctx.fillStyle = '#090e18';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;

    // Legs & Boots
    ctx.beginPath();
    ctx.moveTo(8, 28);
    ctx.lineTo(16, 45);
    ctx.lineTo(26, 68);
    ctx.lineTo(36, 70); // boot on ledge
    ctx.lineTo(24, 72);
    ctx.lineTo(10, 48);
    ctx.lineTo(0, 32);
    ctx.closePath();
    ctx.fill();

    // Torso / Armored Chest
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(12, -7);
    ctx.lineTo(8, 26);
    ctx.lineTo(-8, 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Batman Utility Belt (Subtle gold / bronze cylinders)
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-6, 22, 14, 4);

    // Batman Cowl & Head
    ctx.fillStyle = '#050810';
    ctx.beginPath();
    ctx.moveTo(-7, -12);
    ctx.lineTo(9, -14);
    ctx.lineTo(8, -32); // Cowl
    ctx.lineTo(5, -42); // Right Bat Ear
    ctx.lineTo(1, -34);
    ctx.lineTo(-4, -34);
    ctx.lineTo(-8, -42); // Left Bat Ear
    ctx.lineTo(-9, -32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Cyan-White Cowl Slit Eyes
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00b4d8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(6, -24);
    ctx.lineTo(4, -22);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-5, -26);
    ctx.lineTo(-1, -24);
    ctx.lineTo(-2, -22);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Ambient Cyan Backlight Aura for Batman
    const batGlow = ctx.createRadialGradient(0, 0, 5, 0, 0, 60);
    batGlow.addColorStop(0, 'rgba(0, 180, 216, 0.22)');
    batGlow.addColorStop(1, 'rgba(0, 180, 216, 0)');
    ctx.fillStyle = batGlow;
    ctx.beginPath();
    ctx.arc(0, 10, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /* -------------------------------------------------------------
     6. THE BAT-SIGNAL (Volumetric Spotlight Beam)
  ------------------------------------------------------------- */
  function drawBatSignal(ctx, time, pX, pY) {
    const sweep = Math.sin(time * 0.35) * 0.15; // Slow cinematic sweep
    const originX = width * 0.18 + pX * 0.03;
    const originY = height * 0.75;
    const targetX = width * 0.32 + Math.tan(sweep) * (height * 0.7);
    const targetY = height * 0.16 + pY * 0.02;

    ctx.save();

    // Soft volumetric cone
    const coneGrad = ctx.createLinearGradient(originX, originY, targetX, targetY);
    coneGrad.addColorStop(0, 'rgba(0, 180, 216, 0.28)');
    coneGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.12)');
    coneGrad.addColorStop(1, 'rgba(0, 180, 216, 0.01)');

    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(originX - 10, originY);
    ctx.lineTo(targetX - 90, targetY);
    ctx.lineTo(targetX + 90, targetY);
    ctx.lineTo(originX + 10, originY);
    ctx.closePath();
    ctx.fill();

    // Bat-Signal Cloud Ellipse
    const cloudGlow = ctx.createRadialGradient(targetX, targetY, 10, targetX, targetY, 80);
    cloudGlow.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    cloudGlow.addColorStop(0.5, 'rgba(0, 180, 216, 0.2)');
    cloudGlow.addColorStop(1, 'rgba(0, 180, 216, 0)');

    ctx.fillStyle = cloudGlow;
    ctx.beginPath();
    ctx.ellipse(targetX, targetY, 70, 42, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Bat-Signal Silhouette Crest in the Center of Light
    ctx.fillStyle = 'rgba(5, 8, 14, 0.85)';
    ctx.save();
    ctx.translate(targetX, targetY);
    ctx.scale(0.55, 0.55);

    ctx.beginPath();
    // Classic Bat emblem bezier silhouette
    ctx.moveTo(0, -18);
    ctx.lineTo(4, -26);
    ctx.lineTo(8, -18);
    ctx.quadraticCurveTo(24, -24, 38, -12);
    ctx.quadraticCurveTo(34, 4, 46, 12);
    ctx.quadraticCurveTo(28, 18, 18, 14);
    ctx.lineTo(0, 28);
    ctx.lineTo(-18, 14);
    ctx.quadraticCurveTo(-28, 18, -46, 12);
    ctx.quadraticCurveTo(-34, 4, -38, -12);
    ctx.quadraticCurveTo(-24, -24, -8, -18);
    ctx.lineTo(-4, -26);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }

  /* -------------------------------------------------------------
     7. DRAW DISTANT BATS
  ------------------------------------------------------------- */
  function drawBats(ctx, dt, time, pX, pY) {
    ctx.save();
    for (let i = 0; i < bats.length; i++) {
      const b = bats[i];
      b.x += b.speedX;
      b.y += b.speedY;
      b.wingPhase += b.wingSpeed;

      // Wrap around left-side screen
      if (b.x < -30) {
        b.x = width * 0.48;
        b.y = height * 0.12 + Math.random() * (height * 0.35);
      }

      const bx = b.x + pX * 0.02;
      const by = b.y + pY * 0.02;
      const wingFlap = Math.sin(b.wingPhase) * 6;

      ctx.fillStyle = `rgba(10, 16, 26, ${b.alpha})`;
      ctx.beginPath();
      // Simple aerodynamic bat silhouette
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx - 8 * b.scale, by - 6 * b.scale + wingFlap, bx - 14 * b.scale, by - 2 * b.scale + wingFlap);
      ctx.quadraticCurveTo(bx - 6 * b.scale, by + 4 * b.scale, bx, by + 2 * b.scale);
      ctx.quadraticCurveTo(bx + 6 * b.scale, by + 4 * b.scale, bx + 14 * b.scale, by - 2 * b.scale + wingFlap);
      ctx.quadraticCurveTo(bx + 8 * b.scale, by - 6 * b.scale + wingFlap, bx, by);
      ctx.fill();
    }
    ctx.restore();
  }

  /* -------------------------------------------------------------
     8. DRAW VOLUMETRIC FOG & ATMOSPHERE
  ------------------------------------------------------------- */
  function drawAtmosphericFog(ctx, time, pX, pY) {
    // Low Rolling Mist across city base
    const fogHeight = height * 0.35;
    const fogY = height - fogHeight;

    const fogGrad = ctx.createLinearGradient(0, fogY, 0, height);
    fogGrad.addColorStop(0, 'rgba(5, 5, 5, 0)');
    fogGrad.addColorStop(0.4, 'rgba(9, 14, 24, 0.45)');
    fogGrad.addColorStop(1, 'rgba(5, 5, 5, 0.95)');

    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, fogY, width, fogHeight);

    // Dual ambient glow washes on flanks
    // Left: Gotham Cyan/Blue Wash
    const batGlowWash = ctx.createRadialGradient(0, height * 0.6, 50, 0, height * 0.6, width * 0.45);
    batGlowWash.addColorStop(0, 'rgba(0, 180, 216, 0.12)');
    batGlowWash.addColorStop(1, 'rgba(0, 180, 216, 0)');
    ctx.fillStyle = batGlowWash;
    ctx.fillRect(0, 0, width * 0.5, height);

    // Right: Spider Red Wash
    const spiderGlowWash = ctx.createRadialGradient(width, height * 0.45, 50, width, height * 0.45, width * 0.45);
    spiderGlowWash.addColorStop(0, 'rgba(255, 42, 95, 0.12)');
    spiderGlowWash.addColorStop(1, 'rgba(255, 42, 95, 0)');
    ctx.fillStyle = spiderGlowWash;
    ctx.fillRect(width * 0.5, 0, width * 0.5, height);
  }

  /* -------------------------------------------------------------
     9. DRAW PARTICLES (Rain & Red Embers)
  ------------------------------------------------------------- */
  function drawParticles(ctx, dt, time) {
    ctx.save();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.y += p.speedY;
      p.x += p.speedX;
      p.pulse += dt * 2;

      // Fade in and out
      const alphaPulse = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

      if (p.isSpider) {
        // Red floating ember
        ctx.fillStyle = `${p.color} ${alphaPulse})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Gotham cool blue slant raindrop / dust
        ctx.strokeStyle = `${p.color} ${alphaPulse})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 1, p.y + p.size * 3);
        ctx.stroke();
      }

      // Recycle off screen
      if (p.y > height + 20) {
        particles[i] = createParticle(false);
      }
    }
    ctx.restore();
  }

  /* -------------------------------------------------------------
     10. MAIN ANIMATION LOOP
  ------------------------------------------------------------- */
  function loop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    totalTime += dt;

    // Smooth Lerp for Mouse Parallax
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Smooth Lerp for Scroll Parallax
    scrollY += (targetScrollY - scrollY) * 0.08;

    const pX = mouse.x * 25;
    const pY = mouse.y * 15 - (scrollY * 0.05);

    // Clear Screen (Deep Black Canvas #050505)
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    // 1. Draw The Bat-Signal Spotlight (Atmospheric sky layer)
    drawBatSignal(ctx, totalTime, pX, pY);

    // 2. Draw Distant Bat Flock
    drawBats(ctx, dt, totalTime, pX, pY);

    // 3. Draw Far Skyline Layer
    ctx.save();
    for (let i = 0; i < farBuildings.length; i++) {
      const b = farBuildings[i];
      const bx = b.x + pX * 0.02;
      const by = height - b.h + pY * 0.015;

      ctx.fillStyle = '#080c14'; // Far dark silhouette
      ctx.fillRect(bx, by, b.w, b.h);

      if (b.spire) {
        ctx.beginPath();
        ctx.moveTo(bx + b.w / 2, by - 25);
        ctx.lineTo(bx + b.w / 2 + 3, by);
        ctx.lineTo(bx + b.w / 2 - 3, by);
        ctx.closePath();
        ctx.fill();
      }

      // Window lights
      for (let w = 0; w < b.windows.length; w++) {
        const win = b.windows[w];
        const flicker = 0.5 + 0.5 * Math.sin(totalTime * win.flickerSpeed + win.offset);
        if (flicker > 0.3) {
          ctx.fillStyle = win.color;
          ctx.fillRect(bx + win.rx, by + win.ry, 3, 4);
        }
      }
    }
    ctx.restore();

    // 4. Draw Mid Skyline Layer
    ctx.save();
    for (let i = 0; i < midBuildings.length; i++) {
      const b = midBuildings[i];
      const bx = b.x + pX * 0.04;
      const by = height - b.h + pY * 0.035;

      ctx.fillStyle = '#0a0f1b'; // Mid dark architectural tone
      ctx.fillRect(bx, by, b.w, b.h);

      // Gothic / Art Deco Spire
      if (b.hasSpire) {
        ctx.beginPath();
        ctx.moveTo(bx + b.w * 0.5, by - 38);
        ctx.lineTo(bx + b.w * 0.5 + 4, by);
        ctx.lineTo(bx + b.w * 0.5 - 4, by);
        ctx.closePath();
        ctx.fill();
      }

      // Water Tower
      if (b.hasWaterTower) {
        ctx.fillStyle = '#0d1527';
        ctx.fillRect(bx + 15, by - 18, 16, 18);
        ctx.beginPath();
        ctx.moveTo(bx + 13, by - 18);
        ctx.lineTo(bx + 23, by - 26);
        ctx.lineTo(bx + 33, by - 18);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();

    // 5. Update & Draw Batman on Gotham Gargoyle Rooftop (Left side)
    updateBatman(totalTime);
    drawBatman(ctx, pX, pY);

    // 6. Update & Draw Spider-Man Swinging (Right side)
    updateSpiderMan(dt, totalTime);
    drawSpiderMan(ctx, pX, pY);

    // 7. Atmospheric Fog & Ambient Color Wash
    drawAtmosphericFog(ctx, totalTime, pX, pY);

    // 8. Atmospheric Embers & Rain Particles
    drawParticles(ctx, dt, totalTime);

    // Continue Loop
    requestAnimationFrame(loop);
  }

  // Handle Tab Focus (Pause when inactive to conserve battery)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      lastTime = performance.now();
    }
  });

  // Initialization
  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(loop);

})();
