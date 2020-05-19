const calculatorDisplay = document.getElementById("calculator-display"); // calculator calculatorDisplay
const calculatorButtons = document.querySelectorAll(".calc-btn"); // calculator buttons

calculatorDisplay.value = '0';
let selected = ''; // selected calculator button
let expression = []; 
let numberIsFloat = false;
let resultInDisplay = false;
let percentTokenUsed = false;
let outputQueue = [];
let operatorStack = [];


for (let i = 0; i < calculatorButtons.length; i++){
    calculatorButtons[i].addEventListener('click', function () { // put the button[i] as the function arg so that we can seperate the function
        selected = calculatorButtons[i].innerText;
        appendCalculatorDisplay();
    });
}


function appendCalculatorDisplay() {
    isInteger(selected) ? handleNumberInput(selected) : handleTokenInput(selected);
}


function isInteger(button) {
    return button == parseInt(button);
}


function handleNumberInput(button) {

    if (calculatorDisplay.value.length === 8) return;
    if (percentTokenUsed) clearDisplay(); // calculatorDisplay cleared if 'modulus' symbol has already been used
    
    // TODO - clean up this block of logic
    calculatorDisplay.value = (resultInDisplay) ? button 
        : (calculatorDisplay.value === '0') ? (button === '.') ? '0.' 
        : button 
        : `${calculatorDisplay.value}${button}`;

        resultInDisplay = false;
}


function handleTokenInput(button) {

    switch(button) {
        case '.': 
            if (!numberIsFloat) handleNumberInput(selected);
            numberIsFloat = true;
            break;
        case 'AC':
            clearAll();
            calculatorDisplay.value = '0';
            break;
        case '+/-':
            calculatorDisplay.value = -calculatorDisplay.value;
            break;
        case '=':
            expression.push(calculatorDisplay.value);
            clearDisplay();
            solveExpression(expression);
            break;
        case '%':
            calculatorDisplay.value /= 100;
            percentTokenUsed = true;
            const displayValue = calculatorDisplay.value; 
            if (displayValue.length >= 8) calculatorDisplay.value = Number(displayValue).toFixed(8).toString();
            break;
        default: // handle operators: (+,-,*,/)
            if (calculatorDisplay.value === '') return;
            expression.push(calculatorDisplay.value);
            expression.push(selected);
            console.log(expression);
            clearDisplay();
    }
}


function clearDisplay() {
    calculatorDisplay.value = '';
    //selected = '';
    numberIsFloat = false;
    percentTokenUsed = false;
}


function clearAll() {
    clearDisplay();
    expression = [];
    tokens = [];
}


/**
 * function to perform the reverse polish notation on the expression array
 * @param {string array} expressionArr - the mathemtical expression to be solved
 */
function solveExpression(expressionArr) {

    let expressionLength = expressionArr.length;
    if (expressionLength === 0) return;

    let extraOperator = (expressionArr[expressionLength-1] === '') ? true : false;
    if (extraOperator) expressionLength -= 2;

    loop: for (let i = 0; i < expressionLength; i++) {
        const token = expressionArr[i];

        if (token == parseFloat(token)) {
            outputQueue.push(parseFloat(token));

            const operator = operatorStack[operatorStack.length-1];
            if (operator === undefined) continue loop;

            if (operator === 'x' || operator === String.fromCharCode(247)) { // charCode is the divide symbol
                solveOperation(outputQueue.pop(), outputQueue.pop(), operator);
            } 
        } else {
            operatorStack.push(token);
        } 
    }

    outputQueue.reverse();
    operatorStack.reverse();

    while (operatorStack.length > 0) { 
        solveOperation(outputQueue.pop(), outputQueue.pop(), operatorStack[operatorStack.length-1]);
    }

    if (extraOperator === true) handleExtraOperator(expressionArr[expressionArr.length-2]);
    
    let result = +outputQueue[0].toFixed(5); // outputQueue.length should be == 0
    setCalculatorResult(result);  
}


function solveOperation(num1, num2, operator) {
    (operator === '+' || operator === '-') ? solveAdditionOrSubtraction(num1, num2, operator) 
        : solveMultiplicationOrDivision(num1, num2, operator);
}


function solveAdditionOrSubtraction(num1, num2, operator) {
    operator === '+' ? outputQueue.push(num1 + num2) : outputQueue.push(num1 - num2);
    operatorStack.pop();
}


function solveMultiplicationOrDivision(num1, num2, operator) {
    operator === 'x' ? outputQueue.push(num1 * num2) : outputQueue.push(num2 / num1);
    operatorStack.pop(); 
}


function handleExtraOperator(operator) {
    const num = (outputQueue[0] !== undefined) ? outputQueue.pop() : expressionArr[expressionArr.length-3];
    solveOperation(num, num, operator);
}


function setCalculatorResult(result) {
    result = (result.toString().length > 9) ? result.toExponential(4, result) : result;
    calculatorDisplay.value = result;
    resultInDisplay = true;
    resetArrays();
}


function resetArrays() {
    expression = [];
    outputQueue = [];
    operatorStack = [];
}