// Global Trading Kill-Switch State
let killSwitchState = false;

export function getGlobalKillSwitch(): boolean {
  return killSwitchState;
}

export function setGlobalKillSwitch(active: boolean) {
  killSwitchState = active;
}
