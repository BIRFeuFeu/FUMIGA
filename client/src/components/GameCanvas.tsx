import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";

type HudState = {
  biomass: number;
  royalJelly: number;
  tilesDug: number;
  isPaused: boolean;
  scene: "boot" | "main-menu" | "game";
};

type StatusState = {
  message: string;
  tone: "neutral" | "success" | "warning";
};

const initialState: HudState = {
  biomass: 100,
  royalJelly: 0,
  tilesDug: 0,
  isPaused: false,
  scene: "boot",
};

const initialStatus: StatusState = {
  message: "INICIALIZANDO NÚCLEO",
  tone: "neutral",
};

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const [hud, setHud] = useState<HudState>(initialState);
  const [status, setStatus] = useState<StatusState>(initialStatus);

  useEffect(() => {
    const onState = (event: Event) => {
      const customEvent = event as CustomEvent<HudState>;
      setHud(customEvent.detail);
    };
    const onStatus = (event: Event) => {
      const customEvent = event as CustomEvent<StatusState>;
      setStatus(customEvent.detail);
    };
    window.addEventListener("fumiga:state", onState);
    window.addEventListener("fumiga:status", onStatus);
    return () => {
      window.removeEventListener("fumiga:state", onState);
      window.removeEventListener("fumiga:status", onStatus);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    });

    let handle: GameHandle | null = null;
    let disposed = false;
    createGameScene(engine, canvas).then((gameHandle) => {
      if (disposed) {
        gameHandle.dispose();
        return;
      }
      handle = gameHandle;
      engine.runRenderLoop(() => gameHandle.scene.render());
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  return (
    <main className="game-shell">
      <canvas ref={canvasRef} className="game-canvas" style={{ touchAction: "none" }} />
      <div className="game-vignette" aria-hidden="true" />

      <div className="game-interface">
        <header className="hud-topbar">
          <div className="brand-lockup">
            <span className="brand-mark">F</span>
            <div>
              <p className="eyebrow">COLONY PROTOCOL / 01</p>
              <h1>FUMIGA</h1>
            </div>
          </div>
          <div className="scene-readout">
            <span className="pulse-dot" />
            <span>{hud.scene === "game" ? "NUCLEUS ONLINE" : hud.scene.toUpperCase()}</span>
          </div>
          <button
            type="button"
            className={`pause-button ${hud.isPaused ? "is-paused" : ""}`}
            onClick={() => window.dispatchEvent(new CustomEvent("fumiga:pause-toggle"))}
            aria-label={hud.isPaused ? "Retomar jogo" : "Pausar jogo"}
          >
            <span>{hud.isPaused ? "▶" : "Ⅱ"}</span>
            {hud.isPaused ? "RETOMAR" : "PAUSA"}
          </button>
        </header>

        <section className="hud-resource-stack" aria-label="Recursos da colônia">
          <div className="resource-card biomass-card">
            <span className="resource-glyph">◆</span>
            <div>
              <span className="resource-label">BIOMASSA</span>
              <strong>{hud.biomass.toString().padStart(3, "0")}</strong>
            </div>
            <span className="resource-suffix">RUN</span>
          </div>
          <div className="resource-card jelly-card">
            <span className="resource-glyph">◈</span>
            <div>
              <span className="resource-label">GELEIA REAL</span>
              <strong>{hud.royalJelly.toString().padStart(3, "0")}</strong>
            </div>
            <span className="resource-suffix">META</span>
          </div>
        </section>

        <div className="foundation-badge">
          <span className="badge-kicker">FASE 2</span>
          <span className="badge-title">MAP GENERATOR</span>
          <span className="badge-line" />
          <span className="badge-copy">MATRIX / TILES / DIGGING</span>
        </div>

        <div className="interaction-hint">
          <span className="hint-key">CLICK</span>
          <span>ABRIR UMA CÉLULA DE TERRA</span>
        </div>

        <div className={`status-line ${status.tone}`}>
          <span className="status-prefix">SYS //</span>
          <span>{status.message}</span>
        </div>

        <footer className="hud-footer">
          <div className="footer-status">
            <span className="footer-label">CELLS DUG</span>
            <span className="footer-value">{hud.tilesDug.toString().padStart(2, "0")} / 216</span>
          </div>
          <div className="footer-status footer-right">
            <span className="footer-label">BUILD</span>
            <span className="footer-value">MAP GENERATOR // 0.2</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
