/* =========================
   Interactive Portfolio JS
   - Particles (background)
   - Stickman background fight (subtle)
   - Spawnable characters in hero
   - Typing headline
   - Card tilt/hover spark (basic)
   - EmailJS contact form (needs your IDs)
   - Accessibility & reduced-motion support
   ========================= */

/* ---------- Globals & util ---------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Setup year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Canvas sizing helper ---------- */
function sizeCanvas(c){
  if(!c) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = Math.floor(c.clientWidth * dpr);
  c.height = Math.floor(c.clientHeight * dpr);
  c.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
}

/* ---------- Particles background (subtle) ---------- */
(function(){
  const canvas = document.getElementById('particles-canvas');
  if(!canvas) return;
  canvas.style.zIndex = -2;
  canvas.classList.add('canvas-layer');
  const ctx = canvas.getContext('2d');
  const particles = [];
  let w = canvas.clientWidth = window.innerWidth;
  let h = canvas.clientHeight = window.innerHeight;
  canvas.width = w; canvas.height = h;

  const maxP = Math.min(120, Math.floor((w*h)/60000)); // scale by screen
  let mouse = {x:-9999,y:-9999, vx:0, vy:0};

  function init(){
    particles.length = 0;
    for(let i=0;i<maxP;i++){
      particles.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: Math.random()*1.6+0.3,
        vx: (Math.random()-0.5)*0.3,
        vy: (Math.random()-0.5)*0.3,
        alpha: Math.random()*0.5+0.15
      });
    }
  }
  init();

  function draw(){
    if(prefersReduced) return;
    ctx.clearRect(0,0,w,h);
    // subtle trail by semi-clear rectangle
    particles.forEach(p=>{
      p.x += p.vx + (mouse.vx*0.02);
      p.y += p.vy + (mouse.vy*0.02);
      // edges
      if(p.x<0) p.x = w;
      if(p.x> w) p.x = 0;
      if(p.y<0) p.y = h;
      if(p.y> h) p.y = 0;
      ctx.beginPath();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#66ffd4';
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  let lastMouse = {x:mouse.x,y:mouse.y};
  window.addEventListener('mousemove', e=>{
    const nx = e.clientX, ny = e.clientY;
    mouse.vx = nx - lastMouse.x;
    mouse.vy = ny - lastMouse.y;
    mouse.x = nx; mouse.y = ny;
    lastMouse.x = nx; lastMouse.y = ny;
  });

  function loopParticles(){
    draw();
    requestAnimationFrame(loopParticles);
  }
  loopParticles();

  // responsive
  window.addEventListener('resize', ()=>{
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    init();
  });
})();

/* ---------- Stickman fight (subtle wallpaper) ---------- */
(function(){
  const c = document.getElementById('stickman-canvas');
  if(!c) return;
  const ctx = c.getContext('2d');
  c.style.zIndex = -3;
  function resize(){
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Stickman constructor draws a simple stick figure
  function Stick(x,y,scale,color){
    this.x = x; this.y = y; this.scale = scale || 1; this.color = color || '#fff';
    this.state = 'idle'; // idle, attack, recover
    this.stateTime = 0;
    this.facing = 1; // 1 right, -1 left
  }
  Stick.prototype.update = function(dt){
    this.stateTime += dt;
    // random action
    if(this.state === 'idle' && this.stateTime > 1200 + Math.random()*2000){
      if(Math.random() < 0.55) { this.state = 'attack'; this.stateTime = 0; }
      else { this.state = 'idle'; this.stateTime = 0; }
    }
    if(this.state === 'attack' && this.stateTime > 600){
      this.state = 'recover'; this.stateTime = 0;
    }
    if(this.state === 'recover' && this.stateTime > 400) {
      this.state = 'idle'; this.stateTime = 0;
    }
  };
  Stick.prototype.draw = function(ctx){
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale*this.facing, this.scale);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    // lower globalAlpha to keep it subtle
    ctx.globalAlpha = 0.11;
    ctx.strokeStyle = '#ffffff';
    // head
    ctx.beginPath(); ctx.arc(0,-28,8,0,Math.PI*2); ctx.stroke();
    // body
    ctx.beginPath();
    let bodyY = -18;
    ctx.moveTo(0, bodyY);
    ctx.lineTo(0, 6);
    ctx.stroke();
    // arms
    ctx.beginPath();
    if(this.state === 'attack'){
      // arm extended
      ctx.moveTo(0,-14); ctx.lineTo(28, -6);
    } else {
      ctx.moveTo(0,-12); ctx.lineTo(18, -18);
    }
    ctx.stroke();
    // legs
    ctx.beginPath();
    ctx.moveTo(0,6);
    if(this.state==='attack'){
      ctx.lineTo(18,28); ctx.moveTo(0,6); ctx.lineTo(-8,28);
    } else {
      ctx.lineTo(18,28); ctx.moveTo(0,6); ctx.lineTo(-18,28);
    }
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
  };

  // create two stickmen
  let left = new Stick(window.innerWidth*0.25, window.innerHeight*0.8, 1.6);
  let right = new Stick(window.innerWidth*0.75, window.innerHeight*0.8, 1.6);
  right.facing = -1;

  // main loop
  let last = performance.now();
  function frame(ts){
    const dt = ts - last;
    last = ts;
    // clear
    ctx.clearRect(0,0,c.width,c.height);
    // update & draw
    left.update(dt); right.update(dt);
    left.draw(ctx); right.draw(ctx);

    // small "interaction": when left in attack and right in idle, right more likely to attack
    if(left.state === 'attack' && Math.random() < 0.006) right.state = 'attack';

    requestAnimationFrame(frame);
  }
  if(!prefersReduced) requestAnimationFrame(frame);
})();

/* ---------- Spawnable characters in sprites-canvas ---------- */
(function(){
  const c = document.getElementById('sprites-canvas');
  if(!c) return;
  c.style.zIndex = -1;
  const ctx = c.getContext('2d');
  let W = c.width = window.innerWidth;
  let H = c.height = window.innerHeight;
  window.addEventListener('resize', ()=>{ W = c.width = window.innerWidth; H = c.height = window.innerHeight; });

  const sprites = [];
  function spawn(x,y){
    const s = {
      x: x || Math.random()*(W*0.6)+W*0.2,
      y: y || Math.random()*(H*0.25)+H*0.45,
      vx: (Math.random()-0.5)*2.2,
      vy: - (6 + Math.random()*4),
      r: 18 + Math.random()*10,
      rot: 0,
      bounce: 0.6 + Math.random()*0.5,
      life: 6000 + Math.random()*7000,
      born: performance.now()
    };
    sprites.push(s);
    if(soundsEnabled) playSound('pop');
    return s;
  }

  // click in hero to spawn
  document.querySelector('.hero').addEventListener('click', function(e){
    // only spawn if click in hero area (not on buttons)
    if(e.target.closest('button') || e.target.closest('a')) return;
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left + rect.left; // page coords
    const y = e.clientY;
    spawn(x, y);
  });

  // spawn button
  document.getElementById('spawn-btn').addEventListener('click', ()=>spawn());

  // keyboard spawn K -> 5, M -> toggle sounds
  document.addEventListener('keydown', (e)=>{
    if(e.key.toLowerCase() === 'k'){ for(let i=0;i<5;i++) setTimeout(()=>spawn(), i*120); }
    if(e.key.toLowerCase() === 'm'){ toggleSounds(); }
  });

  function drawSprite(s, t){
    // simple cartoon character: head + body + eyes
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(Math.sin(t/120)*0.05 + (s.vx*0.01));
    // shadow
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, s.r*0.95, s.r*0.9, s.r*0.4, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;

    // body
    ctx.fillStyle = '#00ffcc';
    ctx.beginPath(); ctx.ellipse(0, 0, s.r*0.9, s.r*1.1, 0, 0, Math.PI*2); ctx.fill();

    // head
    ctx.fillStyle = '#042427';
    ctx.beginPath(); ctx.arc(0, -s.r*0.8, s.r*0.6, 0, Math.PI*2); ctx.fill();

    // eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-s.r*0.2, -s.r*0.9, s.r*0.12, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(s.r*0.2, -s.r*0.9, s.r*0.12, 0, Math.PI*2); ctx.fill();

    ctx.restore();
  }

  // physics & loop
  let last = performance.now();
  function loop(ts){
    const dt = ts - last;
    last = ts;
    if(!prefersReduced){
      ctx.clearRect(0,0,W,H);
      for(let i = sprites.length-1; i>=0; i--){
        const s = sprites[i];
        // physics
        s.vy += 0.28; // gravity
        s.x += s.vx;
        s.y += s.vy;
        // floor
        const floorY = H*0.85;
        if(s.y + s.r > floorY){
          s.y = floorY - s.r;
          s.vy *= -s.bounce;
          s.vx *= 0.9;
          if(Math.abs(s.vy) < 1) s.vy = 0;
        }
        drawSprite(s, ts);
        // small horizontal wrap
        if(s.x < -100) s.x = W + 100;
        if(s.x > W + 100) s.x = -100;

        // life check
        if(ts - s.born > s.life){
          sprites.splice(i,1);
        }
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* ---------- Typing headline (custom, colorful) ---------- */
(function(){
  const el = document.getElementById('typed');
  const words = ["Gamer 🎮","Developer 💻","Creator 🚀","Storyteller ✨","Level-Up Maker"];
  let wi = 0, ci = 0, deleting = false;
  const typingSpeed = 90, deletingSpeed = 35, pauseAfter = 900;

  function step(){
    const word = words[wi];
    if(!deleting){
      el.textContent = word.slice(0, ++ci);
      if(ci === word.length){
        deleting = true;
        setTimeout(step, pauseAfter);
        return;
      }
    } else {
      el.textContent = word.slice(0, ci--);
      if(ci < 0){
        deleting = false;
        wi = (wi+1) % words.length;
      }
    }
    setTimeout(step, deleting ? deletingSpeed : typingSpeed);
  }
  setTimeout(step, 600);
})();

/* ---------- Card tilt (mousemove) ---------- */
(function(){
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width/2;
      const cy = r.top + r.height/2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      const tiltX = (-dy * 8).toFixed(2);
      const tiltY = (dx * 10).toFixed(2);
      card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
    });
    card.addEventListener('mouseleave', ()=> card.style.transform = '');
    // keyboard: open preview on Enter
    const btn = card.querySelector('.card-open');
    btn.addEventListener('click', ()=> {
      // small demo: play a spark animation.
      sparkAt(card);
      // In a full build: open an embedded demo or modal.
      btn.textContent = 'Previewed ✓';
      setTimeout(()=> btn.textContent = 'Preview', 1200);
    });
  });

  // small spark effect using DOM circle
  function sparkAt(card){
    const el = document.createElement('div');
    el.style.position='absolute';
    el.style.pointerEvents='none';
    el.style.width='18px'; el.style.height='18px';
    el.style.background='radial-gradient(circle,#fff,#00ffcc)';
    el.style.borderRadius='50%';
    const r = card.getBoundingClientRect();
    el.style.left = `${r.left + r.width/2}px`;
    el.style.top  = `${r.top + r.height/2}px`;
    el.style.transform = 'translate(-50%,-50%)';
    el.style.zIndex = 60;
    document.body.appendChild(el);
    el.animate([{opacity:1, transform:'translate(-50%,-50%) scale(1)'},{opacity:0, transform:'translate(-50%,-50%) scale(3)'}], {duration:600, easing:'ease-out'});
    setTimeout(()=>el.remove(),650);
  }
})();

/* ---------- EmailJS contact form ---------- */
(function(){
  // Replace these constants with your EmailJS values
  // 1) Sign up at https://www.emailjs.com
  // 2) Add Gmail service (or SMTP) and create a template
  // 3) Template must use variables: from_name, reply_to, message
  // 4) Set the recipient email in the EmailJS template to: hiyagamingyt53@gmail.com
  const EMAILJS_USER = 'YOUR_USER_ID'; // <- replace with EmailJS USER ID
  const EMAILJS_SERVICE = 'YOUR_SERVICE_ID'; // <- replace with your Service ID
  const EMAILJS_TEMPLATE = 'YOUR_TEMPLATE_ID'; // <- replace with your Template ID

  try { emailjs.init(EMAILJS_USER); } catch(e) { /* EmailJS library not loaded or USER placeholder */ }

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const fallback = document.getElementById('mailto-fallback');

  fallback.addEventListener('click', ()=>{
    const name = form.from_name.value || '';
    const email = form.reply_to.value || '';
    const msg = form.message.value || '';
    const mailto = `mailto:hiyagamingyt53@gmail.com?subject=${encodeURIComponent('Website contact from '+name)}&body=${encodeURIComponent(msg + '\n\n— reply to: ' + email)}`;
    window.open(mailto,'_blank');
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    status.textContent = 'Sending...';

    if(EMAILJS_USER.includes('YOUR_') || EMAILJS_SERVICE.includes('YOUR_') || EMAILJS_TEMPLATE.includes('YOUR_')){
      // Developer didn't set keys: show guidance and fallback to mailto
      status.innerHTML = '⚠️ EmailJS not configured. Use the fallback button or add your EmailJS IDs in <code>script.js</code>.';
      form.reset();
      return;
    }

    // send via EmailJS
    emailjs.sendForm(EMAILJS_SERVICE, EMAILJS_TEMPLATE, this)
      .then(() => {
        status.textContent = '✅ Message sent! Thanks — I will reply soon.';
        confettiBurst();
        form.reset();
      }, (err) => {
        console.error('EmailJS error', err);
        status.textContent = '❌ Sending failed. Try the fallback email button.';
      });
  });
})();

/* ---------- Confetti (simple canvas) ---------- */
function confettiBurst(){
  const c = document.createElement('canvas');
  c.style.position = 'fixed';
  c.style.left='0'; c.style.top='0'; c.style.width='100%'; c.style.height='100%';
  c.style.zIndex = 9999; c.style.pointerEvents='none';
  document.body.appendChild(c);
  c.width = window.innerWidth; c.height = window.innerHeight;
  const ctx = c.getContext('2d');
  const pieces = [];
  const colors = ['#00ffcc','#ffcc00','#66ffd4','#ff77cc','#66aaff'];
  for(let i=0;i<80;i++){
    pieces.push({
      x: Math.random()*c.width,
      y: Math.random()*-c.height,
      vx: (Math.random()-0.5)*6,
      vy: Math.random()*6+2,
      size: 6+Math.random()*6,
      color: colors[Math.floor(Math.random()*colors.length)],
      rot: Math.random()*Math.PI*2,
      spr: Math.random()
    });
  }
  let frame = 0;
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    pieces.forEach(p=>{
      p.x += p.vx; p.y += p.vy; p.rot += 0.1;
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      ctx.restore();
    });
    frame++;
    if(frame < 160) requestAnimationFrame(draw);
    else { c.remove(); }
  }
  requestAnimationFrame(draw);
}

/* ---------- Simple sounds (muted by default) ---------- */
let soundsEnabled = false;
const soundMap = {
  pop: ['data:audio/wav;base64,UklGRngAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA='] // tiny silent placeholder
};
function playSound(name){
  if(!soundsEnabled) return;
  try{
    const a = new Audio(soundMap[name][0]);
    a.volume = 0.5; a.play();
  }catch(e){}
}
function toggleSounds(){
  soundsEnabled = !soundsEnabled;
  const old = document.getElementById('motion-toggle');
  if(old) old.setAttribute('aria-pressed', String(soundsEnabled));
  // feedback
  if(soundsEnabled) { /* maybe play intro sound */ }
}

/* ---------- Motion toggle (also respects prefers-reduced-motion) ---------- */
(function(){
  const btn = document.getElementById('motion-toggle');
  if(!btn) return;
  let enabled = !prefersReduced;
  btn.setAttribute('aria-pressed', String(enabled));
  btn.addEventListener('click', ()=>{
    enabled = !enabled;
    btn.setAttribute('aria-pressed', String(enabled));
    document.documentElement.style.setProperty('--motion-enabled', enabled ? '1' : '0');
    if(!enabled) {
      // stop heavy loops? For simplicity, reload to reflect reduced motion
      location.reload();
    }
  });
})();

/* ---------- Final note for developer (display in console) ---------- */
console.log('%cInteractive Portfolio Loaded — edit script.js to add EmailJS IDs and tweak behavior.', 'color:#00ffcc;font-weight:700');
