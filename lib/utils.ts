import { PLATFORM_TYPE } from "./constants";

export const isMac = () => navigator.platform.includes(PLATFORM_TYPE.MAC);

export const handleBackspace = (pressedKeys: Set<string>) => {
  const newPressedKeys = new Set(pressedKeys);
  newPressedKeys.delete(Array.from(pressedKeys).pop() || "");
  return newPressedKeys;
};

export const isLetter = (key: string) => key.length === 1 && key.match(/[a-z]/i);

export const getSortedKeys = (pressedKeys: Set<string>) => {
  const keys = Array.from(pressedKeys);
  keys.sort((a, b) => {
    if (a === "ctrl") return -1;
    if (b === "ctrl") return 1;
    if (a === "shift") return -1;
    if (b === "shift") return 1;
    if (a === "alt") return -1;
    if (b === "alt") return 1;
    return a.localeCompare(b);
  });
  return keys;
}