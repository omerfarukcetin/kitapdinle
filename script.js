const kitapSec = document.getElementById("kitapSec");
const bolumSec = document.getElementById("bolumSec");
const player = document.getElementById("player");
const speedSelect = document.getElementById("speed");
const resetBtn = document.getElementById("resetBtn");

let kitaplar = {};
let seciliKitap = "";
let bolumIndex = 0;
let currentPlaybackRate = 1;

// Kitapları JSON'dan yükle
fetch("bolumler.json")
  .then((res) => res.json())
  .then((data) => {
    kitaplar = data;

    // Kitapları dropdown'a ekle
    for (const kitapKey in kitaplar) {
      const option = document.createElement("option");
      option.value = kitapKey;
      option.textContent = kitapKey.replace(/-/g, " ").toUpperCase();
      kitapSec.appendChild(option);
    }

    // Önceki oturumdan devam et
    loadFromLocalStorage();
  });

// Kitap seçimi değişince bölümleri yükle
kitapSec.addEventListener("change", () => {
  seciliKitap = kitapSec.value;
  bolumIndex = 0;
  loadBolumler(seciliKitap);
  oynatBolum(bolumIndex);
});

// Bölüm değişince oynat
bolumSec.addEventListener("change", () => {
  bolumIndex = parseInt(bolumSec.value);
  oynatBolum(bolumIndex);
});

// Hız değiştiğinde uygula ve kaydet
speedSelect.addEventListener("change", () => {
  currentPlaybackRate = parseFloat(speedSelect.value);
  player.playbackRate = currentPlaybackRate;
  saveSession();
});

// MP3 bittiğinde sonraki bölüme geç
player.addEventListener("ended", () => {
  const bolumler = kitaplar[seciliKitap];
  if (bolumIndex < bolumler.length - 1) {
    bolumIndex++;
    bolumSec.value = bolumIndex;
    oynatBolum(bolumIndex);
  }
});

// Sürekli olarak ilerlemeyi kaydet
player.addEventListener("timeupdate", () => {
  if (!player.paused) {
    saveSession();
  }
});

// Kaldığın yeri sil
resetBtn.addEventListener("click", () => {
  localStorage.removeItem("lastSession");
  location.reload();
});

// Bölüm oynatıcı
function oynatBolum(index, resumeTime = 0, autoplay = true) {
  const bolumler = kitaplar[seciliKitap];
  const mp3 = bolumler[index];
  player.src = `${seciliKitap}/${mp3}`;
  player.playbackRate = currentPlaybackRate;

  if (autoplay) player.play();

  if (resumeTime > 0) player.currentTime = resumeTime;

  saveSession();
}

// Bölümleri yükle
function loadBolumler(kitapKey) {
  const bolumler = kitaplar[kitapKey];
  bolumSec.innerHTML = "";

  bolumler.forEach((bolum, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = bolum.replace(".mp3", "").replace("_", " ");
    bolumSec.appendChild(option);
  });

  bolumSec.disabled = false;
  bolumSec.value = bolumIndex;
}

// Oturumu kaydet
function saveSession() {
  localStorage.setItem(
    "lastSession",
    JSON.stringify({
      kitap: seciliKitap,
      bolum: bolumIndex,
      time: player.currentTime,
      speed: currentPlaybackRate
    })
  );
}

// Oturumu yükle
function loadFromLocalStorage() {
  const saved = JSON.parse(localStorage.getItem("lastSession"));
  if (saved) {
    seciliKitap = saved.kitap;
    bolumIndex = saved.bolum || 0;
    currentPlaybackRate = saved.speed || 1;
    kitapSec.value = seciliKitap;
    speedSelect.value = currentPlaybackRate;
    loadBolumler(seciliKitap);
    oynatBolum(bolumIndex, saved.time || 0, false);
  }
}
