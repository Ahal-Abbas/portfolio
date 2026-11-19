/**
 * PORTFOLIO.OS // PROCEDURAL WEB AUDIO SYNTHESIZER
 * Zero external audio files required. Generates:
 * 1. Ambient Cinematic Drone (Sub-bass drone + gentle Gotham rain/wind noise)
 * 2. Web-Sling Zap/Whoosh
 * 3. Bat-Whoosh / Batarang Swish
 * 4. High-Tech Tactical UI clicks
 */

(function () {
  'use strict';

  let audioCtx = null;
  let isMuted = true;
  let masterGain = null;
  let droneGain = null;
  let noiseGain = null;

  // Nodes for ambient drone
  let subOsc = null;
  let subOsc2 = null;
  let droneFilter = null;
  let noiseNode = null;

  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioStatusText = audioToggleBtn ? audioToggleBtn.querySelector('.audio-status-text') : null;

  function initAudioContext() {
    if (audioCtx) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    audioCtx = new AudioContextClass();

    // Master Gain
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    // Build Ambient Synthesizer
    setupAmbientSoundscape();
  }

  function setupAmbientSoundscape() {
    if (!audioCtx) return;

    // Sub-bass Drone Oscillator 1 (45Hz - Deep Gotham Dark Knight Tone)
    subOsc = audioCtx.createOscillator();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(45, audioCtx.currentTime);

    // Sub-bass Drone Oscillator 2 (55Hz - Slight detune for hypnotic warmth)
    subOsc2 = audioCtx.createOscillator();
    subOsc2.type = 'sine';
    subOsc2.frequency.setValueAtTime(55.2, audioCtx.currentTime);

    // Drone Low-pass Filter
    droneFilter = audioCtx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(140, audioCtx.currentTime);

    droneGain = audioCtx.createGain();
    droneGain.gain.setValueAtTime(0.12, audioCtx.currentTime);

    subOsc.connect(droneFilter);
    subOsc2.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(masterGain);

    // Rain / Wind Atmospheric Noise
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(380, audioCtx.currentTime);
    noiseFilter.Q.setValueAtTime(0.8, audioCtx.currentTime);

    noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.035, audioCtx.currentTime);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    // Start Generators
    subOsc.start();
    subOsc2.start();
    noiseNode.start();
  }

  /* -------------------------------------------------------------
     SOUND EFFECTS GENERATORS
  ------------------------------------------------------------- */
  window.HeroAudio = {
    // 1. Web Sling Zip (Spider-Man)
    playWebSling: function () {
      if (isMuted || !audioCtx) return;
      try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(950, now);
        filter.Q.setValueAtTime(4, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.25);
      } catch (e) {
        // Safe fail
      }
    },

    // 2. Bat Whoosh / Cape Swish (Batman)
    playBatWhoosh: function () {
      if (isMuted || !audioCtx) return;
      try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.28);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.35);
      } catch (e) {
        // Safe fail
      }
    },

    // 3. UI Click / Tap
    playClick: function () {
      if (isMuted || !audioCtx) return;
      try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.04);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.06);
      } catch (e) {
        // Safe fail
      }
    },

    // 4. UI Success Stinger
    playSuccess: function () {
      if (isMuted || !audioCtx) return;
      try {
        const now = audioCtx.currentTime;
        [440, 554, 659, 880].forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0.06, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.35);
        });
      } catch (e) {
        // Safe fail
      }
    }
  };

  /* -------------------------------------------------------------
     TOGGLE AUDIO BUTTON EVENT
  ------------------------------------------------------------- */
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      initAudioContext();

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      isMuted = !isMuted;

      if (!isMuted) {
        // Fade In
        masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.65, audioCtx.currentTime + 1.2);
        audioToggleBtn.classList.add('playing');
        if (audioStatusText) audioStatusText.textContent = 'AUDIO: ON';
        window.HeroAudio.playBatWhoosh();
      } else {
        // Fade Out
        masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
        audioToggleBtn.classList.remove('playing');
        if (audioStatusText) audioStatusText.textContent = 'AUDIO: OFF';
      }
    });
  }

  // Add click sound to interactive elements automatically
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, .nav-link, .btn, .channel-item, .skill-card, .project-card');
    if (target && !isMuted) {
      window.HeroAudio.playClick();
    }
  });

})();
