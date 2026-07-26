import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── UTILS ───────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const randomChar = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&";
  return chars[Math.floor(Math.random() * chars.length)];
};

const glitchText = (target, setter, duration = 800) => {
  const start = Date.now();
  const interval = setInterval(() => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const revealed = Math.floor(progress * target.length);
    const scrambled = target
      .split("")
      .map((char, i) => {
        if (i < revealed) return char;
        if (char === " ") return " ";
        return randomChar();
      })
      .join("");
    setter(scrambled);
    if (progress >= 1) {
      setter(target);
      clearInterval(interval);
    }
  }, 40);
};

// ─── TYPEWRITER ───────────────────────────────────────────────────────────────

function Typewriter({ lines, speed = 35, onComplete, className = "" }) {
  const [displayed, setDisplayed] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    if (currentLine >= lines.length) {
      onComplete?.();
      return;
    }
    if (currentChar <= lines[currentLine].length) {
      const t = setTimeout(() => {
        setDisplayed((prev) => {
          const next = [...prev];
          next[currentLine] = lines[currentLine].slice(0, currentChar);
          return next;
        });
        setCurrentChar((c) => c + 1);
      }, speed);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [currentLine, currentChar, lines, speed, onComplete]);

  return (
    <div className={className}>
      {displayed.map((line, i) => (
        <div key={i} style={{ minHeight: "1.5em" }}>
          {line}
          {i === currentLine && currentLine < lines.length && (
            <span className="cursor-blink">█</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── STAGE 1: BOOT ────────────────────────────────────────────────────────────

const bootLines = [
  "[0x00] BIOS v2.4.1 — Romantic Systems Inc.",
  "[0x01] Initializing memory banks.............. OK",
  "[0x02] Loading emotional_core.dll............. OK",
  "[0x03] Mounting /dev/heart..................... OK",
  "[0x04] Scanning for encrypted payloads.......",
  "[0x05] >> 1 classified file detected: love.heart",
  "[0x06] File size: ∞ bytes",
  "[0x07] Clearance required: LEVEL 9 — EYES ONLY",
  "[0x08] Launching secure terminal...",
];

function StageBoot({ onComplete }) {
  const [done, setDone] = useState(false);
  return (
    <div className="stage-boot">
      <div className="terminal-header">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span className="terminal-title">secure_shell — 80×24</span>
      </div>
      <div className="terminal-body">
        <Typewriter
          lines={bootLines}
          speed={28}
          className="boot-lines"
          onComplete={() => setDone(true)}
        />
        {done && (
          <div className="boot-ready fade-in">
            <div className="ready-line">{">"} System ready.</div>
            <button className="btn-primary" onClick={onComplete}>
              <span className="btn-icon">⌲</span> Open Terminal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STAGE 2: ACCESS DENIED ───────────────────────────────────────────────────

function StageAccess({ onComplete }) {
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [shake, setShake] = useState(false);
  const [overriding, setOverriding] = useState(false);
  const [overrideProgress, setOverrideProgress] = useState(0);
  const [overrideLines, setOverrideLines] = useState([]);
  const inputRef = useRef(null);

  const wrongPasswords = [
    "ACCESS DENIED — Nice try my love.",
    "ACCESS DENIED — That's not even close my love.",
    "ACCESS DENIED — Really my love ? That's your best guess?",
    "ACCESS DENIED — I'm starting to worry about you love.",
  ];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const msg = wrongPasswords[Math.min(attempts.length, wrongPasswords.length - 1)];
    setAttempts((a) => [...a, { input, msg }]);
    setInput("");
    setShake(true);
    setTimeout(() => setShake(false), 500);

    if (attempts.length >= 1) {
      setTimeout(() => startOverride(), 1200);
    }
  };

  const startOverride = async () => {
    setOverriding(true);
    const lines = [
      ">> Anomaly detected in auth module...",
      ">> Bypassing password gate [BACKDOOR]...",
      ">> Injecting override token: 0xLOVE_UNLOCKED",
      ">> Decryption key acquired.",
      ">> Access granted. Welcome, love.",
    ];
    for (let i = 0; i < lines.length; i++) {
      await sleep(600);
      setOverrideLines((l) => [...l, lines[i]]);
      setOverrideProgress(((i + 1) / lines.length) * 100);
    }
    await sleep(1000);
    onComplete();
  };

  return (
    <div className={`stage-access ${shake ? "shake" : ""}`}>
      <div className="terminal-header">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span className="terminal-title">auth.exe — MAKAU.heart</span>
      </div>
      <div className="terminal-body">
        <div className="access-prompt">
          <div className="access-title">
            <span className="lock-icon">🔐</span>
            <span>CLASSIFIED FILE — AUTHENTICATION REQUIRED</span>
          </div>
          <div className="access-sub">Enter clearance code to proceed:</div>
        </div>

        {attempts.map((a, i) => (
          <div key={i} className="attempt-block">
            <div className="attempt-input">
              {">"} password: <span className="attempt-val">{a.input}</span>
            </div>
            <div className="attempt-denied">{a.msg}</div>
          </div>
        ))}

        {!overriding && (
          <div className="input-row">
            <span className="prompt-gt">{">"} password: </span>
            <input
              ref={inputRef}
              className="pw-input"
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="type anything..."
              autoFocus
            />
            <button className="btn-submit" onClick={handleSubmit}>
              ↵
            </button>
          </div>
        )}

        {overriding && (
          <div className="override-block fade-in">
            <div className="override-bar-wrap">
              <div
                className="override-bar"
                style={{ width: `${overrideProgress}%` }}
              />
            </div>
            <div className="override-lines">
              {overrideLines.map((l, i) => (
                <div key={i} className={`override-line ${i === overrideLines.length - 1 ? "override-line-last" : ""}`}>
                  {l}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STAGE 3: DECRYPTION ─────────────────────────────────────────────────────

const messageFragments = [
  { label: "RECIPIENT", raw: "██████", decoded: "Makau" },
  { label: "ORIGIN", raw: "██.██.████", decoded: "From the quiet parts of me" },
  { label: "SUBJECT", raw: "████████████", decoded: "Something I should have said sooner" },
  { label: "FRAGMENT_01", raw: "████ █████ ████", decoded: "You make ordinary days feel like something worth remembering." },
  { label: "FRAGMENT_02", raw: "████████ ████████", decoded: "The way you think, the way you laugh — it stays with me." },
  { label: "FRAGMENT_03", raw: "████ ██ ████████", decoded: "I choose you. Not just today. Every quiet Tuesday too." },
  { label: "SIGNATURE", raw: "█████████", decoded: "— yours, always." },
];

function StageDecrypt({ onComplete }) {
  const [decoded, setDecoded] = useState(Array(messageFragments.length).fill(false));
  const [glitched, setGlitched] = useState(Array(messageFragments.length).fill(""));
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    setGlitched(messageFragments.map((f) => f.raw));
  }, []);

  const decodeFragment = (i) => {
    if (decoded[i]) return;
    glitchText(messageFragments[i].decoded, (val) => {
      setGlitched((g) => {
        const next = [...g];
        next[i] = val;
        return next;
      });
    }, 900);
    setTimeout(() => {
      setDecoded((d) => {
        const next = [...d];
        next[i] = true;
        return next;
      });
    }, 950);
  };

  useEffect(() => {
    if (decoded.every(Boolean)) {
      setTimeout(() => setAllDone(true), 600);
    }
  }, [decoded]);

  return (
    <div className="stage-decrypt">
      <div className="terminal-header">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span className="terminal-title">decrypt.exe — MAKAU.heart</span>
      </div>
      <div className="terminal-body">
        <div className="decrypt-intro">
          <div className="decrypt-title">{">"} Encrypted payload loaded.</div>
          <div className="decrypt-sub">Click each line to decode.</div>
        </div>
        <div className="fragments">
          {messageFragments.map((f, i) => (
            <div
              key={i}
              className={`fragment ${decoded[i] ? "decoded" : "locked"}`}
              onClick={() => decodeFragment(i)}
            >
              <span className="frag-label">[{f.label}]</span>
              <span className={`frag-value ${decoded[i] ? "frag-decoded" : "frag-raw"}`}>
                {glitched[i] || f.raw}
              </span>
              {!decoded[i] && <span className="frag-hint">click to decode</span>}
            </div>
          ))}
        </div>
        {allDone && (
          <div className="decrypt-complete fade-in">
            <div className="complete-line">{">"} All fragments decrypted. 💗</div>
            <button className="btn-primary" onClick={onComplete}>
              Reveal the heart ↗
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STAGE 4: HEART ───────────────────────────────────────────────────────────

function HeartCanvas({ onTripleClick }) {
  const canvasRef = useRef(null);
  const clickCount = useRef(0);
  const clickTimer = useRef(null);
  const points = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });
  const animRef = useRef(null);
  const startTime = useRef(null);

  const handleClick = () => {
    clickCount.current += 1;
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      if (clickCount.current >= 3) onTripleClick?.();
      clickCount.current = 0;
    }, 600);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const phrase = "i love you · ";

    const init = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      points.current = [];

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const scale = Math.min(canvas.width, canvas.height) / 40;

      // Outer heart
      for (let t = 0; t < Math.PI * 2; t += 0.045) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        points.current.push({
          x: cx + x * scale,
          y: cy + y * scale,
          alpha: 0,
          targetAlpha: 0.7 + Math.random() * 0.3,
          delay: Math.random() * 2200,
          charIdx: Math.floor(Math.random() * phrase.length),
          phrase,
          size: 11 + Math.random() * 3,
          layer: "outer",
        });
      }

      // Inner layers
      for (let s = 0.25; s < 0.95; s += 0.18) {
        for (let t = 0; t < Math.PI * 2; t += 0.09) {
          const x = 16 * Math.pow(Math.sin(t), 3);
          const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          points.current.push({
            x: cx + x * scale * s,
            y: cy + y * scale * s,
            alpha: 0,
            targetAlpha: 0.3 + Math.random() * 0.35,
            delay: 800 + Math.random() * 2800,
            charIdx: Math.floor(Math.random() * phrase.length),
            phrase,
            size: 9 + Math.random() * 2,
            layer: "inner",
          });
        }
      }
    };

    const draw = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Soft glow background pulse
      const pulse = 0.5 + 0.5 * Math.sin(elapsed / 900);
      const grd = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 10,
        canvas.width / 2, canvas.height / 2, 220
      );
      grd.addColorStop(0, `rgba(255, 60, 100, ${0.04 + pulse * 0.04})`);
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Mouse parallax offset
      const mx = (mouse.current.x - canvas.width / 2) * 0.015;
      const my = (mouse.current.y - canvas.height / 2) * 0.015;

      points.current.forEach((p) => {
        if (elapsed > p.delay) {
          p.alpha += (p.targetAlpha - p.alpha) * 0.025;
        }
        const char = p.phrase[p.charIdx % p.phrase.length];
        ctx.save();
        ctx.font = `${p.size}px 'Courier New', monospace`;
        ctx.fillStyle = `rgba(255, 77, 109, ${p.alpha})`;
        ctx.shadowColor = `rgba(255, 60, 100, ${p.alpha * 0.8})`;
        ctx.shadowBlur = 6;
        ctx.fillText(char, p.x + mx, p.y + my);
        ctx.restore();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onTouch = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    };

    const onResize = () => {
      startTime.current = null;
      init();
    };

    init();
    animRef.current = requestAnimationFrame(draw);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="heart-canvas"
      style={{ width: "100%", height: "100%", cursor: "crosshair" }}
    />
  );
}

function StageHeart({ onComplete }) {
  const [easterEgg, setEasterEgg] = useState(false);
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowNext(true), 4500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="stage-heart">
      <div className="heart-overlay-top fade-in">
        <span className="heart-label">love.heart — decrypted</span>
      </div>

      <HeartCanvas onTripleClick={() => setEasterEgg(true)} />

      {easterEgg && (
        <div className="easter-egg fade-in">
          <div className="egg-inner">
            <div className="egg-emoji">💌</div>
            <div className="egg-text">You found it.</div>
            <div className="egg-sub">Triple tap. You've always paid attention to the details.</div>
          </div>
        </div>
      )}

      <div className="heart-overlay-bottom">
        <div className="heart-hint fade-in">move your cursor · the heart follows</div>
        {showNext && (
          <button className="btn-primary fade-in" onClick={onComplete}>
            Read the message →
          </button>
        )}
      </div>

      <div className="heart-corner-tl">ln: ∞ / type: organic_emotion</div>
      <div className="heart-corner-br">status: fully_decrypted ✓</div>
    </div>
  );
}

// ─── STAGE 5: FINAL MESSAGE ────────────────────────────────────────────────────

const finalMessage = {
  to: "Makau",
  from: "Someone who notices",
  date: new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" }),
  body: [
    "There are people who pass through your life quietly, and then there are people who rearrange it.",
    "You're the second kind.",
    "You make ordinary moments feel deliberate — like they were always meant to happen exactly this way.",
    "The way you think. The way you care without making it a performance. The way you show up.",
    "I've been carrying this for a while, and I figured it was time you knew:",
    "You are someone worth choosing.",
    "Not just on the good days. On the quiet Tuesdays too.",
    "So here it is — no encryption, no backdoor, no glitch.",
    "Just the truth: I love you, Makau.",
  ],
  ps: "P.S. You found the easter egg, didn't you? That tracks.",
};

function StageFinal({ onReset }) {
  const [visible, setVisible] = useState(false);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 200);
    const t2 = setTimeout(() => setShowReset(true), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`stage-final ${visible ? "fade-in" : ""}`}>
      <div className="letter-wrap">
        <div className="letter-paper">
          <div className="letter-header">
            <div className="letter-meta">
              <span>TO: {finalMessage.to}</span>
              <span>DATE: {finalMessage.date}</span>
            </div>
            <div className="letter-from">FROM: {finalMessage.from}</div>
            <div className="letter-divider" />
          </div>

          <div className="letter-body">
            {finalMessage.body.map((para, i) => (
              <p
                key={i}
                className="letter-para"
                style={{ animationDelay: `${0.3 + i * 0.25}s` }}
              >
                {para}
              </p>
            ))}
          </div>

          <div className="letter-footer">
            <div className="letter-ps">{finalMessage.ps}</div>
            <div className="letter-sig">— {finalMessage.from} 💗</div>
          </div>
        </div>

        {showReset && (
          <div className="reset-area fade-in">
            <button className="btn-ghost" onClick={onReset}>
              ↩ start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

const STAGES = ["boot", "access", "decrypt", "heart", "final"];

export default function App() {
  const [stage, setStage] = useState("boot");
  const next = () =>
    setStage((s) => STAGES[STAGES.indexOf(s) + 1] || "final");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #080808;
          color: #e8e8e8;
          font-family: 'Fira Code', monospace;
          min-height: 100vh;
        }

        :root {
          --pink: #ff4d6d;
          --pink-dim: #cc2244;
          --pink-glow: rgba(255, 77, 109, 0.25);
          --bg: #080808;
          --bg2: #0f0f0f;
          --bg3: #141414;
          --border: rgba(255, 77, 109, 0.15);
          --text-dim: rgba(255,255,255,0.35);
          --text-mid: rgba(255,255,255,0.6);
        }

        .fade-in {
          animation: fadeIn 0.7s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .shake {
          animation: shake 0.45s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }

        .cursor-blink {
          animation: blink 1s step-end infinite;
          margin-left: 2px;
          color: var(--pink);
        }
        @keyframes blink {
          50% { opacity: 0; }
        }

        /* ── SHARED TERMINAL ── */
        .terminal-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: #111;
          border-bottom: 1px solid var(--border);
          border-radius: 10px 10px 0 0;
        }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot.red    { background: #ff5f57; }
        .dot.yellow { background: #febc2e; }
        .dot.green  { background: #28c840; }
        .terminal-title {
          margin-left: 8px;
          font-size: 11px;
          color: var(--text-dim);
          letter-spacing: 0.05em;
        }
        .terminal-body {
          padding: 24px;
          flex: 1;
          overflow-y: auto;
        }

        /* ── STAGE BOOT ── */
        .stage-boot {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 680px;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 10px;
          box-shadow: 0 0 60px rgba(255,77,109,0.07);
          min-height: 420px;
          animation: fadeIn 0.5s ease;
        }
        .boot-lines {
          font-size: 13px;
          color: #b0ffb0;
          line-height: 1.9;
          letter-spacing: 0.03em;
        }
        .boot-ready {
          margin-top: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ready-line { color: var(--pink); font-size: 13px; }

        /* ── BUTTONS ── */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 11px 22px;
          background: transparent;
          border: 1px solid var(--pink);
          color: var(--pink);
          font-family: 'Fira Code', monospace;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s;
          border-radius: 2px;
          align-self: flex-start;
        }
        .btn-primary:hover {
          background: var(--pink-glow);
          box-shadow: 0 0 20px var(--pink-glow);
        }
        .btn-ghost {
          background: transparent;
          border: none;
          color: var(--text-dim);
          font-family: 'Fira Code', monospace;
          font-size: 11px;
          cursor: pointer;
          letter-spacing: 0.08em;
          transition: color 0.2s;
        }
        .btn-ghost:hover { color: var(--text-mid); }

        /* ── STAGE ACCESS ── */
        .stage-access {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 680px;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 10px;
          box-shadow: 0 0 60px rgba(255,77,109,0.07);
          min-height: 420px;
          animation: fadeIn 0.5s ease;
        }
        .access-prompt { margin-bottom: 20px; }
        .access-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--pink);
          margin-bottom: 8px;
          letter-spacing: 0.05em;
        }
        .access-sub { font-size: 12px; color: var(--text-dim); }
        .attempt-block { margin-bottom: 12px; }
        .attempt-input { font-size: 13px; color: var(--text-mid); }
        .attempt-val { color: var(--text-dim); text-decoration: line-through; }
        .attempt-denied { font-size: 12px; color: #ff4444; margin-top: 3px; }
        .input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
        }
        .prompt-gt { color: var(--pink); font-size: 13px; }
        .pw-input {
          flex: 1;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border);
          color: #fff;
          font-family: 'Fira Code', monospace;
          font-size: 13px;
          padding: 4px 6px;
          outline: none;
        }
        .pw-input::placeholder { color: var(--text-dim); }
        .btn-submit {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--pink);
          cursor: pointer;
          padding: 4px 10px;
          font-size: 14px;
          border-radius: 2px;
        }
        .override-block { margin-top: 20px; }
        .override-bar-wrap {
          width: 100%;
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
          margin-bottom: 14px;
          overflow: hidden;
        }
        .override-bar {
          height: 100%;
          background: var(--pink);
          box-shadow: 0 0 10px var(--pink);
          border-radius: 2px;
          transition: width 0.5s ease;
        }
        .override-lines { display: flex; flex-direction: column; gap: 6px; }
        .override-line { font-size: 12px; color: #88ff88; }
        .override-line-last { color: var(--pink); font-weight: 500; }

        /* ── STAGE DECRYPT ── */
        .stage-decrypt {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 680px;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 10px;
          box-shadow: 0 0 60px rgba(255,77,109,0.07);
          min-height: 480px;
          animation: fadeIn 0.5s ease;
        }
        .decrypt-intro { margin-bottom: 20px; }
        .decrypt-title { font-size: 13px; color: var(--pink); margin-bottom: 6px; }
        .decrypt-sub   { font-size: 12px; color: var(--text-dim); }
        .fragments { display: flex; flex-direction: column; gap: 8px; }
        .fragment {
          display: flex;
          align-items: baseline;
          gap: 12px;
          padding: 10px 12px;
          border: 1px solid transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          flex-wrap: wrap;
        }
        .fragment.locked:hover {
          border-color: var(--border);
          background: rgba(255,77,109,0.04);
        }
        .fragment.decoded {
          border-color: rgba(255,77,109,0.12);
          background: rgba(255,77,109,0.04);
          cursor: default;
        }
        .frag-label {
          font-size: 10px;
          color: var(--text-dim);
          letter-spacing: 0.1em;
          min-width: 130px;
          flex-shrink: 0;
        }
        .frag-value { font-size: 13px; flex: 1; }
        .frag-raw    { color: rgba(255,77,109,0.4); letter-spacing: 0.15em; }
        .frag-decoded { color: #fff; }
        .frag-hint {
          font-size: 10px;
          color: var(--text-dim);
          letter-spacing: 0.08em;
          opacity: 0.6;
        }
        .decrypt-complete {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .complete-line { font-size: 13px; color: #88ff88; }

        /* ── STAGE HEART ── */
        .stage-heart {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .heart-canvas {
          position: absolute;
          inset: 0;
        }
        .heart-overlay-top {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          color: var(--text-dim);
          letter-spacing: 0.12em;
          z-index: 10;
        }
        .heart-label { text-transform: uppercase; }
        .heart-overlay-bottom {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          z-index: 10;
        }
        .heart-hint { font-size: 11px; color: var(--text-dim); letter-spacing: 0.08em; }
        .heart-corner-tl {
          position: absolute;
          top: 20px;
          left: 20px;
          font-size: 10px;
          color: rgba(255,255,255,0.1);
          letter-spacing: 0.06em;
        }
        .heart-corner-br {
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 10px;
          color: rgba(255,255,255,0.1);
          letter-spacing: 0.06em;
        }
        .easter-egg {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          background: rgba(8,8,8,0.85);
          backdrop-filter: blur(6px);
        }
        .egg-inner {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .egg-emoji { font-size: 48px; }
        .egg-text  { font-size: 22px; color: var(--pink); }
        .egg-sub   { font-size: 14px; color: var(--text-mid); max-width: 300px; line-height: 1.7; }

        /* ── STAGE FINAL ── */
        .stage-final {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 60px 20px;
          background: #080808;
        }
        .letter-wrap {
          width: 100%;
          max-width: 620px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .letter-paper {
          background: #0e0e0e;
          border: 1px solid rgba(255,77,109,0.12);
          border-radius: 4px;
          padding: 40px;
          box-shadow: 0 0 80px rgba(255,77,109,0.06);
        }
        .letter-header { margin-bottom: 28px; }
        .letter-meta {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-dim);
          letter-spacing: 0.1em;
          margin-bottom: 6px;
        }
        .letter-from {
          font-size: 11px;
          color: var(--text-dim);
          letter-spacing: 0.1em;
          margin-bottom: 20px;
        }
        .letter-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, var(--pink) 0%, transparent 100%);
          opacity: 0.25;
        }
        .letter-body {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .letter-para {
          font-family: 'EB Garamond', serif;
          font-size: 17px;
          line-height: 1.75;
          color: rgba(255,255,255,0.82);
          animation: fadeIn 0.8s ease both;
        }
        .letter-para:nth-child(2) { font-style: italic; color: var(--pink); }
        .letter-footer {
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,77,109,0.1);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .letter-ps {
          font-size: 13px;
          color: var(--text-dim);
          font-style: italic;
        }
        .letter-sig {
          font-family: 'EB Garamond', serif;
          font-size: 16px;
          color: var(--pink);
        }
        .reset-area {
          display: flex;
          justify-content: center;
        }

        /* ── LAYOUT SHELL ── */
        .app-shell {
          min-height: 100vh;
          width: 100%;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .app-shell.full { padding: 0; align-items: stretch; }

        /* ── STAGE INDICATOR ── */
        .stage-pip-row {
          position: fixed;
          top: 16px;
          right: 20px;
          display: flex;
          gap: 6px;
          z-index: 100;
        }
        .stage-pip {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          transition: background 0.3s;
        }
        .stage-pip.active { background: var(--pink); box-shadow: 0 0 8px var(--pink); }
        .stage-pip.done   { background: rgba(255,77,109,0.4); }

        @media (max-width: 600px) {
          .terminal-body { padding: 16px; }
          .letter-paper  { padding: 24px 18px; }
          .letter-para   { font-size: 15px; }
          .frag-label    { min-width: 90px; font-size: 9px; }
        }
      `}</style>

      {/* Stage pips */}
      <div className="stage-pip-row">
        {STAGES.map((s, i) => {
          const cur = STAGES.indexOf(stage);
          return (
            <div
              key={s}
              className={`stage-pip ${i === cur ? "active" : i < cur ? "done" : ""}`}
            />
          );
        })}
      </div>

      <div className={`app-shell ${stage === "heart" || stage === "final" ? "full" : ""}`}>
        {stage === "boot"    && <StageBoot    onComplete={next} />}
        {stage === "access"  && <StageAccess  onComplete={next} />}
        {stage === "decrypt" && <StageDecrypt onComplete={next} />}
        {stage === "heart"   && <StageHeart   onComplete={next} />}
        {stage === "final"   && <StageFinal   onReset={() => setStage("boot")} />}
      </div>
    </>
  );
}
