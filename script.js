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

function nextScreen(id){

  const current =
    document.querySelector(
      ".screen.active"
    );

  const next =
    document.getElementById(
      `screen${id}`
    );

  if(!next) return;

  current?.classList.remove(
    "active"
  );

  next.classList.add(
    "active"
  );

  currentScreen = id;

  vibrate(20);
}

/* =========================
   CLOCK
========================= */

function updateClock(){

  const clock =
    document.getElementById(
      "clock"
    );

  if(!clock) return;

  const now = new Date();

  const time =
    now.toLocaleTimeString(
      [],
      {
        hour:"numeric",
        minute:"2-digit"
      }
    );

  clock.innerText = time;
}

setInterval(updateClock,1000);
updateClock();

/* =========================
   OTP EXPERIENCE
========================= */

const otpInputs =
document.querySelectorAll(
  ".otp-digit"
);

otpInputs.forEach(
(input,index)=>{

  input.addEventListener(
    "input",
    ()=>{

      input.value =
      input.value.replace(
        /\D/g,
        ""
      );

      if(
        input.value &&
        otpInputs[index+1]
      ){
        otpInputs[index+1]
        .focus();
      }

      checkOTPComplete();
    }
  );

  input.addEventListener(
    "keydown",
    (e)=>{

      if(
        e.key==="Backspace" &&
        !input.value &&
        otpInputs[index-1]
      ){

        otpInputs[index-1]
        .focus();
      }
    }
  );
});

function checkOTPComplete(){

  const code =
  [...otpInputs]
  .map(i=>i.value)
  .join("");

  if(code.length===6){

    showToast(
      "✓ Verified"
    );

    vibrate([100,50,100]);

    setTimeout(()=>{
      nextScreen(4);
    },900);
  }
}

/* =========================
   OTP TIMER
========================= */

function startResendTimer(){

  clearInterval(
    resendInterval
  );

  let seconds = 48;

  const timer =
  document.getElementById(
    "resendTimer"
  );

  resendInterval =
  setInterval(()=>{

    const mins =
      String(
        Math.floor(
          seconds/60
        )
      ).padStart(2,"0");

    const secs =
      String(
        seconds%60
      ).padStart(2,"0");

    if(timer){
      timer.innerText =
      `Resend in ${mins}:${secs}`;
    }

    seconds--;

    if(seconds < 0){

      clearInterval(
        resendInterval
      );

      timer.innerText =
      "Resend available";
    }

  },1000);
}

startResendTimer();

document
.getElementById(
  "resendBtn"
)
?.addEventListener(
  "click",
  ()=>{

    showToast(
      "OTP Sent"
    );

    startResendTimer();
  }
);

/* =========================
   ETA SELECTION
========================= */

function setETA(minutes){

  selectedETA = minutes;

  const buttons =
  document.querySelectorAll(
    ".eta-buttons button"
  );

  buttons.forEach(btn=>{

    btn.style.opacity = .5;

    if(
      btn.innerText.includes(
        minutes
      )
    ){
      btn.style.opacity = 1;
    }

  });

  showToast(
    `${minutes} mins selected`
  );
}

/* =========================
   LIVE TRACKING
========================= */

function startTracking(){

  nextScreen(8);
setTimeout(()=>{

  initMap();

  if(map){
    map.invalidateSize();
  }

},500);

  let seconds =
  selectedETA * 60;

  updateTrackingTimer(
    seconds
  );

  clearInterval(
    trackingInterval
  );

  trackingInterval =
  setInterval(()=>{

    seconds--;

    updateTrackingTimer(
      seconds
    );

    if(seconds <= 0){

      clearInterval(
        trackingInterval
      );

      nextScreen(9);

      showToast(
        "Trip completed"
      );
    }

  },1000);
}

function updateTrackingTimer(
  totalSeconds
){

  const timer =
  document.getElementById(
    "timer"
  );

  if(!timer) return;

  const mins =
  Math.floor(
    totalSeconds/60
  );

  const secs =
  totalSeconds%60;

  timer.innerText =
  `${String(mins)
    .padStart(2,"0")}
  :
  ${String(secs)
    .padStart(2,"0")}`
    .replace(/\s/g,'');
}

function arrivedSafely(){

  clearInterval(
    trackingInterval
  );

  showToast(
    "Contacts notified"
  );

  nextScreen(9);
}

/* =========================
   SOS HOLD RING
========================= */

const sosButton =
document.getElementById(
  "sosBtn"
);

const progressCircle =
document.getElementById(
  "progressCircle"
);

const circumference = 276;

let progress = 0;
let holdStart;

if(sosButton){

  [
    "mousedown",
    "touchstart"
  ].forEach(evt=>{

    sosButton
    .addEventListener(
      evt,
      startHold
    );

  });

  [
    "mouseup",
    "mouseleave",
    "touchend"
  ].forEach(evt=>{

    sosButton
    .addEventListener(
      evt,
      cancelHold
    );

  });
}

function startHold(){

  holdStart =
    Date.now();

  sosButton.classList.add(
    "holding"
  );

  holdTimer =
  setInterval(()=>{

    const elapsed =
      Date.now()
      - holdStart;

    progress =
      Math.min(
        elapsed /
        HOLD_DURATION,
        1
      );

    const offset =
      circumference -
      (
        circumference
        * progress
      );

    progressCircle
    .style
    .strokeDashoffset =
      offset;

    if(progress >= 1){

      clearInterval(
        holdTimer
      );

      activateSOS();
    }

  },16);

  vibrate(40);
}

function cancelHold(){

  clearInterval(
    holdTimer
  );

  progress = 0;

  if(progressCircle){

    progressCircle
    .style
    .strokeDashoffset =
      circumference;
  }

  sosButton?.classList
  .remove(
    "holding"
  );
}

/* =========================
   SOS FLOW
========================= */

function activateSOS(){

  nextScreen(10);

  showToast(
    "SOS Activated"
  );

  vibrate([
    200,
    100,
    200
  ]);

  let seconds = 165;

  updateSOSTimer(
    seconds
  );

  clearInterval(
    sosInterval
  );

  sosInterval =
  setInterval(()=>{

    seconds--;

    updateSOSTimer(
      seconds
    );

    if(seconds<=0){

      clearInterval(
        sosInterval
      );

      nextScreen(11);
    }

  },1000);
}

function updateSOSTimer(
  seconds
){

  const el =
  document.getElementById(
    "sosTimer"
  );

  if(!el) return;

  const mins =
  Math.floor(
    seconds/60
  );

  const secs =
  String(
    seconds%60
  ).padStart(2,"0");

  el.innerText =
    `${mins}:${secs}`;
}

function cancelSOS(){

  clearInterval(
    sosInterval
  );

  showToast(
    "Emergency cancelled"
  );

  nextScreen(12);
}

/* =========================
   HAPTICS
========================= */

function vibrate(pattern){

  if(
    navigator.vibrate
  ){

    navigator.vibrate(
      pattern
    );
  }
}

/* =========================
   TOAST SYSTEM
========================= */

function showToast(text){

  const toast =
  document.createElement(
    "div"
  );

  toast.className =
  "toast";

  toast.innerText =
  text;

  document.body
  .appendChild(
    toast
  );

  setTimeout(()=>{

    toast.classList.add(
      "show"
    );

  },10);

  setTimeout(()=>{

    toast.remove();

  },2500);
}

/* =========================
   PWA INSTALL
========================= */

if(
  "serviceWorker"
  in navigator
){

  window.addEventListener(
    "load",
    ()=>{

      navigator
      .serviceWorker
      .register(
        "./service-worker.js"
      );

    }
  );
}

/* =========================
   INIT
========================= */

window.addEventListener(
  "load",
  ()=>{

    nextScreen(1);

  }
);
let map;
let marker;

function initMap(){

  if(map) return;

  map = L.map("map")
  .setView(
    [6.5244,3.3792],
    15
  );

  L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom:19
    }
  ).addTo(map);

  marker = L.marker(
    [6.5244,3.3792]
  ).addTo(map);

  getLiveLocation();
}

function getLiveLocation(){

  if(
    navigator.geolocation
  ){

    navigator.geolocation
    .watchPosition(

      position=>{

        const lat =
        position.coords.latitude;

        const lng =
        position.coords.longitude;

        map.setView(
          [lat,lng],
          16
        );

        marker.setLatLng(
          [lat,lng]
        );

      },

      error=>{

        showToast(
          "Location unavailable"
        );

      },

      {
        enableHighAccuracy:true
      }

    );
  }
}