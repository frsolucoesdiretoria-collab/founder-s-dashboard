import * as React from "react";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, placeholder = "0,00", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);

    // Format number to Brazilian currency (without R$ symbol, we'll add it manually)
    const formatCurrency = (num: number): string => {
      if (isNaN(num) || num === 0) return "";
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    };

    // Parse input string to number
    const parseInput = (input: string): number => {
      if (!input || input.trim() === "") return 0;
      
      // Remove all non-numeric characters
      let cleaned = input.replace(/\D/g, '');
      
      if (!cleaned || cleaned === '') return 0;
      
      // Remove leading zeros
      cleaned = cleaned.replace(/^0+/, '') || '0';
      
      // Convert to number (treating as cents)
      const num = parseFloat(cleaned) / 100;
      return isNaN(num) ? 0 : num;
    };

    // Format for display (treats input as cents)
    const formatInput = (input: string): string => {
      // Remove all non-numeric
      let cleaned = input.replace(/\D/g, '');
      
      // Remove leading zeros
      cleaned = cleaned.replace(/^0+/, '') || '0';
      
      if (cleaned === '0') return "";
      
      // Convert to number (cents)
      const num = parseFloat(cleaned) / 100;
      
      // Format as currency (without R$ prefix)
      return formatCurrency(num);
    };

    // Initialize display value from prop
    React.useEffect(() => {
      if (!isFocused) {
        if (value > 0) {
          setDisplayValue(formatCurrency(value));
        } else {
          setDisplayValue("");
        }
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;
      
      // Remove R$ prefix if present
      inputValue = inputValue.replace(/^R\$\s*/, '');
      
      // If input is empty, set to 0
      if (inputValue === "" || inputValue.trim() === "") {
        setDisplayValue("");
        onChange(0);
        return;
      }

      // Parse the input (treats as cents)
      const numValue = parseInput(inputValue);
      
      // Update display
      if (isFocused) {
        // While typing, show formatted value
        const formatted = formatInput(inputValue);
        setDisplayValue(formatted);
      } else {
        // If not focused, format normally
        if (numValue > 0) {
          setDisplayValue(formatCurrency(numValue));
        } else {
          setDisplayValue("");
        }
      }
      
      onChange(numValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Show raw cents value when focused for easier editing
      if (value > 0) {
        const cents = Math.round(value * 100).toString();
        setDisplayValue(cents);
      } else {
        setDisplayValue("");
      }
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      // Format on blur
      if (value > 0) {
        setDisplayValue(formatCurrency(value));
      } else {
        setDisplayValue("");
      }
      props.onBlur?.(e);
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          value={!isFocused && value > 0 ? `R$ ${displayValue}` : displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
