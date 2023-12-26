// onChange event listener for language input
languageInput.addEventListener("change", function() {
    language = languageInput.value;
    populateCodeInput(language);
});

// keyboard shortcut for submitting code
document.addEventListener("keydown", function (event) {
    if(event.ctrlKey && event.key === "'") {
        document.getElementById("submitBtn").click();
    }
});


// Switching between sample and custom test cases
sampleTestCaseButton.addEventListener("click", function() {
    isSampleTestCase = true;

    sampleTestCaseButton.style.backgroundColor = "#00FFFF";
    customTestCaseButton.style.backgroundColor = "#FFFFFF";
    sampleTestCaseTable.style.display = "block";
    customTestCaseTable.style.display = "none";
    
    sampleTestCaseButton.disabled = true;
    customTestCaseButton.disabled = false;
});
customTestCaseButton.addEventListener("click", function() {
    isSampleTestCase = false;

    sampleTestCaseButton.style.backgroundColor = "#FFFFFF";
    customTestCaseButton.style.backgroundColor = "#00FFFF";
    sampleTestCaseTable.style.display = "none";
    customTestCaseTable.style.display = "block";

    customTestCaseButton.disabled = true;
    sampleTestCaseButton.disabled = false;
});


// Submit button event listener - synchronous, separate requests for each test case
submitButton.addEventListener("click", function() {
    // starting performance timer
    startTime = performance.now();

    // getting code from textarea
    let code = codeInput.value;

    // this will also be on the server side
    code += question.driverCode[language];

    batchedSubmission(code, language);
    return;

    // adding test cases to code
    if(isSampleTestCase) {
        let testCases = question.sampleTestCases;
        let testCasesLength = Object.keys(testCases).length;

        for(let i = 0; i < testCasesLength; i++) {
            let inputTC = testCases[i].input;
            let outputTC = testCases[i].output;
            submit(code, inputTC, outputTC, i);
        }
    } else {
        let input = customTestCaseInput.value;
        submit(code, input);
    }
});

// Abort button event listener
abortButton.addEventListener("click", function() {
    abort = true;
    enableSubmitButton();
    if(isSampleTestCase) {
        let outputDivs = document.getElementsByClassName("tc-result");
        for(const element of outputDivs) {
            if(element.innerText == "Running...") {
                element.innerText = "Aborted";
                element.style.backgroundColor = "#FF0000";
            }
        }
    } else {
        customTestCaseOutput.innerText = "Aborted";
        customTestCaseOutput.style.backgroundColor = "#FF0000";
    }
});