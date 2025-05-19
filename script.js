// ✅ Extracted common function
function blowOutCandle() {
  document.getElementById("flame").style.display = "none";
  document.getElementById("message").classList.remove("hidden");
  document.getElementById("blowBtn").classList.remove("hidden")
  launchConfetti();
}

// ✅ Existing button click still works
document.getElementById("blowBtn").addEventListener("click", blowOutCandle);

// ✅ Confetti function unchanged
function launchConfetti() {
  const duration = 2 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// ✅ Microphone Blow Detection
async function startMic() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const micSource = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    micSource.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    // function detectBlow() {
    //   analyser.getByteFrequencyData(dataArray);
    //   const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;

    //   if (volume > 60 && document.getElementById("flame").style.display !== "none") {
    //     blowOutCandle();
    //   }

    //   requestAnimationFrame(detectBlow);
    // }

    let flickerCooldown = false;

    function detectBlow() {
      analyser.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;

      const flame = document.getElementById("flame");

      // 💨 Strong blow
      if (volume > 70 && flame.style.display !== "none") {
        blowOutCandle();
      }
      // 💨 Medium blow triggers flicker animation
      else if (volume > 30 && volume <= 70 && !flickerCooldown && flame.style.display !== "none") {
        flame.classList.add("flame-flicker");
        flickerCooldown = true;

        // Remove class after animation ends
        setTimeout(() => {
          flame.classList.remove("flame-flicker");
          flickerCooldown = false;
        }, 400);
      }

      requestAnimationFrame(detectBlow);
    }


    detectBlow();
  } catch (err) {
    console.error("Microphone access denied or not supported.", err);
  }
}

// ✅ Start microphone listening
startMic();

document.getElementById("musicToggleBtn").addEventListener("click", () => {
  const music = document.getElementById("birthdayMusic");
  if (music.paused) {
    music.play();
  } else {
    music.pause();
  }
});

document.getElementById("startButton").addEventListener("click", () => {
  document.getElementById("welcomeOverlay").style.display = "none";
  startMic();
  // startMusicOnce(); // Optional: start music on permission screen
  const music = document.getElementById("birthdayMusic");
  if (music && music.paused) {
    music.play().catch(e => console.log("Music autoplay blocked:", e));
  }
});
