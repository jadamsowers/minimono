import { useCallback, useRef } from 'react';

export const useKnobValue = (
  initialValue: number,
  onUpdate: (value: number) => void
) => {
  const [value, setValue] = React.useState(initialValue);
  const [isHovered, setIsHovered] = React.useState(false);
  const [lastValue, setLastValue] = React.useState(initialValue);
  const [lastUpdateTime, setLastUpdateTime] = React.useState(Date.now());

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (Math.abs(value - lastValue) > 0.01 && Date.now() - lastUpdateTime < 100) {
        setValue(lastValue);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [value, lastValue, lastUpdateTime]);

  const handleValueChange = useCallback(
    (newValue: number) => {
      onUpdate(newValue);
      onSetValue(newValue);
    },
    [onUpdate]
  );

  React.useImperativeHandle(
    useRef<HTMLInputElement>(),
    () => ({
      setValue: handleValueChange,
    })
  );

  return [value, setValue, setIsHovered] as const;
};
