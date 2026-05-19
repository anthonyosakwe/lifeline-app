/* =========================
   APP STATE
========================= */

let currentScreen = 1;
let selectedETA = 30;

let trackingInterval;
let sosInterval;
let resendInterval;
let holdTimer;

const HOLD_DURATION = 3000;

/* =========================
   SCREEN TRANSITIONS
========================= */

function nextScreen(id) {
  const current = document.querySelector(".screen.active");
  const next = document.getElementById(`screen${id}`);

  if (!next) return;

  current?.classList.remove("active");
  next.classList.add("active");
  currentScreen = id;

  vibrate(20);
}

/* =========================
   CLOCK
========================= */

function updateClock() {
  const clock = document.getElementById("clock");
  if (!clock) return;

  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  clock.innerText = time;
}

setInterval(updateClock, 1000);
updateClock();

/* =========================
   OTP EXPERIENCE
========================= */

const otpInputs = document.querySelectorAll(".otp-digit");

otpInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "");

    if (input.value && otpInputs[index + 1]) {
      otpInputs[index + 1].focus();
    }

    checkOTPComplete();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !input.value && otpInputs[index - 1]) {
      otpInputs[index - 1].focus();
    }
  });
});

function checkOTPComplete() {
  const code = [...otpInputs].map((i) => i.value).join("");

  if (code.length === 6) {
    showToast("✓ Verified");
    vibrate([100, 50, 100]);
    setTimeout(() => {
      nextScreen(4);
    }, 900);
  }
}

/* =========================
   OTP TIMER
========================= */

function startResendTimer() {
  clearInterval(resendInterval);

  let seconds = 48;
  const timer = document.getElementById("resendTimer");

  resendInterval = setInterval(() => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");

    if (timer) {
      timer.innerText = `Resend in ${mins}:${secs}`;
    }

    seconds--;

    if (seconds < 0) {
      clearInterval(resendInterval);
      if (timer) timer.innerText = "Resend available";
    }
  }, 1000);
}

startResendTimer();

document.getElementById("resendBtn")?.addEventListener("click", () => {
  showToast("OTP Sent");
  startResendTimer();
});

/* =========================
   ETA SELECTION
========================= */

function setETA(minutes, event) {
  selectedETA = minutes;

  const buttons = document.querySelectorAll(".eta-buttons button");
  buttons.forEach((btn) => {
    btn.style.opacity = 0.5;
  });

  if (event && event.target) {
    event.target.style.opacity = 1;
  }

  showToast(`${minutes} mins selected`);
}

/* =========================
   LIVE TRACKING
========================= */

function startTracking() {
  nextScreen(8);

  let seconds = selectedETA * 60;
  updateTrackingTimer(seconds);

  clearInterval(trackingInterval);

  trackingInterval = setInterval(() => {
    seconds--;
    updateTrackingTimer(seconds);

    if (seconds <= 0) {
      clearInterval(trackingInterval);
      nextScreen(9);
      showToast("Trip completed");
    }
  }, 1000);
}

function updateTrackingTimer(totalSeconds) {
  const timer = document.getElementById("timer");
  if (!timer) return;

  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  timer.innerText = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function arrivedSafely() {
  clearInterval(trackingInterval);
  showToast("Contacts notified");
  nextScreen(9);
}

/* =========================
   SOS HOLD RING
========================= */

const sosButton = document.getElementById("sosBtn");
const progressCircle = document.getElementById("progressCircle");
const circumference = 276;

let progress = 0;
let holdStart;

if (sosButton) {
  ["mousedown", "touchstart"].forEach((evt) => {
    sosButton.addEventListener(evt, startHold);
  });

  ["mouseup", "mouseleave", "touchend"].forEach((evt) => {
    sosButton.addEventListener(evt, cancelHold);
  });
}

function startHold() {
  if (!progressCircle) return;

  holdStart = Date.now();
  sosButton?.classList.add("holding");

  holdTimer = setInterval(() => {
    const elapsed = Date.now() - holdStart;
    progress = Math.min(elapsed / HOLD_DURATION, 1);

    const offset = circumference - circumference * progress;
    progressCircle.style.strokeDashoffset = offset;

    if (progress >= 1) {
      clearInterval(holdTimer);
      activateSOS();
    }
  }, 16);

  vibrate(40);
}

function cancelHold() {
  clearInterval(holdTimer);
  progress = 0;

  if (progressCircle) {
    progressCircle.style.strokeDashoffset = circumference;
  }

  sosButton?.classList.remove("holding");
}

/* =========================
   SOS FLOW
========================= */

function activateSOS() {
  clearInterval(trackingInterval);

  nextScreen(10);
  showToast("SOS Activated");
  vibrate([200, 100, 200]);

  let seconds = 165;
  updateSOSTimer(seconds);

  clearInterval(sosInterval);

  sosInterval = setInterval(() => {
    seconds--;
    updateSOSTimer(seconds);

    if (seconds <= 0) {
      clearInterval(sosInterval);
      nextScreen(11);
    }
  }, 1000);
}

function updateSOSTimer(seconds) {
  const el = document.getElementById("sosTimer");
  if (!el) return;

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  el.innerText = `${mins}:${secs}`;
}

function cancelSOS() {
  clearInterval(sosInterval);
  showToast("Emergency cancelled");
  nextScreen(12);
}

/* =========================
   HAPTICS
========================= */

function vibrate(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

/* =========================
   TOAST SYSTEM
========================= */

let activeToast = null;

function showToast(text) {
  if (activeToast) {
    activeToast.remove();
    activeToast = null;
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = text;

  document.body.appendChild(toast);
  activeToast = toast;

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.remove();
    if (activeToast === toast) activeToast = null;
  }, 2500);
}

/* =========================
   PWA INSTALL
========================= */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

/* =========================
   INIT
========================= */

window.addEventListener("load", () => {
  nextScreen(1);
});
