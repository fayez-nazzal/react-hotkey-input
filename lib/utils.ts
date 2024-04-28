import { PLATFORM_TYPE } from "./constants";

export const isMac = () => navigator.platform.includes(PLATFORM_TYPE.MAC);

export const handleBackspace = (pressedKeys: Set<string>) => {
  const newPressedKeys = new Set(pressedKeys);
  newPressedKeys.delete(Array.from(pressedKeys).pop() || "");
  return newPressedKeys;
};

export const isLetter = (key: string) => key.length === 1 && key.match(/[a-z]/i);
  