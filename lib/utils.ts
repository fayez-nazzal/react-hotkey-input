import { KEY_LABELS, PLATFORM_TYPE } from "./constants";

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
    if (KEY_LABELS[a] || KEY_LABELS[`${a}_mac`]) return -1;
    if (KEY_LABELS[b] || KEY_LABELS[`${b}_mac`]) return 1;
    if (isLetter(a) && !isLetter(b)) return -1;
    if (!isLetter(a) && isLetter(b)) return 1;
    return a.localeCompare(b);
  });
  return keys;
}