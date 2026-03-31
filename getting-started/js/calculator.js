/**
 * calculator.js
 * Basic calculator helper methods.
 */

function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        throw new Error('Cannot divide by zero');
    }
    return a / b;
}

if (typeof window !== 'undefined') {
    window.CalculatorLogic = {
        add,
        subtract,
        multiply,
        divide
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        add,
        subtract,
        multiply,
        divide
    };
}
