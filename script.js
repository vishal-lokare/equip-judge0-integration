/*
This script is for demo of Judge0 code execution engine and testing the performance of it.
*/

// Initially, sample test cases are displayed
let isSampleTestCase = true;

let abort = false;

// All related to coding question
let question;

function enableSubmitButton() {
    submitButton.disabled = false;
    abortButton.disabled = true;
}

function disableSubmitButton() {
    submitButton.disabled = true;
    abortButton.disabled = false;
}

// ---------------- SERVER SIDE CODE STARTS HERE ----------------

// Extracting the qid from the URL
let url = window.location.href;

let mp = new Map();
if(url.split("?").length < 2) alert('Enter qid in the URL');
let params = url.split("?")[1].split("&");

for(let args of params) {
    mp.set(args.split("=")[0], args.split("=")[1]);
}

let qid = mp.get("qid");
let language = languageInput.value;

function populateCodeInput(lang) {
    codeInput.value = '';
    codeInput.value = question.prefilledCode[lang];
}

window.onload = function() {
    // getting question details from the server    

    $.ajax({
        url: dbURL + "questions/" + qid + ".json",
        type: "GET",
        async: true,
        contentType: "application/json",
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`Error: ${JSON.stringify(jqXHR)}`);

            alert("Error connecting to database");
        },
        success: function (data, textStatus, jqXHR) {
            question = new Question(
                data.qid,
                data.qtitle,
                data.qdesc,
                data.sampleTestCases,
                data.prefilledCode,
                data.driverCode
            );

            // Populating the question details into respective fields
            populateCodeInput(language);

            document.getElementById("qtitle").innerHTML = question.qtitle;
            document.getElementById("qdesc").innerHTML = question.qdesc;

            let testCases = question.sampleTestCases;
            let testCasesLength = Object.keys(testCases).length;

            let sampleTestCaseTable = document.getElementById("sample-tc-table");
            for(let i = 0; i < testCasesLength; i++) {
                let inputTC = testCases[i].input;
                let outputTC = testCases[i].output;

                let tr = document.createElement("tr");
                let td1 = document.createElement("td");
                let td2 = document.createElement("td");
                let td3 = document.createElement("td");
                let td4 = document.createElement("td");
                let td5 = document.createElement("td");

                td1.innerHTML = inputTC;
                td1.classList.add("sample-tc-input");

                td2.innerHTML = outputTC;
                td2.classList.add("sample-tc-output");

                td3.classList.add("tc-result");

                td4.classList.add("compile-error");

                td5.classList.add("exec-result");

                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                tr.appendChild(td4);
                tr.appendChild(td5);

                sampleTestCaseTable.appendChild(tr);
            }
        }
    });
};

// ---------------- SERVER SIDE CODE ENDS HERE ----------------


function fetchSubmission(apiURL, token, index = 0) {
    // Fetching the submission using the token
    

    $.ajax({
        url: apiURL + "submissions/" + token + '?base64_encoded=true' + `&fields=${fields}`,
        type: "GET",
        async: true,
        contentType: "application/json",
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`Error: ${JSON.stringify(jqXHR)}`);
            enableSubmitButton();
        },
        success: function (data, textStatus, jqXHR) {
            if(abort) {
                enableSubmitButton();
                return;
            }

            // Decoding the base64 encoded strings
            if(typeof(data.stdout) == "string") data.stdout = atob(data.stdout);
            data.stdin = atob(data.stdin);
            
            if(language == "python" && typeof(data.stderr) == "string") {
                let arr = data.stderr.split("\n");

                let base64decoded = '';
                for(let lines of arr) {
                    base64decoded += atob(lines) + "\n";
                }
                data.stderr = base64decoded;
            }

            if(typeof(data.compile_output) == "string") {
                let arr = data.compile_output.split("\n");
                
                let base64decoded = '';
                for(let lines of arr) {
                    base64decoded += atob(lines) + "\n";
                }
                data.compile_output = base64decoded;
            }

            console.log(`Success: ${JSON.stringify(data)}`);
            console.log(`Status: ${data.status.id}, for the input ${data.stdin}`);
            let outputDiv;
            let compileErrorDiv;
            let execResultDiv;

            if(isSampleTestCase) {
                outputDiv = document.getElementsByClassName("tc-result")[index];
                compileErrorDiv = document.getElementsByClassName("compile-error")[index];
                execResultDiv = document.getElementsByClassName("exec-result")[index];
            } else {
                outputDiv = customTestCaseOutput;
                execResultDiv = customTestCaseCompileErr;
            }
            
            if(data.status.id <= 2) {
                setTimeout(function() {
                    fetchSubmission(apiURL, token, index);
                }, 2000);
            } else {
                if(isSampleTestCase) {
                    // Enabling the submit button when all the test cases are completed
                    question.completedCount++;
                    question.completedTestCases[index] = true;

                    console.log(`Completed: ${question.completedCount} / ${Object.keys(question.sampleTestCases).length}`);

                    if(question.completedCount >= Object.keys(question.sampleTestCases).length) {
                        enableSubmitButton();
                        question.completedCount = 0;

                        // Stopping performance timer
                        endTime = performance.now();

                        // calculating time taken
                        let timeTaken = endTime - startTime;
                        timeTaken /= 1000;
                        timeTaken = timeTaken.toFixed(2);
                        console.log(`Time taken: ${timeTaken} seconds`);
                    }

                    outputDiv.innerText = data.stdout || "NA";
                    compileErrorDiv.innerText = data.stderr == null && data.status.description != "Compilation Error" ? "NO" : "YES";
                    execResultDiv.innerText = language == "python" ? data.stderr : data.compile_output;

                    switch(data.status.description) {
                        case "Accepted": 
                            outputDiv.style.backgroundColor = "#00FF00"
                            break;
                        case "Wrong Answer":
                            outputDiv.style.backgroundColor = "#FF0000"
                            break;
                        default:
                            outputDiv.style.backgroundColor = "#808080"
                            break;
                    }
                } else {
                    // Custom TC
                    enableSubmitButton();
                    customTestCaseOutput.innerText = data.stdout || "NA";
                    execResultDiv.innerText = language == "python" ? data.stderr : data.compile_output;
                }
            }
        }
    });
}

function submit(code, input, output = null, index = 0) {
    abort = false;

    let data = {
        "callback_url": cbURL,
        "source_code": code,
        "language_id": languages[language],
        "stdin": input,
        "expected_output": output || null
    };

    let outputDiv;
    if(isSampleTestCase) {
        outputDiv = document.getElementsByClassName("tc-result")[index];
    } else {
        outputDiv = customTestCaseOutput;
    }
    
    outputDiv.innerText = "Running...";
    outputDiv.style.backgroundColor = "#FFFF00";

    $.ajax({
        url: apiURL + "submissions/",
        type: "POST",
        async: true,
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (data, textStatus, jqXHR) {
            let token = data.token;

            if(isSampleTestCase) {
                question.arrayOfTokens[index] = token;
            } else {
                question.customTCToken = token;
            }

            disableSubmitButton();

            fetchSubmission(apiURL, token, index);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`Error: ${JSON.stringify(jqXHR)}`);

            outputDiv.innerText = "Error, can't connect";

            enableSubmitButton();
        }
    });
}