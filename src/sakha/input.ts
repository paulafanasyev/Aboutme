export const alaasInput = {
  keys: new Set<string>(),
  injected: new Set<string>(),
  joyX: 0,
  joyY: 0,
};

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  setKeys?: (codes: string[]) => void;
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
  }
}
