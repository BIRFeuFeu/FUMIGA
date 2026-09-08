import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";

type HudState = {
  biomass: number;
  royalJelly: number;
  tilesDug: number;
  isPaused: boolean;
  isTacticalPause: boolean;
  timeScale: number;
  radialMenu: { visible: boolean; x: number; y: number };
  radialContext: "underground" | "surface";
  scene: "boot" | "main-menu" | "game";
};

type StatusState = {
  message: string;
  tone: "neutral" | "success" | "warning";
};

const initialState: HudState = {
  biomass: 100,
  royalJelly: 0,
  tilesDug: 72,
  isPaused: false,
  isTacticalPause: false,
  timeScale: 1,
  radialMenu: { visible: false, x: 0, y: 0 },
  radialContext: "underground",
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
    const onState = (event: Event) => setHud((event as CustomEvent<HudState>).detail);
    const onStatus = (event: Event) => setStatus((event as CustomEvent<StatusState>).detail);
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

  const tacticalLabel = hud.timeScale < 1 ? "SLOW / 10%" : "REALTIME";

  return (
    <main className={`game-shell ${hud.isTacticalPause ? "is-tactical" : ""}`}>
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
            <span>{hud.isTacticalPause ? "TACTICAL PAUSE" : hud.scene === "game" ? "NUCLEUS ONLINE" : hud.scene.toUpperCase()}</span>
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
            <div><span className="resource-label">BIOMASSA</span><strong>{hud.biomass.toString().padStart(3, "0")}</strong></div>
            <span className="resource-suffix">RUN</span>
          </div>
          <div className="resource-card jelly-card">
            <span className="resource-glyph">◈</span>
            <div><span className="resource-label">GELEIA REAL</span><strong>{hud.royalJelly.toString().padStart(3, "0")}</strong></div>
            <span className="resource-suffix">META</span>
          </div>
        </section>

        <div className="foundation-badge">
            <span className="badge-kicker">FASE 5</span>
            <span className="badge-title">SURFACE / PHEROMONES</span>
          <span className="badge-line" />
            <span className="badge-copy">BIOMASS / SIGNAL / COLLECTOR</span>
        </div>

        {hud.isTacticalPause && (
          <div className="tactical-readout">
            <span className="tactical-icon">◌</span>
            <div><span className="resource-label">TACTICAL TIME</span><strong>{tacticalLabel}</strong></div>
          </div>
        )}

        {hud.radialMenu.visible && (
          <div className="radial-menu" style={{ left: hud.radialMenu.x, top: hud.radialMenu.y }} aria-label="Menu radial de ordens">
            <div className="radial-core"><span>ORDENAR</span><small>solte para confirmar</small></div>
            <div className="radial-option radial-option-top"><b>↑</b><span>{hud.radialContext === "surface" ? "COLETA" : "CAVAR"}</span></div>
            <div className="radial-option radial-option-right"><b>→</b><span>{hud.radialContext === "surface" ? "FEROMÔNIO" : "OPERÁRIA"}</span></div>
            <div className="radial-option radial-option-bottom"><b>↓</b><span>CANCELAR</span></div>
          </div>
        )}

        <div className="interaction-hint">
          <span className="hint-key">SEGURE</span>
          <span>{hud.radialContext === "surface" ? "MARCAR COLETA" : "ABRIR ORDENS TÁTICAS"}</span>
        </div>

        <div className={`status-line ${status.tone}`}>
          <span className="status-prefix">SYS //</span>
          <span>{status.message}</span>
        </div>

        <footer className="hud-footer">
          <div className="footer-status"><span className="footer-label">CELLS DUG</span><span className="footer-value">{hud.tilesDug.toString().padStart(2, "0")} / 216</span></div>
          <div className="footer-status footer-right"><span className="footer-label">BUILD</span><span className="footer-value">SURFACE LAYER // 0.5</span></div>
        </footer>
      </div>
    </main>
  );
}
