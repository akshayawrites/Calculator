class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.expressionDisplay = document.getElementById('expression');
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = '';
        this.waitingForOperand = false;
        this.lastExpression = '';
        this.isDarkMode = true;
        
        this.initializeEventListeners();
        this.initializeModeToggle();
    }
    
    initializeModeToggle() {
        const modeToggle = document.getElementById('modeToggle');
        const body = document.body;
        
        // Load saved preference
        const savedMode = localStorage.getItem('calculatorMode');
        if (savedMode === 'light') {
            this.isDarkMode = false;
            modeToggle.classList.remove('active');
            body.classList.add('light-mode');
        } else {
            this.isDarkMode = true;
            modeToggle.classList.add('active');
            body.classList.remove('light-mode');
        }
        
        modeToggle.addEventListener('click', () => {
            this.isDarkMode = !this.isDarkMode;
            modeToggle.classList.toggle('active');
            body.classList.toggle('light-mode');
            localStorage.setItem('calculatorMode', this.isDarkMode ? 'dark' : 'light');
        });
    }
    
    initializeEventListeners() {
        // Number buttons
        document.querySelectorAll('.btn-number').forEach(button => {
            button.addEventListener('click', () => {
                this.handleNumber(button.dataset.number);
            });
        });
        
        // Operator buttons
        document.querySelectorAll('.btn-operator').forEach(button => {
            button.addEventListener('click', () => {
                this.handleOperator(button.dataset.operator);
            });
        });
        
        // Clear button
        document.querySelector('.btn-clear').addEventListener('click', () => {
            this.clear();
        });
        
        // Delete button
        document.querySelector('.btn-delete').addEventListener('click', () => {
            this.delete();
        });
        
        // Equals button
        document.querySelector('.btn-equals').addEventListener('click', () => {
            this.calculate();
        });
        
        // Sign toggle button
        const signBtn = document.querySelector('[data-action="sign"]');
        if (signBtn) {
            signBtn.addEventListener('click', () => {
                this.toggleSign();
            });
        }
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }
    
    toggleSign() {
        if (this.currentInput === '0') return;
        if (this.currentInput.startsWith('-')) {
            this.currentInput = this.currentInput.slice(1);
        } else {
            this.currentInput = '-' + this.currentInput;
        }
        this.updateDisplay();
    }

    handleNumber(number) {
        if (this.waitingForOperand) {
            this.currentInput = number;
            this.waitingForOperand = false;
        } else {
            if (number === '.' && this.currentInput.includes('.')) {
                return; // Prevent multiple decimal points
            }
            this.currentInput = this.currentInput === '0' ? number : this.currentInput + number;
        }
        this.updateDisplay();
    }
    
    handleOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operator) {
            const currentValue = this.previousInput || 0;
            const newValue = this.performCalculation(this.operator, currentValue, inputValue);
            
            this.currentInput = String(newValue);
            this.previousInput = newValue;
            this.updateDisplay();
        }
        
        this.waitingForOperand = true;
        this.operator = nextOperator;
        this.updateDisplay();
    }
    
    performCalculation(operator, prev, current) {
        switch (operator) {
            case '+':
                return prev + current;
            case '-':
                return prev - current;
            case '*':
                return prev * current;
            case '/':
                if (current === 0) {
                    alert('Cannot divide by zero');
                    return prev;
                }
                return prev / current;
            case '%':
                return prev % current;
            default:
                return current;
        }
    }
    
    calculate() {
        if (this.operator && this.previousInput !== '') {
            const inputValue = parseFloat(this.currentInput);
            const prevVal = parseFloat(this.previousInput);
            const result = this.performCalculation(this.operator, prevVal, inputValue);
            const opSymbol = this.getOperatorSymbol(this.operator);
            this.lastExpression = `${this.formatNumber(prevVal)} ${opSymbol} ${this.formatNumber(inputValue)} =`;
            
            this.currentInput = String(result);
            this.previousInput = '';
            this.operator = '';
            this.waitingForOperand = true;
            this.updateDisplay();
        }
    }
    
    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = '';
        this.waitingForOperand = false;
        this.lastExpression = '';
        this.updateDisplay();
    }
    
    delete() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Format the number to avoid floating point issues
        let displayValue = this.currentInput;
        
        // If it's a number, format it nicely
        if (!isNaN(displayValue) && displayValue !== '') {
            const num = parseFloat(displayValue);
            displayValue = this.formatNumber(num);
        }
        
        // Limit display length
        if (displayValue.length > 15) {
            const num = parseFloat(this.currentInput);
            if (num > 999999999999 || num < -999999999999) {
                displayValue = num.toExponential(6);
            } else {
                displayValue = this.formatNumber(num);
            }
        }
        
        this.display.textContent = displayValue;

        // Update expression line
        const hasActiveOp = this.operator && this.previousInput !== '' && !this.waitingForOperand;
        const opSymbol = this.getOperatorSymbol(this.operator);
        if (hasActiveOp) {
            this.expressionDisplay.textContent = `${this.formatNumber(this.previousInput)} ${opSymbol} ${this.currentInput}`;
        } else if (this.operator && this.previousInput !== '') {
            this.expressionDisplay.textContent = `${this.formatNumber(this.previousInput)} ${opSymbol}`;
        } else if (this.lastExpression) {
            this.expressionDisplay.textContent = this.lastExpression;
        } else {
            this.expressionDisplay.textContent = '';
        }
    }

    getOperatorSymbol(op) {
        switch (op) {
            case '*': return 'x';
            case '-': return '-';
            case '+': return '+';
            case '/': return '/';
            case '%': return '%';
            default: return '';
        }
    }

    formatNumber(value) {
        const num = parseFloat(value);
        if (!isFinite(num)) return String(value);
        if (Math.abs(num) >= 1e12 || (Math.abs(num) > 0 && Math.abs(num) < 1e-6)) {
            return num.toExponential(6);
        }
        if (num % 1 === 0) {
            // Add space separators for thousands
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }
        const parts = num.toFixed(10).replace(/\.?0+$/, '').split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return parts.join('.');
    }
    
    handleKeyboard(e) {
        e.preventDefault();
        
        if (e.key >= '0' && e.key <= '9') {
            this.handleNumber(e.key);
        } else if (e.key === '.') {
            this.handleNumber('.');
        } else if (e.key === '+') {
            this.handleOperator('+');
        } else if (e.key === '-') {
            this.handleOperator('-');
        } else if (e.key === '*') {
            this.handleOperator('*');
        } else if (e.key === '/') {
            this.handleOperator('/');
        } else if (e.key === '%') {
            this.handleOperator('%');
        } else if (e.key === 'Enter' || e.key === '=') {
            this.calculate();
        } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
            this.clear();
        } else if (e.key === 'Backspace') {
            this.delete();
        } else if (e.key === 's' || e.key === 'S') {
            this.toggleSign();
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

