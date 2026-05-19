// =========================
// SCREEN NAVIGATION
// =========================

function nextScreen(screenId) {
  const screens = document.querySelectorAll(".screen");

  screens.forEach(screen => {
    screen.classList.remove("active");
  });

  document
    .getElementById(`screen${screenId}`)
    .classList.add("active");
}

// =========================
// OTP AUTO FOCUS
// =========================

const otpInputs =
document.querySelectorAll(
  ".otp-boxes input"
);

otpInputs.forEach((input, index) => {

  input.addEventListener(
    "input",
    () => {

      if (
        input.value.length === 1 &&
        otpInputs[index + 1]
      ) {
        otpInputs[index + 1].focus();
      }

    }
  );

  input.addEventListener(
    "keydown",
    (e) => {

      if (
        e.key === "Backspace" &&
        input.value === "" &&
        otpInputs[index - 1]
      ) {
        otpInputs[index - 1].focus();
      }

    }
  );
});

// =========================
// ETA SELECTION
// =========================

let selectedETA = 30;

function setETA(minutes) {
  selectedETA = minutes;

  const buttons =
  document.querySelectorAll(
    ".eta-buttons button"
  );

  buttons.forEach(btn => {
    btn.style.opacity = ".5";
  });

  event.target.style.opacity = "1";
}

// =========================
// LIVE TRACKING TIMER
// =========================

let trackingInterval;

function startTracking() {

  nextScreen(8);

  let seconds =
  selectedETA * 60;

  updateTrackingTimer(seconds);

  clearInterval(trackingInterval);

  trackingInterval =
  setInterval(() => {

    seconds--;

    updateTrackingTimer(seconds);

    if (seconds <= 0) {

      clearInterval(
        trackingInterval
      );

      nextScreen(9);
    }

  }, 1000);
}

function updateTrackingTimer(
  totalSeconds
) {

  const mins =
  Math.floor(totalSeconds / 60);

  const secs =
  totalSeconds % 60;

  const timer =
  document.getElementById(
    "timer"
  );

  timer.innerText =
  `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
}

// =========================
// SAFE ARRIVAL
// =========================

function arrivedSafely() {

  clearInterval(
    trackingInterval
  );

  nextScreen(9);
}

// =========================
// HOLD SOS BUTTON
// =========================

const sosButton =
document.getElementById(
  "sosBtn"
);

let holdTimer;
let holdDuration = 3000;

if (sosButton) {

  sosButton.addEventListener(
    "mousedown",
    startHold
  );

  sosButton.addEventListener(
    "touchstart",
    startHold
  );

  sosButton.addEventListener(
    "mouseup",
    cancelHold
  );

  sosButton.addEventListener(
    "mouseleave",
    cancelHold
  );

  sosButton.addEventListener(
    "touchend",
    cancelHold
  );
}

function startHold() {

  sosButton.innerText =
  "Holding...";

  holdTimer =
  setTimeout(() => {

    activateSOS();

  }, holdDuration);
}

function cancelHold() {

  clearTimeout(
    holdTimer
  );

  sosButton.innerText =
  "HOLD 3s FOR SOS";
}

// =========================
// SOS FLOW
// =========================

let sosInterval;

function activateSOS() {

  nextScreen(10);

  let seconds = 165;

  updateSOSTimer(
    seconds
  );

  clearInterval(
    sosInterval
  );

  sosInterval =
  setInterval(() => {

    seconds--;

    updateSOSTimer(
      seconds
    );

    if (seconds <= 0) {

      clearInterval(
        sosInterval
      );

      nextScreen(11);
    }

  }, 1000);
}

function updateSOSTimer(
  totalSeconds
) {

  const mins =
  Math.floor(totalSeconds / 60);

  const secs =
  totalSeconds % 60;

  document.getElementById(
    "sosTimer"
  ).innerText =
  `${mins}:${String(secs).padStart(2, "0")}`;
}

function cancelSOS() {

  clearInterval(
    sosInterval
  );

  nextScreen(12);
}

// =========================
// APP INITIALIZATION
// =========================

window.addEventListener(
  "load",
  () => {

    nextScreen(1);

  }
);

// =========================
// PREMIUM MICRO ANIMATIONS
// =========================

document.addEventListener(
  "click",
  (e) => {

    if (
      e.target.tagName ===
      "BUTTON"
    ) {

      e.target.animate([
        {
          transform:
          "scale(1)"
        },
        {
          transform:
          "scale(.96)"
        },
        {
          transform:
          "scale(1)"
        }
      ], {
        duration: 180
      });

    }

  }
);