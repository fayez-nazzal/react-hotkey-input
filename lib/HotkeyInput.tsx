import {
  MutableRefObject,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./styles.module.css";
import { MODIFIER_KEYS } from "./constants";
import { handleBackspace, isMac } from "./utils";

interface IPropTypes {
  shortcut?: string;
  onChange?: (shortcut: string) => void;
  placeholder?: string;
  className?: string;
  groupsWrapperClassName?: string;
  groupClassName?: string;
  placeholderClassName?: string;
  kbdClassName?: string;
  isValid?: (shortcut: string) => boolean;
  onInvalid?: (shortcut: string) => void;
  disabled?: boolean;
}

type RefType = HTMLInputElement;

export const HotkeyInput = forwardRef<RefType, IPropTypes>(
  (
    {
      shortcut: defaultShortcut,
      onChange,
      placeholder,
      className,
      groupsWrapperClassName,
      groupClassName,
      kbdClassName,
      placeholderClassName,
      isValid,
      onInvalid,
      disabled
    },
    forwardedRef
  ) => {
    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
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
          return MODIFIER_KEYS.SPACE;
        case /meta/i.test(key):
          return isMac() ? MODIFIER_KEYS.CMD : MODIFIER_KEYS.META;
        case /Alt/i.test(key):
          return MODIFIER_KEYS.ALT;
        case /Control/i.test(key):
          return MODIFIER_KEYS.CTRL;
        default:
          return key.toLowerCase();
      }
    };

    const onKeydown = (e: React.KeyboardEvent) => {
      const { key } = e;
      switch (key) {
        case "Enter":
          return;

        case "Escape":
          clearPressedKeys();
          return;

        case "Backspace":
          setPressedKeys(handleBackspace(pressedKeys));
          return;

        default: {
          const newPressedKeys = new Set(pressedKeys);

          newPressedKeys.add(getKey(key));
          const singleDigitKeys = Array.from(newPressedKeys).filter(
            (key) => key.length === 1
          );

          if (singleDigitKeys.length > 1) {
            return;
          }

          setPressedKeys(newPressedKeys);
          e.preventDefault();
        }
      }
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
    };

    useEffect(() => {
      if (!hasPressedKeys) return;
      onChange?.(shortcut);
    }, [pressedKeys]);

    useEffect(() => {
      if (!isValid) return;

      if (isValid(shortcut)) {
        internalRef.current?.blur();
        return;
      }

      onInvalid?.(shortcut);
    }, [shortcut]);

    useEffect(() => {
      setPressedKeys(new Set(defaultShortcut?.split("+") || []));
    }, [defaultShortcut]);

    const onWrapperClick = () => {
      internalRef.current?.focus();
    };

    return (
      <div
        className={`${styles["hotkey-input"]} ${className}`}
        onClick={onWrapperClick}
      >
        {!shortcut && !disabled && (
          <div className={`${styles["placeholder"]} ${placeholderClassName}`}>
            {placeholder}
          </div>
        )}

        <div
          className={`${styles["group-wrapper"]} ${styles["group-wrapper"]} ${groupsWrapperClassName}`}
        >
          {Array.from(pressedKeys).map((key, index) => (
            <div className={`${styles["group"]} ${groupClassName}`} key={key}>
              <kbd className={`${styles["kbd"]} ${kbdClassName}`}>{key}</kbd>
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
        />
      </div>
    );
  }
);
