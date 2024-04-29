import {
  MutableRefObject,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./styles.module.css";
import { KEY_LABELS } from "./constants";
import { getSortedKeys, handleBackspace, isLetter, isMac } from "./utils";

interface IPropTypes {
  shortcut?: string | null;
  onChange?: (shortcut: string) => void;
  onDismiss?: () => void;
  placeholder?: string;
  className?: string;
  groupsWrapperClassName?: string;
  groupClassName?: string;
  placeholderClassName?: string;
  kbdClassName?: string;
  disabled?: boolean;
}

type RefType = HTMLInputElement;

export const HotkeyInput = forwardRef<RefType, IPropTypes>(
  (
    {
      shortcut: defaultShortcut,
      onChange,
      onDismiss,
      placeholder,
      className,
      groupsWrapperClassName,
      groupClassName,
      kbdClassName,
      placeholderClassName,
      disabled,
    },
    forwardedRef
  ) => {
    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
    const shouldReset = useRef<boolean>(true);
    const internalRef = useRef<RefType>();

    const setRefs = (instance: RefType | null) => {
      if (!instance) return;
      internalRef.current = instance;

      if (typeof forwardedRef === "function") {
        forwardedRef(instance);
      } else if (forwardedRef) {
        (forwardedRef as MutableRefObject<RefType | null>).current = instance;
      }
    };

    const getKey = (key: string) => {
      switch (true) {
        case key === " ":
          return "space";
        case /meta/i.test(key):
          return isMac() ? "command" : "meta";
        case /Alt/i.test(key):
          return isMac() ? "option" : "alt";
        case /Control/i.test(key):
          return "ctrl";
        case /Shift/i.test(key):
          return "shift";
        case /CapsLock/i.test(key):
          return "caps_lock";
        case /ArrowUp/i.test(key):
          return "up";
        case /ArrowDown/i.test(key):
          return "down";
        case /ArrowLeft/i.test(key):
          return "left";
        case /ArrowRight/i.test(key):
          return "right";
        default:
          return key.toLowerCase();
      }
    };

    const onKeydown = (e: React.KeyboardEvent) => {
      const { key } = e;

      const newPressedKeys: typeof pressedKeys = shouldReset.current
        ? new Set()
        : new Set(pressedKeys);
      const letterKeys = Array.from(newPressedKeys).filter(isLetter);

      switch (key) {
        case "Escape":
          clearPressedKeys();
          break;

        case "Backspace":
          handleBackspace(pressedKeys);
          break;

        default: {
          if (!isLetter(key) || letterKeys.length === 0) {
            newPressedKeys.add(getKey(key));
          }
        }
      }

      shouldReset.current = false;
      setPressedKeys(newPressedKeys);
    };

    const clearPressedKeys = () => {
      setPressedKeys(new Set<string>());
    };

    const onInputFocus = () => {
      clearPressedKeys();
    };

    const hasPressedKeys = pressedKeys.size > 0;

    const shortcut = hasPressedKeys
      ? Array.from(pressedKeys).join("+")
      : defaultShortcut || "";

    // restore to default shortcut
    const onBlur = () => {
      setPressedKeys(new Set(defaultShortcut?.split("+") || []));
      onDismiss?.();
    };

    useEffect(() => {
      if (!hasPressedKeys) return;
      onChange?.(shortcut);
    }, [pressedKeys]);

    useEffect(() => {
      setPressedKeys(new Set(defaultShortcut?.split("+") || []));
    }, [defaultShortcut]);

    const onWrapperClick = () => {
      internalRef.current?.focus();
    };

    const onKeyUp = () => {
      shouldReset.current = true;
    };

    return (
      <div
        className={`${styles["hotkey-input"]} ${className}`}
        onClick={onWrapperClick}
      >
        {(!hasPressedKeys || !shortcut) && !disabled && (
          <div className={`${styles["placeholder"]} ${placeholderClassName}`}>
            {placeholder}
          </div>
        )}

        <div
          className={`${styles["group-wrapper"]} ${styles["group-wrapper"]} ${groupsWrapperClassName}`}
        >
          {getSortedKeys(pressedKeys).map((key, index) => (
            <div className={`${styles["group"]} ${groupClassName}`} key={key}>
              <kbd className={`${styles["kbd"]} ${kbdClassName}`}>
                {KEY_LABELS[(isMac() ? `${key}_mac` : key) as keyof typeof KEY_LABELS] ||  KEY_LABELS[key] || key}
              </kbd>
              {index !== pressedKeys.size - 1 && <span>+</span>}
            </div>
          ))}
        </div>

        <input
          onKeyDown={onKeydown}
          onFocus={onInputFocus}
          ref={setRefs}
          value={shortcut}
          placeholder={placeholder}
          onBlur={onBlur}
          style={{ opacity: 0, width: 0, height: 0 }}
          disabled={disabled}
          onKeyUp={onKeyUp}
          readOnly
        />
      </div>
    );
  }
);
