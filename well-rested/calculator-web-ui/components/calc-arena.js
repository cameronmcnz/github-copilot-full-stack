const BACKENDS = {
  fastify: {
    name: 'Fastify',
    url: 'http://localhost:3001',
    title: 'Steel Velocity',
    subtitle: 'Cold industrial speed and neon cyan thrust.'
  },
  fastapi: {
    name: 'FastAPI',
    url: 'http://localhost:3002',
    title: 'Biohazard Pulse',
    subtitle: 'Acid green reactor chamber with tactical glow.'
  },
  micronaut: {
    name: 'Micronaut',
    url: 'http://localhost:3003',
    title: 'Inferno Core',
    subtitle: 'Forged alloy, lava edges, and heavyweight impact.'
  }
};

const OPERATION_MAP = {
  add: {
    path: '/sum',
    params: ['augend', 'addend']
  },
  subtract: {
    path: '/difference',
    params: ['minuend', 'subtrahend']
  },
  multiply: {
    path: '/product',
    params: ['multiplicand', 'multiplier']
  },
  divide: {
    path: '/quotient',
    params: ['dividend', 'divisor']
  },
  remainder: {
    path: '/remainder',
    params: ['dividend', 'divisor']
  }
};

class CalcArena extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.backend = 'fastify';
    this.previous = null;
    this.current = '0';
    this.operation = null;
    this.justSolved = false;
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
    this.paintTheme();
    this.updateScreen();
  }

  bindEvents() {
    const root = this.shadowRoot;
    root.querySelectorAll('[data-backend]').forEach((button) => {
      button.addEventListener('click', () => {
        this.backend = button.getAttribute('data-backend');
        this.paintTheme();
        this.setStatus(`Switched to ${BACKENDS[this.backend].name}.`);
      });
    });

    root.querySelectorAll('[data-digit]').forEach((button) => {
      button.addEventListener('click', () => this.handleDigit(button.getAttribute('data-digit')));
    });

    root.querySelector('[data-action="dot"]').addEventListener('click', () => this.handleDot());
    root.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    root.querySelector('[data-action="sign"]').addEventListener('click', () => this.flipSign());

    root.querySelectorAll('[data-operation]').forEach((button) => {
      button.addEventListener('click', () => this.setOperation(button.getAttribute('data-operation')));
    });

    root.querySelector('[data-action="equals"]').addEventListener('click', () => this.solve());
  }

  handleDigit(digit) {
    if (this.justSolved && !this.operation) {
      this.current = '0';
      this.justSolved = false;
    }

    if (this.current === '0') {
      this.current = digit;
    } else {
      this.current += digit;
    }

    this.updateScreen();
  }

  handleDot() {
    if (!this.current.includes('.')) {
      this.current += '.';
      this.updateScreen();
    }
  }

  clear() {
    this.previous = null;
    this.current = '0';
    this.operation = null;
    this.justSolved = false;
    this.updateScreen();
    this.setStatus('Cleared.');
  }

  flipSign() {
    if (this.current === '0') {
      return;
    }
    this.current = this.current.startsWith('-') ? this.current.slice(1) : `-${this.current}`;
    this.updateScreen();
  }

  setOperation(operation) {
    if (this.previous !== null && this.operation && !this.justSolved) {
      this.solve();
      return;
    }

    this.previous = Number(this.current);
    this.current = '0';
    this.operation = operation;
    this.justSolved = false;
    this.updateScreen();
  }

  async solve() {
    if (this.operation === null || this.previous === null) {
      this.setStatus('Pick an operation first.');
      return;
    }

    const left = this.previous;
    const right = Number(this.current);
    const operationConfig = OPERATION_MAP[this.operation];

    const params = new URLSearchParams();
    params.set(operationConfig.params[0], String(left));
    params.set(operationConfig.params[1], String(right));

    const endpoint = `${BACKENDS[this.backend].url}${operationConfig.path}?${params.toString()}`;

    this.setStatus(`Calling ${BACKENDS[this.backend].name}: ${operationConfig.path}`);

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message = errorBody?.message || errorBody?.detail?.message || 'Request failed';
        this.setStatus(`${response.status}: ${message}`);
        return;
      }

      const result = await response.json();
      this.current = String(result);
      this.previous = null;
      this.operation = null;
      this.justSolved = true;
      this.updateScreen();
      this.setStatus(`Result from ${BACKENDS[this.backend].name}: ${result}`);
    } catch (error) {
      this.setStatus(`Network error: ${error?.message || 'Unable to reach backend'}`);
    }
  }

  updateScreen() {
    const valueNode = this.shadowRoot.querySelector('.display-value');
    const opNode = this.shadowRoot.querySelector('.display-op');

    valueNode.textContent = this.current;
    opNode.textContent = this.operation ? this.symbolFor(this.operation) : '·';
  }

  symbolFor(operation) {
    const symbols = {
      add: '+',
      subtract: '-',
      multiply: 'x',
      divide: '/',
      remainder: '%'
    };
    return symbols[operation] || '?';
  }

  setStatus(message) {
    this.shadowRoot.querySelector('.status').textContent = message;
  }

  paintTheme() {
    const shell = this.shadowRoot.querySelector('.shell');
    const info = BACKENDS[this.backend];
    shell.setAttribute('data-theme', this.backend);

    this.shadowRoot.querySelectorAll('[data-backend]').forEach((button) => {
      button.classList.toggle('active', button.getAttribute('data-backend') === this.backend);
    });

    this.shadowRoot.querySelector('.theme-title').textContent = info.title;
    this.shadowRoot.querySelector('.theme-subtitle').textContent = info.subtitle;
    this.shadowRoot.querySelector('.backend-url').textContent = info.url;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --shell-base: #12161f;
          --shell-frame: #292f3b;
          --display-bg: #0a0f16;
          --display-line: rgba(120, 255, 255, 0.26);
          --primary: #56f2ff;
          --primary-soft: rgba(86, 242, 255, 0.2);
          --accent: #b8fdff;
          --text: #ecf7ff;
          --muted: #8a98ab;
          --button-dark: #222b39;
          --button-fg: #d9e7fb;
          --danger: #e8ad6c;
          --lift: 0 24px 55px rgba(0, 0, 0, 0.6);
          display: block;
        }

        .shell {
          border-radius: 38px;
          border: 2px solid color-mix(in srgb, var(--shell-frame), #ffffff 10%);
          background:
            radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--primary), transparent 74%), transparent 45%),
            radial-gradient(circle at 80% 86%, color-mix(in srgb, var(--primary), transparent 88%), transparent 32%),
            linear-gradient(160deg, color-mix(in srgb, var(--shell-base), #000000 8%), var(--shell-base));
          box-shadow: var(--lift);
          padding: 24px;
          overflow: hidden;
          position: relative;
        }

        .shell::before {
          content: '';
          position: absolute;
          inset: 10px;
          border-radius: 30px;
          border: 1px solid color-mix(in srgb, var(--primary), transparent 70%);
          pointer-events: none;
        }

        .intro {
          display: grid;
          gap: 6px;
          margin-bottom: 16px;
        }

        .title {
          margin: 0;
          font-family: 'Orbitron', sans-serif;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--text);
          font-size: clamp(1.2rem, 2vw, 1.5rem);
        }

        .theme-title {
          margin: 0;
          font-size: 1.1rem;
          letter-spacing: 0.08em;
          color: var(--accent);
          text-transform: uppercase;
        }

        .theme-subtitle {
          margin: 0;
          color: var(--muted);
          font-size: 0.95rem;
        }

        .backend-switcher {
          margin: 14px 0 20px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .backend-switcher button {
          background: color-mix(in srgb, var(--button-dark), #000 18%);
          border: 1px solid color-mix(in srgb, var(--muted), transparent 45%);
          color: var(--button-fg);
          border-radius: 13px;
          padding: 10px 8px;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.74rem;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }

        .backend-switcher button:hover {
          transform: translateY(-2px);
          background: color-mix(in srgb, var(--button-dark), var(--primary) 20%);
        }

        .backend-switcher button.active {
          box-shadow: inset 0 0 0 1px var(--primary), 0 0 18px color-mix(in srgb, var(--primary), transparent 60%);
          background: color-mix(in srgb, var(--button-dark), var(--primary) 26%);
          color: var(--accent);
        }

        .display {
          min-height: 122px;
          margin-bottom: 18px;
          border-radius: 18px;
          padding: 16px;
          border: 1px solid color-mix(in srgb, var(--display-line), #fff 8%);
          background:
            linear-gradient(145deg, color-mix(in srgb, var(--display-bg), #000 14%), var(--display-bg));
          box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, 0.03),
            inset 0 0 24px color-mix(in srgb, var(--primary), transparent 90%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .display-op {
          font-family: 'Orbitron', sans-serif;
          color: var(--muted);
          font-size: 0.9rem;
          letter-spacing: 0.16em;
          text-align: right;
        }

        .display-value {
          font-family: 'Orbitron', sans-serif;
          color: var(--text);
          font-size: clamp(2rem, 8vw, 3.1rem);
          text-align: right;
          line-height: 1.1;
          overflow-wrap: anywhere;
        }

        .keypad {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .keypad button {
          border-radius: 16px;
          border: 1px solid color-mix(in srgb, var(--button-dark), #fff 7%);
          background:
            linear-gradient(
              160deg,
              color-mix(in srgb, var(--button-dark), #ffffff 2%),
              color-mix(in srgb, var(--button-dark), #000000 20%)
            );
          color: var(--button-fg);
          min-height: 58px;
          font-size: 1.1rem;
          font-family: 'Orbitron', sans-serif;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
        }

        .keypad button:active {
          transform: translateY(2px) scale(0.985);
        }

        .keypad button:hover {
          border-color: color-mix(in srgb, var(--primary), #fff 12%);
          box-shadow: 0 0 18px color-mix(in srgb, var(--primary), transparent 77%);
        }

        .keypad button.op,
        .keypad button.equal {
          color: #0e1319;
          background: linear-gradient(160deg, var(--primary), color-mix(in srgb, var(--primary), #ffffff 30%));
          font-weight: 700;
        }

        .keypad button.utility {
          color: var(--danger);
        }

        .backend-info {
          margin-top: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          color: var(--muted);
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          flex-wrap: wrap;
        }

        .status {
          color: var(--accent);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.85;
          }
          50% {
            opacity: 1;
          }
        }

        .shell[data-theme='fastapi'] {
          --shell-base: #0f190f;
          --shell-frame: #304d2f;
          --display-bg: #081108;
          --display-line: rgba(153, 255, 74, 0.33);
          --primary: #93ff2a;
          --primary-soft: rgba(147, 255, 42, 0.23);
          --accent: #d8ffc0;
          --text: #f4ffe8;
          --muted: #9db38e;
          --button-dark: #1f3022;
          --button-fg: #e3f8cf;
          --danger: #e0f87a;
        }

        .shell[data-theme='micronaut'] {
          --shell-base: #1b1110;
          --shell-frame: #60322c;
          --display-bg: #140a09;
          --display-line: rgba(255, 126, 77, 0.34);
          --primary: #ff6641;
          --primary-soft: rgba(255, 102, 65, 0.23);
          --accent: #ffd5c5;
          --text: #fff1ea;
          --muted: #c9a194;
          --button-dark: #3b201d;
          --button-fg: #ffe0d3;
          --danger: #ffd078;
        }

        @media (max-width: 760px) {
          .shell {
            padding: 18px;
            border-radius: 30px;
          }

          .backend-switcher {
            grid-template-columns: 1fr;
          }

          .keypad button {
            min-height: 54px;
          }
        }
      </style>

      <section class="shell" data-theme="fastify">
        <header class="intro">
          <h1 class="title">Calculator Arena</h1>
          <p class="theme-title"></p>
          <p class="theme-subtitle"></p>
        </header>

        <div class="backend-switcher">
          <button data-backend="fastify">Fastify</button>
          <button data-backend="fastapi">FastAPI</button>
          <button data-backend="micronaut">Micronaut</button>
        </div>

        <section class="display">
          <div class="display-op">·</div>
          <div class="display-value">0</div>
        </section>

        <section class="keypad" aria-label="calculator keypad">
          <button class="utility" data-action="clear">C</button>
          <button class="utility" data-action="sign">+/-</button>
          <button class="op" data-operation="remainder">%</button>
          <button class="op" data-operation="divide">/</button>

          <button data-digit="7">7</button>
          <button data-digit="8">8</button>
          <button data-digit="9">9</button>
          <button class="op" data-operation="multiply">x</button>

          <button data-digit="4">4</button>
          <button data-digit="5">5</button>
          <button data-digit="6">6</button>
          <button class="op" data-operation="subtract">-</button>

          <button data-digit="1">1</button>
          <button data-digit="2">2</button>
          <button data-digit="3">3</button>
          <button class="op" data-operation="add">+</button>

          <button data-digit="0">0</button>
          <button data-action="dot">.</button>
          <button class="equal" data-action="equals" style="grid-column: span 2;">=</button>
        </section>

        <footer class="backend-info">
          <span class="backend-url"></span>
          <span class="status">Ready.</span>
        </footer>
      </section>
    `;
  }
}

customElements.define('calc-arena', CalcArena);
