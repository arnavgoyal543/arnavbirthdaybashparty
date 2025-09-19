// ----- Preloader Logic -----
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => { preloader.classList.add('hidden'); }, 400);
});

// ----- NEW: Robo Theme Toggle Logic -----
const themeBtn = document.getElementById('theme-btn');
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('robo-theme');
});

// ----- Background Music Logic -----
const music = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');
let isPlaying = false;
music.volume = 0.2;

function toggleMusic() {
  if (isPlaying) {
    music.pause();
    musicBtn.textContent = '🔇';
  } else {
    music.play().catch(e => console.log("Autoplay was prevented."));
    musicBtn.textContent = '🎵';
  }
  isPlaying = !isPlaying;
}
musicBtn.addEventListener('click', toggleMusic);
document.body.addEventListener('click', () => {
  if (!isPlaying) {
    music.play().then(() => {
      isPlaying = true;
      musicBtn.textContent = '🎵';
    }).catch(() => {});
  }
}, { once: true });

// ----- Confetti Animation -----
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
let W = window.innerWidth, H = window.innerHeight;
canvas.width = W; canvas.height = H;

const confettiCount = 120;
const confettiColors = ['#ff6f91', '#ffe985', '#e0aaff', '#b3ffae', '#ffb347'];
let confetti = [];

function randomConfetti() {
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 8 + 4,
    d: Math.random() * confettiCount,
    color: confettiColors[Math.floor(Math.random()*confettiColors.length)],
    tilt: Math.floor(Math.random() * 12) - 6,
    tiltAngle: 0,
    tiltAngleInc: (Math.random() * 0.07) + .05
  };
}
for(let i=0;i<confettiCount;i++) confetti.push(randomConfetti());
function drawConfetti() {
  ctx.clearRect(0,0,W,H);
  for(let i=0; i<confetti.length; i++) {
    let c = confetti[i];
    ctx.beginPath();
    ctx.lineWidth = c.r;
    ctx.strokeStyle = c.color;
    ctx.moveTo(c.x + c.tilt + c.r/2, c.y);
    ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r/2);
    ctx.stroke();
  }
  updateConfetti();
}
function updateConfetti() {
  for(let i=0;i<confetti.length;i++){
    let c = confetti[i];
    c.y += (Math.cos(c.d) + 3 + c.r/2)/2;
    c.x += Math.sin(0.01*c.d);
    c.tiltAngle += c.tiltAngleInc;
    c.tilt = Math.sin(c.tiltAngle- (i%5)) * 8;
    // Reset confetti if out of screen
    if(c.y > H){
      confetti[i]=randomConfetti();
      confetti[i].y=0;
    }
  }
}
setInterval(drawConfetti, 25);
window.addEventListener('resize',()=>{
  W=window.innerWidth; H=window.innerHeight;
  canvas.width=W; canvas.height=H;
});

// ----- Balloon Animation -----
function makeBalloons() {
  let balloonArea = document.querySelector('.balloon-area');
  for(let i=1;i<=5;i++){
    let b = document.createElement('div');
    b.className = 'balloon';
    balloonArea.appendChild(b);
  }
}
makeBalloons();

// ----- Firebase Setup -----
const firebaseConfig = {
  apiKey: "AIzaSyB8aZDvHthUikdoJr2n-_QCXN3P3Ae0q-0",
  authDomain: "mychatty-95cdf.firebaseapp.com",
  databaseURL: "https://mychatty-95cdf-default-rtdb.firebaseio.com",
  projectId: "mychatty-95cdf",
  storageBucket: "mychatty-95cdf.firebasestorage.app",
  messagingSenderId: "356880043016",
  appId: "1:356880043016:web:2b8fffea05f0c5c8bb95bd",
  measurementId: "G-SDQ4YS5F3J"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ----- RSVP Form Logic (Updated) -----
document.getElementById('rsvp-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const song = document.getElementById('song').value.trim(); // Get song request
  const msg = document.getElementById('msg').value.trim();

  if (name.length < 2 || phone.length < 6) {
    document.getElementById('status').textContent = "Please fill in your details!";
    return;
  }

  document.getElementById('status').textContent = "Sending...";
  try {
    const rsvpData = {
      name: name,
      phone: phone,
      msg: msg,
      time: firebase.firestore.FieldValue.serverTimestamp()
    };
    // Only add song request if it's not empty
    if (song) {
      rsvpData.songRequest = song;
    }
    
    await db.collection('rsvp').add(rsvpData);

    document.getElementById('status').textContent = "🎊 RSVP Received! See you at the party!";
    document.getElementById('rsvp-form').reset();
  } catch (err) {
    console.error("Firebase write error:", err);
    document.getElementById('status').textContent = "Error! Please try again.";
  }
});

// ----- "Who's Coming?" Live Guest List Logic (No changes needed) -----
const guestList = document.getElementById('guest-list');
const noGuestsMessage = document.getElementById('no-guests-yet');
db.collection('rsvp').orderBy('time', 'asc').onSnapshot(snapshot => {
  guestList.innerHTML = '';
  if (snapshot.empty) {
    noGuestsMessage.style.display = 'block';
  } else {
    noGuestsMessage.style.display = 'none';
    snapshot.forEach(doc => {
      const guest = doc.data();
      const li = document.createElement('li');
      li.textContent = guest.name;
      guestList.appendChild(li);
    });
  }
}, err => {
  console.error("Error fetching guest list: ", err);
});