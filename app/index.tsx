import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';

type Operation = '+' | '-' | 'x' | '÷' | null;

export default function CalculatorScreen() {
  const { width, height } = useWindowDimensions();
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [resetDisplay, setResetDisplay] = useState(false);

  const GAP = 10;
  const PAD_H = 16;
  const PAD_BOTTOM = 48;
  const DISPLAY_H = Math.min(height * 0.3, 180);
  const KEYPAD_H = height - DISPLAY_H - PAD_BOTTOM;
  const ROWS = 5;
  const ROW_GAP = KEYPAD_H * 0.02;
  const BTN_H = (KEYPAD_H - (ROWS - 1) * ROW_GAP - PAD_BOTTOM) / ROWS;
  const USABLE_W = width - PAD_H * 2;
  const COLS = 4;
  const BTN_W = (USABLE_W - (COLS - 1) * GAP) / COLS;

  const handleNumber = useCallback((num: string) => {
    if (resetDisplay) {
      setDisplay(num);
      setResetDisplay(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  }, [display, resetDisplay]);

  const handleDecimal = useCallback(() => {
    if (resetDisplay) {
      setDisplay('0.');
      setResetDisplay(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, resetDisplay]);

  const handleOperation = useCallback((op: Operation) => {
    const current = parseFloat(display);
    if (previousValue !== null && operation && !resetDisplay) {
      const prev = parseFloat(previousValue);
      let result: number;
      switch (operation) {
        case '+': result = prev + current; break;
        case '-': result = prev - current; break;
        case 'x': result = prev * current; break;
        case '÷': result = current !== 0 ? prev / current : 0; break;
        default: result = current;
      }
      const resultStr = formatNumber(result);
      setPreviousValue(resultStr);
      setDisplay(resultStr);
    } else {
      setPreviousValue(display);
    }
    setOperation(op);
    setResetDisplay(true);
  }, [display, previousValue, operation, resetDisplay]);

  const handleEquals = useCallback(() => {
    if (previousValue === null || !operation) return;
    const current = parseFloat(display);
    const prev = parseFloat(previousValue);
    let result: number;
    switch (operation) {
      case '+': result = prev + current; break;
      case '-': result = prev - current; break;
      case 'x': result = prev * current; break;
      case '÷': result = current !== 0 ? prev / current : 0; break;
      default: result = current;
    }
    setDisplay(formatNumber(result));
    setPreviousValue(null);
    setOperation(null);
    setResetDisplay(true);
  }, [display, previousValue, operation]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setResetDisplay(false);
  }, []);

  const handleToggleSign = useCallback(() => {
    if (display === '0') return;
    setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
  }, [display]);

  const handlePercent = useCallback(() => {
    const value = parseFloat(display) / 100;
    setDisplay(formatNumber(value));
    setResetDisplay(true);
  }, [display]);

  const formatNumber = (num: number): string => {
    if (Number.isInteger(num) && Math.abs(num) < 1e15) {
      return num.toString();
    }
    const str = num.toPrecision(10);
    return parseFloat(str).toString();
  };

  const formatDisplay = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (value.endsWith('.')) return value;
    if (value.includes('.') && value.endsWith('0') && value.split('.')[1]?.length <= 10) {
      return value;
    }
    if (Math.abs(num) >= 1e12) {
      return num.toExponential(5);
    }
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const getFontSize = (value: string): number => {
    const len = value.replace(/[^0-9.]/g, '').length;
    if (len > 12) return 24;
    if (len > 9) return 32;
    if (len > 7) return 40;
    return 48;
  };

  const renderButton = (
    label: string,
    onPress: () => void,
    type: 'number' | 'operator' | 'function' | 'equals',
    wide: boolean = false,
  ) => {
    const isOperator = type === 'operator';
    const isEquals = type === 'equals';
    const isFunction = type === 'function';
    const isActiveOp = isOperator && operation === (label as Operation) && resetDisplay;
    const btnWidth = wide ? BTN_W * 2 + GAP : BTN_W;

    return (
      <TouchableOpacity
        style={[
          styles.button,
          { width: btnWidth, height: BTN_H, borderRadius: BTN_H / 2 },
          isFunction && styles.functionButton,
          isOperator && styles.operatorButton,
          isEquals && styles.equalsButton,
          isActiveOp && styles.activeOperatorButton,
        ]}
        onPress={onPress}
        activeOpacity={0.6}
      >
        <Text style={[
          styles.buttonText,
          isFunction && styles.functionText,
          (isOperator || isEquals) && styles.operatorText,
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.displayContainer, { height: DISPLAY_H }]}>
        {previousValue !== null && operation && (
          <Text style={styles.previousText}>
            {formatDisplay(previousValue)} {operation}
          </Text>
        )}
        <Text style={[styles.displayText, { fontSize: getFontSize(display) }]}>
          {formatDisplay(display)}
        </Text>
      </View>

      <View style={[styles.keypad, { paddingHorizontal: PAD_H, paddingBottom: PAD_BOTTOM, gap: ROW_GAP }]}>
        <View style={[styles.row, { gap: GAP }]}>
          {renderButton('AC', handleClear, 'function')}
          {renderButton('+/-', handleToggleSign, 'function')}
          {renderButton('%', handlePercent, 'function')}
          {renderButton('÷', () => handleOperation('÷'), 'operator')}
        </View>
        <View style={[styles.row, { gap: GAP }]}>
          {renderButton('7', () => handleNumber('7'), 'number')}
          {renderButton('8', () => handleNumber('8'), 'number')}
          {renderButton('9', () => handleNumber('9'), 'number')}
          {renderButton('x', () => handleOperation('x'), 'operator')}
        </View>
        <View style={[styles.row, { gap: GAP }]}>
          {renderButton('4', () => handleNumber('4'), 'number')}
          {renderButton('5', () => handleNumber('5'), 'number')}
          {renderButton('6', () => handleNumber('6'), 'number')}
          {renderButton('-', () => handleOperation('-'), 'operator')}
        </View>
        <View style={[styles.row, { gap: GAP }]}>
          {renderButton('1', () => handleNumber('1'), 'number')}
          {renderButton('2', () => handleNumber('2'), 'number')}
          {renderButton('3', () => handleNumber('3'), 'number')}
          {renderButton('+', () => handleOperation('+'), 'operator')}
        </View>
        <View style={[styles.row, { gap: GAP }]}>
          {renderButton('0', () => handleNumber('0'), 'number', true)}
          {renderButton('.', handleDecimal, 'number')}
          {renderButton('=', handleEquals, 'equals')}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  displayContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  previousText: {
    color: '#888',
    fontSize: 16,
    marginBottom: 4,
  },
  displayText: {
    color: '#ffffff',
    fontWeight: '300',
    textAlign: 'right',
  },
  keypad: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  row: {
    flexDirection: 'row',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '400',
  },
  functionButton: {
    backgroundColor: '#3a3a3a',
  },
  functionText: {
    color: '#f0a030',
    fontSize: 22,
  },
  operatorButton: {
    backgroundColor: '#e08a20',
  },
  operatorText: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '500',
  },
  activeOperatorButton: {
    backgroundColor: '#ffffff',
  },
  equalsButton: {
    backgroundColor: '#e08a20',
  },
});
