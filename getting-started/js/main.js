/**
 * main.js
 * Web Components calculator using logic from calculator.js.
 */

(function () {
    'use strict';

    const logic = (typeof window !== 'undefined' && window.CalculatorLogic)
        ? window.CalculatorLogic
        : {
            add: (a, b) => a + b,
            subtract: (a, b) => a - b,
            multiply: (a, b) => a * b,
            divide: (a, b) => a / b
        };

    class IosCalculator extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });

            this.current = '0';
            this.previous = null;
            this.operator = null;
            this.waitingForOperand = false;
        }

        connectedCallback() {
            this.render();
            this.bindEvents();
            this.updateDisplay();
        }

        bindEvents() {
            this.shadowRoot.querySelector('.keys').addEventListener('click', (event) => {
                const button = event.target.closest('button');
                if (!button) {
                    return;
                }

                const value = button.dataset.value;
                const action = button.dataset.action;

                if (action === 'digit') {
                    this.inputDigit(value);
                    return;
                }

                if (action === 'decimal') {
                    this.inputDecimal();
                    return;
                }

                if (action === 'clear') {
                    this.clear();
                    return;
                }

                if (action === 'sign') {
                    this.toggleSign();
                    return;
                }

                if (action === 'percent') {
                    this.toPercent();
                    return;
                }

                if (action === 'operator') {
                    this.handleOperator(value);
                    return;
                }

                if (action === 'equals') {
                    this.calculate();
                }
            });
        }

        inputDigit(digit) {
            if (this.waitingForOperand) {
                this.current = digit;
                this.waitingForOperand = false;
            } else {
                this.current = this.current === '0' ? digit : this.current + digit;
            }

            this.updateDisplay();
        }

        inputDecimal() {
            if (this.waitingForOperand) {
                this.current = '0.';
                this.waitingForOperand = false;
                this.updateDisplay();
                return;
            }

            if (!this.current.includes('.')) {
                this.current += '.';
                this.updateDisplay();
            }
        }

        clear() {
            this.current = '0';
            this.previous = null;
            this.operator = null;
            this.waitingForOperand = false;
            this.updateDisplay();
        }

        toggleSign() {
            if (this.current === '0') {
                return;
            }

            this.current = String(parseFloat(this.current) * -1);
            this.updateDisplay();
        }

        toPercent() {
            this.current = String(parseFloat(this.current) / 100);
            this.updateDisplay();
        }

        handleOperator(nextOperator) {
            const inputValue = parseFloat(this.current);

            if (this.previous === null) {
                this.previous = inputValue;
            } else if (this.operator && !this.waitingForOperand) {
                const result = this.performOperation(this.previous, inputValue, this.operator);
                this.current = this.formatNumber(result);
                this.previous = result;
            }

            this.waitingForOperand = true;
            this.operator = nextOperator;
            this.updateDisplay();
        }

        calculate() {
            if (this.operator === null || this.previous === null) {
                return;
            }

            const inputValue = parseFloat(this.current);

            try {
                const result = this.performOperation(this.previous, inputValue, this.operator);
                this.current = this.formatNumber(result);
                this.previous = null;
                this.operator = null;
                this.waitingForOperand = true;
            } catch (error) {
                this.current = 'Error';
                this.previous = null;
                this.operator = null;
                this.waitingForOperand = true;
            }

            this.updateDisplay();
        }

        performOperation(left, right, operator) {
            if (operator === '+') {
                return logic.add(left, right);
            }

            if (operator === '-') {
                return logic.subtract(left, right);
            }

            if (operator === 'x') {
                return logic.multiply(left, right);
            }

            if (operator === '÷') {
                return logic.divide(left, right);
            }

            return right;
        }

        formatNumber(value) {
            const maxChars = 12;
            const asString = String(value);

            if (asString.length <= maxChars) {
                return asString;
            }

            return Number(value).toPrecision(8).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
        }

        updateDisplay() {
            const display = this.shadowRoot.querySelector('.display-value');
            display.textContent = this.current;
        }

        render() {
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: block;
                        width: min(92vw, 360px);
                    }

                    .calculator {
                        background: linear-gradient(165deg, #0e1118 0%, #08090d 100%);
                        border-radius: 28px;
                        padding: 16px;
                        box-shadow:
                            0 20px 50px rgba(15, 18, 28, 0.75),
                            0 0 0 1px rgba(255, 255, 255, 0.05);
                    }

                    .display {
                        min-height: 90px;
                        display: flex;
                        align-items: flex-end;
                        justify-content: flex-end;
                        padding: 10px 12px;
                        color: #f8f8fb;
                        font-size: clamp(2.4rem, 8vw, 3.4rem);
                        font-family: 'Trebuchet MS', 'Segoe UI', sans-serif;
                        font-weight: 700;
                        letter-spacing: 0.02em;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .keys {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 12px;
                    }

                    button {
                        border: 0;
                        border-radius: 999px;
                        height: 68px;
                        font-size: 2rem;
                        line-height: 1;
                        font-weight: 600;
                        cursor: pointer;
                        color: #f5f6fa;
                        background: #4a4f63;
                        transition: transform 0.12s ease, filter 0.2s ease;
                    }

                    button:active {
                        transform: scale(0.96);
                    }

                    button.utility {
                        background: #d6d7db;
                        color: #060709;
                        font-weight: 700;
                        font-size: 1.95rem;
                    }

                    button.operator {
                        background: #f6972f;
                        color: #ffffff;
                        font-weight: 500;
                        font-size: 2.3rem;
                    }

                    button.zero {
                        grid-column: span 2;
                        text-align: left;
                        padding-left: 27px;
                    }

                    .frame-glow {
                        margin-top: 10px;
                        height: 10px;
                        border-radius: 999px;
                        background: linear-gradient(90deg, rgba(255, 123, 170, 0.35), rgba(255, 186, 224, 0.2), rgba(255, 123, 170, 0.35));
                        filter: blur(2px);
                    }
                </style>

                <section class="calculator" aria-label="iOS style calculator">
                    <div class="display" aria-live="polite">
                        <span class="display-value">0</span>
                    </div>

                    <div class="keys">
                        <button class="utility" data-action="clear" data-value="AC" aria-label="All clear">AC</button>
                        <button class="utility" data-action="sign" data-value="+/-" aria-label="Toggle sign">+/-</button>
                        <button class="utility" data-action="percent" data-value="%" aria-label="Percent">%</button>
                        <button class="operator" data-action="operator" data-value="÷" aria-label="Divide">÷</button>

                        <button data-action="digit" data-value="7">7</button>
                        <button data-action="digit" data-value="8">8</button>
                        <button data-action="digit" data-value="9">9</button>
                        <button class="operator" data-action="operator" data-value="x" aria-label="Multiply">x</button>

                        <button data-action="digit" data-value="4">4</button>
                        <button data-action="digit" data-value="5">5</button>
                        <button data-action="digit" data-value="6">6</button>
                        <button class="operator" data-action="operator" data-value="-" aria-label="Subtract">-</button>

                        <button data-action="digit" data-value="1">1</button>
                        <button data-action="digit" data-value="2">2</button>
                        <button data-action="digit" data-value="3">3</button>
                        <button class="operator" data-action="operator" data-value="+" aria-label="Add">+</button>

                        <button class="zero" data-action="digit" data-value="0">0</button>
                        <button data-action="decimal" data-value=".">.</button>
                        <button class="operator" data-action="equals" data-value="=" aria-label="Equals">=</button>
                    </div>

                    <div class="frame-glow" aria-hidden="true"></div>
                </section>
            `;
        }
    }

    if (!customElements.get('ios-calculator')) {
        customElements.define('ios-calculator', IosCalculator);
    }
})();
