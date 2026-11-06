/* ==========================================================================
   Background music: a recorded tambura (audio/tambura.mp3) that loops without a gap,
   very quietly, behind the page.

   It plays by default. Browsers only allow sound after a visitor has touched the page,
   so if the browser blocks it, it starts on the first tap, click or key press and fades
   in over 4 seconds. The round sound button in the corner shows "Stop" when hovered,
   and pressing it stops the music. A visitor who stopped it won't hear it again on
   other pages, until they press play.

   Settings are in js/config.js: `music: false` removes the music and the button,
   `musicVolume` sets how loud it is.
   ========================================================================== */
(function () {
  "use strict";

  var config = window.NATYANJALI || {};
  var AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (config.music === false || !AudioContextClass) return;

  var SOURCE = "audio/tambura.mp3";
  var STORAGE_KEY = "natyanjali-music-stopped";
  // 0 is silent and 1 is the file at full volume. The recording itself is already soft,
  // so 0.12 is a very quiet background (about -44 dB).
  var VOLUME = typeof config.musicVolume === "number" ? config.musicVolume : 0.12;
  var FADE_IN = 4;   // seconds
  var FADE_OUT = 1.2;

  var context = null;
  var loading = null;
  var voice = null;      // the sound that is playing now
  var playing = false;   // what the visitor has asked for, which is true by default
  var attempt = 0;

  function wasStopped() {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch (error) { return false; }
  }
  function remember(stopped) {
    try {
      if (stopped) localStorage.setItem(STORAGE_KEY, "1"); else localStorage.removeItem(STORAGE_KEY);
    } catch (error) { /* private mode */ }
  }

  /* ------------------------------------------------------------------------
     The button: a speaker while the music plays, "Stop" when hovered,
     a muted speaker when it's stopped, "Play" when hovered
     ------------------------------------------------------------------------ */
  var button = document.createElement("button");
  button.type = "button";
  button.className = "sound-toggle";
  button.innerHTML =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<g class="ic-playing"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6"/><path d="M18 6.8a7.5 7.5 0 0 1 0 10.4"/></g>' +
    '<g class="ic-stop"><rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor"/></g>' +
    '<g class="ic-muted"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></g>' +
    '<g class="ic-play"><path d="M8 5.8v12.4L18.5 12 8 5.8z" fill="currentColor"/></g>' +
    "</svg>" +
    '<span class="sound-label"></span>';
  var label = button.querySelector(".sound-label");

  function show(on) {
    button.setAttribute("aria-pressed", on ? "true" : "false");
    var text = on ? "Stop music" : "Play music";
    button.setAttribute("aria-label", text);
    label.textContent = text;
  }

  /* ------------------------------------------------------------------------
     Playing and stopping
     ------------------------------------------------------------------------ */
  function ensureContext() {
    if (!context) context = new AudioContextClass();
    return context;
  }

  // The recording is fetched and decoded once
  function load(ctx) {
    if (!loading) {
      loading = fetch(SOURCE)
        .then(function (response) {
          if (!response.ok) throw new Error("music not found");
          return response.arrayBuffer();
        })
        .then(function (data) {
          return new Promise(function (resolve, reject) { ctx.decodeAudioData(data, resolve, reject); });
        });
    }
    return loading;
  }

  function play() {
    if (playing) return;
    playing = true;
    show(true);
    var ctx = ensureContext();
    var mine = ++attempt;
    // If the browser is still blocking sound, this waits and takes effect on the first tap
    ctx.resume();
    load(ctx).then(function (buffer) {
      if (!playing || mine !== attempt) return; // stopped while it was loading
      var source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + FADE_IN);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      voice = { source: source, gain: gain };
    }).catch(function () {
      // No recording, so there's nothing to control
      playing = false;
      if (button.parentNode) button.parentNode.removeChild(button);
    });
  }

  function halt() {
    playing = false;
    attempt++;
    show(false);
    if (!voice) return;
    var old = voice;
    voice = null;
    var now = context.currentTime;
    old.gain.gain.cancelScheduledValues(now);
    old.gain.gain.setValueAtTime(old.gain.gain.value, now);
    old.gain.gain.linearRampToValueAtTime(0, now + FADE_OUT);
    setTimeout(function () {
      try { old.source.stop(); } catch (error) { /* already stopped */ }
      old.gain.disconnect();
    }, FADE_OUT * 1000 + 200);
  }

  button.addEventListener("click", function () {
    removeUnlock();
    if (playing) {
      halt();
      remember(true);
    } else {
      remember(false);
      play();
    }
  });

  // Sound pauses while the tab is hidden
  document.addEventListener("visibilitychange", function () {
    if (!context || !playing) return;
    if (document.hidden) context.suspend(); else context.resume();
  });

  // Browsers block sound until the visitor touches the page, so the first touch starts it
  var unlockEvents = ["pointerup", "touchend", "keydown", "click"];
  function unlock(event) {
    if (button.contains(event.target)) return;
    if (context) context.resume().then(removeUnlock);
  }
  function removeUnlock() {
    unlockEvents.forEach(function (name) { document.removeEventListener(name, unlock, true); });
  }

  show(false);
  document.body.appendChild(button);
  if (!wasStopped()) {
    play();
    unlockEvents.forEach(function (name) { document.addEventListener(name, unlock, true); });
  }
})();
