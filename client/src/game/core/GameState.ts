export type FoundationState = {
  biomass: number;
  royalJelly: number;
  tilesDug: number;
  isPaused: boolean;
  scene: "boot" | "main-menu" | "game";
};

export const FOUNDATION_STATE: FoundationState = {
  biomass: 100,
  royalJelly: 0,
  tilesDug: 0,
  isPaused: false,
  scene: "game",
};

export function emitFoundationState(partial: Partial<FoundationState>) {
  Object.assign(FOUNDATION_STATE, partial);
  window.dispatchEvent(
    new CustomEvent<FoundationState>("fumiga:state", {
      detail: { ...FOUNDATION_STATE },
    }),
  );
}

export function emitFoundationStatus(message: string, tone: "neutral" | "success" | "warning" = "neutral") {
  window.dispatchEvent(
    new CustomEvent("fumiga:status", {
      detail: { message, tone },
    }),
  );
}

export function emitFoundationScene(scene: FoundationState["scene"]) {
  emitFoundationState({ scene });
  window.dispatchEvent(
    new CustomEvent("fumiga:scene-change", {
      detail: { scene },
    }),
  );
}

export function getFoundationState(): FoundationState {
  return { ...FOUNDATION_STATE };
}
