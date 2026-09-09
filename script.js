/**
 * SHEFFY SAMRA - LIVE CYBERPUNK PORTFOLIO CORE JAVASCRIPT ENGINE
 * Handles: Particles / Matrix Canvas, Web Audio SFX, 3D Hologram Tilt, 
 * Interactive Python & Bash Terminal, Playable Snake Arcade, Theme Engine & Toasts.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. WEB AUDIO API SYNTHESIZER SFX SYSTEM
  // ==========================================
  class SoundEngine {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
    }

    playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.05) {
      if (!this.enabled) return;
      try {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // audio might be blocked by browser policy until interaction
      }
    }

    click() { this.playTone(800, 'triangle', 0.04, 0.03); }
    hover() { this.playTone(450, 'sine', 0.03, 0.015); }
    success() { 
      this.playTone(523.25, 'sine', 0.08, 0.04);
      setTimeout(() => this.playTone(659.25, 'sine', 0.08, 0.04), 60);
      setTimeout(() => this.playTone(783.99, 'sine', 0.12, 0.05), 120);
    }
    action() { this.playTone(320, 'sawtooth', 0.1, 0.04); }
    eat() { this.playTone(880, 'sine', 0.06, 0.06); }
    gameOver() { this.playTone(180, 'sawtooth', 0.3, 0.08); }
  }

  const sfx = new SoundEngine();

  // Sound Toggle Button
  const soundBtn = document.getElementById('sound-btn');
  const soundIcon = document.getElementById('sound-icon');
  
  soundBtn.addEventListener('click', () => {
    sfx.enabled = !sfx.enabled;
    if (sfx.enabled) {
      soundIcon.className = 'fa-solid fa-volume-high';
      sfx.success();
      showToast('Sound effects enabled 🔊');
    } else {
      soundIcon.className = 'fa-solid fa-volume-xmark';
      showToast('Sound effects muted 🔇');
    }
  });


  // ==========================================
  // 2. BACKGROUND CANVAS (PARTICLES + MATRIX)
  // ==========================================
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Particles
  const particles = [];
  const particleCount = Math.min(Math.floor(width / 18), 75);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.radius = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.5 + 0.2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#00E5FF';
      ctx.globalAlpha = this.alpha;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Matrix Rain Mode State
  let matrixMode = false;
  const matrixChars = '01ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ987654321+-*/=';
  const fontSize = 14;
  let columns = Math.floor(width / fontSize);
  let drops = Array(columns).fill(1);

  function drawMatrix() {
    ctx.fillStyle = 'rgba(7, 9, 14, 0.08)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#00FF87';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  function animateCanvas() {
    if (matrixMode) {
      drawMatrix();
    } else {
      ctx.clearRect(0, 0, width, height);

      // Connect particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#00E5FF';
            ctx.globalAlpha = (1 - dist / 120) * 0.15;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });
    }
    requestAnimationFrame(animateCanvas);
  }
  animateCanvas();


  // ==========================================
  // 3. MAGNETIC CUSTOM CURSOR
  // ==========================================
  const cursor = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('cursor-dot');
  let mouseX = width / 2, mouseY = height / 2;
  let cursorX = mouseX, cursorY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover expansion on clickable elements
  const hoverTargets = document.querySelectorAll('a, button, input, textarea, .glass-card, .cmd-item');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovering');
      sfx.hover();
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovering');
    });
  });


  // ==========================================
  // 4. MULTI-STRING TYPING ANIMATION
  // ==========================================
  const typingElement = document.getElementById('typing-text');
  const phrases = [
    'Frontend Developer & UI Craftsman 🎨',
    'Python Enthusiast & Automator 🐍',
    'Telegram Bot Suite Architect 🤖',
    'Crafting Clean & Elegant Code ✨',
    'Always Building, Always Learning 🚀',
    'Humor is the Best Debugger 😄'
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingSpeed = 70;

  function typeEffect() {
    const currentPhrase = phrases[phraseIdx];

    if (isDeleting) {
      typingElement.textContent = currentPhrase.substring(0, charIdx - 1);
      charIdx--;
      typingSpeed = 35;
    } else {
      typingElement.textContent = currentPhrase.substring(0, charIdx + 1);
      charIdx++;
      typingSpeed = 75;
    }

    if (!isDeleting && charIdx === currentPhrase.length) {
      isDeleting = true;
      typingSpeed = 1800; // Pause at end of sentence
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      typingSpeed = 400;
    }

    setTimeout(typeEffect, typingSpeed);
  }
  typeEffect();


  // ==========================================
  // 5. 3D INTERACTIVE TILT HOLOGRAM CARD
  // ==========================================
  const heroCard = document.getElementById('hero-card-3d');
  if (heroCard) {
    const cardInner = heroCard.querySelector('.card-3d-inner');

    heroCard.addEventListener('mousemove', (e) => {
      const rect = heroCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      cardInner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    heroCard.addEventListener('mouseleave', () => {
      cardInner.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }


  // ==========================================
  // 6. INTERACTIVE TERMINAL & PYTHON SHELL
  // ==========================================
  const termTabs = document.querySelectorAll('.term-tab');
  const termTabContents = {
    'python': document.getElementById('tab-python-content'),
    'bash': document.getElementById('tab-bash-content'),
    'quick-help': document.getElementById('tab-quick-help-content')
  };

  termTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      sfx.click();
      termTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-tab');
      Object.keys(termTabContents).forEach(key => {
        if (key === target) {
          termTabContents[key].classList.remove('hidden');
        } else {
          termTabContents[key].classList.add('hidden');
        }
      });
    });
  });

  // Run Python Script Button
  const runBtn = document.getElementById('term-run-btn');
  const pythonOutput = document.getElementById('python-output');

  runBtn.addEventListener('click', () => {
    sfx.action();
    pythonOutput.innerHTML = `
      <span class="output-line text-cyan">&gt;&gt;&gt; Initializing Python 3.12 Virtual Runtime...</span>
      <span class="output-line text-yellow">&gt;&gt;&gt; Compiling whoami.py AST...</span>
    `;

    setTimeout(() => {
      pythonOutput.innerHTML += `
        <span class="output-line text-cyan">&gt;&gt;&gt; Executing whoami.say_hi()...</span>
        <span class="output-line text-green">&gt;&gt;&gt; "Thanks for visiting! Let's build something amazing together 🚀"</span>
        <span class="output-line text-muted">&gt;&gt;&gt; Process returned 0 with exit code SUCCESS (0.02s)</span>
      `;
      sfx.success();
    }, 450);
  });

  // Clear Terminal Button
  const clearBtn = document.getElementById('term-clear-btn');
  clearBtn.addEventListener('click', () => {
    sfx.click();
    pythonOutput.innerHTML = '<span class="output-line text-muted">&gt;&gt;&gt; Console stream cleared.</span>';
    document.getElementById('cli-history').innerHTML = '<div class="cli-line">Terminal history cleared. Type <span class="text-cyan">\'help\'</span> for commands.</div>';
  });

  // Interactive Bash CLI
  const cliInput = document.getElementById('cli-input');
  const cliHistory = document.getElementById('cli-history');

  const cliCommands = {
    'help': 'Available commands: whoami, skills, projects, contact, matrix, snake, theme, date, cat resume, clear',
    'whoami': 'Sheffy Samra — Frontend Developer, Python Enthusiast & Bot Builder (India 🇮🇳)',
    'skills': 'Languages: Python, JS, HTML5, CSS3, C, Java | Tools: Git, GitHub, VS Code',
    'projects': '1. SAMRABOTS Suite (Telegram)  2. Cyber Developer Portfolio  3. Cloud Media Extractor',
    'contact': 'Email: sheffysamra30@gmail.com | Telegram: @SAMRABOTS | Instagram: @sheffy_samra',
    'date': () => new Date().toUTCString(),
    'matrix': () => {
      matrixMode = !matrixMode;
      return matrixMode ? 'Matrix Rain Mode [ENABLED] 🟢' : 'Particle Constellation Mode [RESTORED] 🌌';
    },
    'snake': () => {
      document.getElementById('snake-section').scrollIntoView({ behavior: 'smooth' });
      return 'Navigating to Contribution Snake Arcade...';
    },
    'theme': () => {
      toggleThemeDropdown();
      return 'Opened theme selection palette.';
    },
    'cat resume': 'Experience: Frontend Web Dev & Python Bot Architecture | Focus: Modern UI/UX, Scalability, Clean Code',
    'sudo': 'Access granted: You are now supreme administrator of this portfolio ✨'
  };

  if (cliInput) {
    cliInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const rawCmd = cliInput.value.trim();
        const cmd = rawCmd.toLowerCase();
        cliInput.value = '';

        if (!cmd) return;

        sfx.action();

        const cmdLine = document.createElement('div');
        cmdLine.className = 'cli-line';
        cmdLine.innerHTML = `<span class="text-green">sheffy@cloud:~$</span> ${escapeHTML(rawCmd)}`;
        cliHistory.appendChild(cmdLine);

        if (cmd === 'clear') {
          cliHistory.innerHTML = '';
          return;
        }

        const respLine = document.createElement('div');
        respLine.className = 'cli-line text-muted';

        if (cliCommands[cmd]) {
          const output = typeof cliCommands[cmd] === 'function' ? cliCommands[cmd]() : cliCommands[cmd];
          respLine.innerHTML = output;
          sfx.success();
        } else {
          respLine.innerHTML = `command not found: <span class="text-pink">${escapeHTML(cmd)}</span>. Type <span class="text-cyan">'help'</span> for list.`;
        }

        cliHistory.appendChild(respLine);
        cliHistory.scrollTop = cliHistory.scrollHeight;
      }
    });
  }

  // Clickable commands in Help Grid
  document.querySelectorAll('.cmd-item').forEach(item => {
    item.addEventListener('click', () => {
      const cmd = item.getAttribute('data-cmd');
      // Switch to Bash tab
      document.querySelector('[data-tab="bash"]').click();
      cliInput.value = cmd;
      cliInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });
  });


  // ==========================================
  // 7. TECH STACK FILTERING
  // ==========================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.click();
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const cats = card.getAttribute('data-category');
        if (filter === 'all' || cats.includes(filter)) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    });
  });


  // ==========================================
  // 8. PLAYABLE GITHUB CONTRIBUTION SNAKE GAME
  // ==========================================
  const snakeCanvas = document.getElementById('snake-canvas');
  const snakeCtx = snakeCanvas.getContext('2d');
  const snakeOverlay = document.getElementById('game-overlay');
  const startBtn = document.getElementById('start-game-btn');
  const scoreEl = document.getElementById('snake-score');
  const highScoreEl = document.getElementById('snake-high-score');
  const statusEl = document.getElementById('snake-status');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayDesc = document.getElementById('overlay-desc');

  const gridSize = 15;
  const cols = snakeCanvas.width / gridSize;
  const rows = snakeCanvas.height / gridSize;

  let snake = [];
  let food = { x: 0, y: 0 };
  let dx = 1, dy = 0;
  let nextDx = 1, nextDy = 0;
  let gameInterval = null;
  let score = 0;
  let highScore = localStorage.getItem('sheffy_snake_hs') || 0;
  highScoreEl.textContent = String(highScore).padStart(4, '0');

  function initSnake() {
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    dx = 1; dy = 0;
    nextDx = 1; nextDy = 0;
    score = 0;
    scoreEl.textContent = '0000';
    statusEl.textContent = 'PLAYING';
    spawnFood();
  }

  function spawnFood() {
    food.x = Math.floor(Math.random() * cols);
    food.y = Math.floor(Math.random() * rows);
    // ensure food not on snake body
    for (let seg of snake) {
      if (seg.x === food.x && seg.y === food.y) {
        return spawnFood();
      }
    }
  }

  function updateSnake() {
    dx = nextDx;
    dy = nextDy;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision (wrap around or game over - wrap is smoother!)
    if (head.x < 0) head.x = cols - 1;
    if (head.x >= cols) head.x = 0;
    if (head.y < 0) head.y = rows - 1;
    if (head.y >= rows) head.y = 0;

    // Self collision
    for (let seg of snake) {
      if (seg.x === head.x && seg.y === head.y) {
        gameOver();
        return;
      }
    }

    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = String(score).padStart(4, '0');
      sfx.eat();
      if (score > highScore) {
        highScore = score;
        highScoreEl.textContent = String(highScore).padStart(4, '0');
        localStorage.setItem('sheffy_snake_hs', highScore);
      }
      spawnFood();
    } else {
      snake.pop();
    }

    drawSnakeGame();
  }

  function drawSnakeGame() {
    // Clear canvas
    snakeCtx.fillStyle = '#04060a';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

    // Draw background subtle grid (GitHub contribution grid look)
    snakeCtx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    for (let x = 0; x < snakeCanvas.width; x += gridSize) {
      snakeCtx.beginPath();
      snakeCtx.moveTo(x, 0);
      snakeCtx.lineTo(x, snakeCanvas.height);
      snakeCtx.stroke();
    }
    for (let y = 0; y < snakeCanvas.height; y += gridSize) {
      snakeCtx.beginPath();
      snakeCtx.moveTo(0, y);
      snakeCtx.lineTo(snakeCanvas.width, y);
      snakeCtx.stroke();
    }

    // Draw Food (Green glowing commit cube)
    snakeCtx.fillStyle = '#00FF87';
    snakeCtx.shadowColor = '#00FF87';
    snakeCtx.shadowBlur = 10;
    snakeCtx.fillRect(food.x * gridSize + 1, food.y * gridSize + 1, gridSize - 2, gridSize - 2);
    snakeCtx.shadowBlur = 0;

    // Draw Snake
    snake.forEach((seg, i) => {
      snakeCtx.fillStyle = i === 0 ? '#00E5FF' : '#00a3cc';
      if (i === 0) {
        snakeCtx.shadowColor = '#00E5FF';
        snakeCtx.shadowBlur = 8;
      } else {
        snakeCtx.shadowBlur = 0;
      }
      snakeCtx.fillRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });
    snakeCtx.shadowBlur = 0;
  }

  function gameOver() {
    clearInterval(gameInterval);
    gameInterval = null;
    sfx.gameOver();
    statusEl.textContent = 'GAME OVER';
    overlayTitle.textContent = 'SYSTEM OVERLOAD!';
    overlayDesc.textContent = `Your Final Score: ${score} commits recorded.`;
    startBtn.innerHTML = '<span class="btn-glow"></span><span class="btn-content"><i class="fa-solid fa-rotate-right"></i> PLAY AGAIN</span>';
    snakeOverlay.classList.remove('hidden');
  }

  startBtn.addEventListener('click', () => {
    sfx.success();
    snakeOverlay.classList.add('hidden');
    initSnake();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateSnake, 90);
  });

  // Controls handler
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'KeyW'].includes(e.code) && dy === 0) { nextDx = 0; nextDy = -1; e.preventDefault(); }
    if (['ArrowDown', 'KeyS'].includes(e.code) && dy === 0) { nextDx = 0; nextDy = 1; e.preventDefault(); }
    if (['ArrowLeft', 'KeyA'].includes(e.code) && dx === 0) { nextDx = -1; nextDy = 0; e.preventDefault(); }
    if (['ArrowRight', 'KeyD'].includes(e.code) && dx === 0) { nextDx = 1; nextDy = 0; e.preventDefault(); }
  });

  // Touch D-Pad buttons
  const dpadUp = document.getElementById('dpad-up');
  const dpadDown = document.getElementById('dpad-down');
  const dpadLeft = document.getElementById('dpad-left');
  const dpadRight = document.getElementById('dpad-right');

  if (dpadUp) {
    dpadUp.addEventListener('click', () => { if (dy === 0) { nextDx = 0; nextDy = -1; sfx.click(); } });
    dpadDown.addEventListener('click', () => { if (dy === 0) { nextDx = 0; nextDy = 1; sfx.click(); } });
    dpadLeft.addEventListener('click', () => { if (dx === 0) { nextDx = -1; nextDy = 0; sfx.click(); } });
    dpadRight.addEventListener('click', () => { if (dx === 0) { nextDx = 1; nextDy = 0; sfx.click(); } });
  }


  // ==========================================
  // 9. THEME SELECTOR & AMBIENT MODES
  // ==========================================
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeMenu = document.getElementById('theme-menu');
  const themeOptions = document.querySelectorAll('.theme-opt');

  function toggleThemeDropdown() {
    themeMenu.classList.toggle('show');
  }

  themeToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sfx.click();
    toggleThemeDropdown();
  });

  document.addEventListener('click', () => {
    themeMenu.classList.remove('show');
  });

  themeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const theme = opt.getAttribute('data-theme-val');
      document.documentElement.setAttribute('data-theme', theme);
      themeOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      sfx.success();
      showToast(`Theme switched to ${opt.textContent.trim()} 🎨`);
    });
  });


  // ==========================================
  // 10. TOAST NOTIFICATION & CLIPBOARD COPY
  // ==========================================
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  let toastTimer = null;

  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  const copyButtons = document.querySelectorAll('[data-email]');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const email = btn.getAttribute('data-email');
      navigator.clipboard.writeText(email).then(() => {
        sfx.success();
        showToast(`Copied ${email} to clipboard! 📋`);
      });
    });
  });


  // ==========================================
  // 11. CONTACT FORM HANDLER
  // ==========================================
  const contactForm = document.getElementById('portfolio-contact-form');
  const formStatus = document.getElementById('form-status-msg');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sfx.success();
      formStatus.className = 'form-status-msg success';
      formStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Transmission dispatched successfully! Opening mail client...';
      
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const subject = document.getElementById('form-subject').value;
      const message = document.getElementById('form-message').value;

      setTimeout(() => {
        window.location.href = `mailto:sheffysamra30@gmail.com?subject=${encodeURIComponent(subject + ' - from ' + name)}&body=${encodeURIComponent('From: ' + name + ' (' + email + ')\n\n' + message)}`;
      }, 700);
    });
  }


  // ==========================================
  // 12. MOBILE NAVIGATION DRAWER
  // ==========================================
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      sfx.click();
      navMenu.classList.toggle('open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

});
