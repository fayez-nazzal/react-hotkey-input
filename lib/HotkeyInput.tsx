import {
  MutableRefObject,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";

interface IPropTypes {
  shortcut?: string;
  onChange?: (shortcut: string) => void;
  placeholder?: string;
  className?: string;
  groupsWrapperClassName?: string;
  groupClassName?: string;
  kbdClassName?: string;
  errorMessageClassName?: string;
  isValid?: (shortcut: string) => boolean;
  errorMessage?: string;
  unsavedMessage?: string;
  unsavedMessageClassName?: string;
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
      isValid,
      errorMessage,
      unsavedMessage,
      unsavedMessageClassName,
    },
    forwardedRef,
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
      const isMac = navigator.platform.includes("Mac");

      if (key === " ") {
        return "space";
      }

      if (key.match(/meta/i)) {
        return isMac ? "cmd" : "meta";
      }

      if (key.match(/Alt/i)) {
        return "alt";
      }

      if (key.match(/Control/i)) {
        return "ctrl";
      }

      return key.toLowerCase();
    };

    const onKeydown = (e: any) => {
      const { key } = e;

      if (key === "Enter") {
        return;
      }

      if (key === "Escape") {
        clearPressedKeys();
        return;
      }

      const newPressedKeys = new Set(pressedKeys);
      newPressedKeys.add(getKey(key));
      setPressedKeys(newPressedKeys);
      e.preventDefault();
    };

    const onKeyup = (e: any) => {
      internalRef.current?.blur();
      e.preventDefault();
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

    return (
      <div
        className={`flex flex-col gap-2 w-32 h-10 border ${className}`}
        onClick={onWrapperClick}
      >
        <div
          className={`flex items-center p-1 groupsWrapperClassName ${groupsWrapperClassName}`}
        >
          {Array.from(pressedKeys).map((key, index) => (
            <div className={`flex items-center gap-px ${groupClassName}`}>
              <kbd
                className={`px-1 py-0.5 rounded-md bg-gray-100 ${kbdClassName}`}
              >
                {key}
              </kbd>
              {index !== pressedKeys.size - 1 && <span>+</span>}
            </div>
          ))}
        </div>

        <input
          onKeyDown={onKeydown}
          onKeyUp={onKeyup}
          onFocus={onInputFocus}
          ref={setRefs}
          value={shortcut}
          placeholder={placeholder}
          className={className}
          style={{ opacity: 0, width: 0, height: 0 }}
          readOnly
        />

        {isValid && !isValid(shortcut) && (
          <div className={`text-xs text-red-500 ${errorMessageClassName}`}>
            {errorMessage}
          </div>
        )}

        {unsavedMessage && (
          <div className={`text-xs text-gray-500 ${unsavedMessageClassName}`}>
            {unsavedMessage}
          </div>
        )}
      </div>
    );
  },
);
