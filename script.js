// Hosted judge0 on a Ubuntu VM, network mode set as bridged
let apiURL = "http://192.168.1.7:2358/";

// Fields to be returned by judge0
let fields = "stdin,stdout,stderr,token,status"

// Temporary database at Firebase for storing questions data
let dbURL = "https://equip-test-401e4-default-rtdb.asia-southeast1.firebasedatabase.app/";

// Initially, sample test cases are displayed
let isSampleTestCase = true;

// DOM elements
let submitButton = document.getElementById("submitBtn");
let codeInput = document.getElementById("codeInput");
let languageInput = document.getElementById("languageInput");

let sampleTestCaseButton = document.getElementById("sample-tc-button");
let customTestCaseButton = document.getElementById("custom-tc-button");
let sampleTestCaseTable = document.getElementById("sample-tc-table");
let customTestCaseTable = document.getElementById("custom-tc-table");

sampleTestCaseButton.style.backgroundColor = "#00FFFF";
customTestCaseButton.style.backgroundColor = "#FFFFFF";
sampleTestCaseTable.style.display = "block";

// Custom Test Cases elements
let customTestCaseInput = document.getElementById("custom-tc-input");
let customTestCaseOutput = document.getElementsByClassName("custom-tc-output")[0];
let customTestCaseCompileErr = document.getElementsByClassName("custom-tc-compile-error")[0];

// Question data model
const Question = class {
    constructor(qid, qtitle, qdesc, sampleTestCases, prefilledCode, driverCode) {
        this.qid = qid;
        this.qtitle = qtitle;
        this.qdesc = qdesc;
        this.sampleTestCases = sampleTestCases;
        this.prefilledCode = prefilledCode;
        this.driverCode = driverCode;
    }
};

// server side code
// check the url, and extract the last part of it, fetch the question from the database
let url = window.location.href;

// converting the params to map for easier extraction
let mp = new Map();
if(url.split("?").length < 2) alert('Enter qid in the URL');
let params = url.split("?")[1].split("&");

for(let arguments of params) {
    mp.set(arguments.split("=")[0], arguments.split("=")[1]);
}

let question;
let qid = mp.get("qid");
let language = languageInput.value;

let languages = {
    "c++": 54,
    "java": 62,
    "python": 71,
    "javascript": 63,
    "kotlin": 78,
};

// onChange event listener for language input
languageInput.addEventListener("change", function() {
    language = languageInput.value;
    populateCodeInput(language);
});

function populateCodeInput(lang) {
    codeInput.value = '';
    codeInput.value = question.prefilledCode[lang];
}

// async call to get the question details
// this code will actually be on the server side, so that the question details are not exposed to the client
window.onload = function() {
    // get programming language to Judge0 language id mapping
    // TODO : get this from the server
    
    // get question details from the server    

    // db call to get question details
    $.ajax({
        url: dbURL + "questions/" + qid + ".json",
        type: "GET",
        async: true,
        contentType: "application/json",
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`Error: ${JSON.stringify(jqXHR)}`);
        },
        success: function (data, textStatus, jqXHR) {
            question = data;

            // again server side code
            // filling code editor with prefilled code
            populateCodeInput(language);

            // filling question details
            document.getElementById("qtitle").innerHTML = question.qtitle;
            document.getElementById("qdesc").innerHTML = question.qdesc;

            // filling sample test cases
            let testCases = question.sampleTestCases;
            let testCasesLength = Object.keys(testCases).length;

            let sampleTestCaseTable = document.getElementById("sample-tc-table");
            for(let i = 0; i < testCasesLength; i++) {
                let inputTC = Object.keys(testCases[i])[0];
                let outputTC = testCases[i][inputTC];

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


sampleTestCaseButton.addEventListener("click", function() {
    // sample buttom clicked
    isSampleTestCase = true;

    sampleTestCaseButton.style.backgroundColor = "#00FFFF";
    customTestCaseButton.style.backgroundColor = "#FFFFFF";
    sampleTestCaseTable.style.display = "block";
    customTestCaseTable.style.display = "none";
    
    sampleTestCaseButton.disabled = true;
    customTestCaseButton.disabled = false;
});

customTestCaseButton.addEventListener("click", function() {
    // custom buttom clicked
    isSampleTestCase = false;

    sampleTestCaseButton.style.backgroundColor = "#FFFFFF";
    customTestCaseButton.style.backgroundColor = "#00FFFF";
    sampleTestCaseTable.style.display = "none";
    customTestCaseTable.style.display = "block";

    customTestCaseButton.disabled = true;
    sampleTestCaseButton.disabled = false;
});

submitButton.addEventListener("click", function() {
    // getting code from textarea
    let code = codeInput.value;

    // this will also be on the server side
    code += question.driverCode[language];

    // adding test cases to code
    if(isSampleTestCase) {
        let testCases = question.sampleTestCases;
        let testCasesLength = Object.keys(testCases).length;
        for(let i = 0; i < testCasesLength; i++) {
            let inputTC = Object.keys(testCases[i])[0];
            let outputTC = testCases[i][inputTC];
            submit(code, inputTC, outputTC, i);
        }
    } else {
        let input = customTestCaseInput.value;
        submit(code, input);
    }
});

function fetchSubmission(apiURL, token, index = 0) {
    // fetches submission using the token, and updates in the respective test cases div

    $.ajax({
        url: apiURL + "submissions/" + token + `?fields=${fields}`,
        type: "GET",
        async: true,
        contentType: "application/json",
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`Error: ${JSON.stringify(jqXHR)}`);
        },
        success: function (data, textStatus, jqXHR) {
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
            }
            
            if(data.status.id <= 2) {
                setTimeout(function() {
                    fetchSubmission(apiURL, token, index);
                }, 1500);
            } else {
                if(isSampleTestCase) {
                    outputDiv.innerText = data.stdout || "NA";
                    compileErrorDiv.innerText = data.stderr == null && data.status.description != "Compilation Error" ? "NO" : "YES";
                    execResultDiv.innerText = data.stderr;

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
                    customTestCaseOutput.innerText = data.stdout || "NA";
                    customTestCaseCompileErr.innerText = data.stderr == null ? "NO" : "YES";
                }
            }
        }
    });
}

function submit(code, input, output = null, index = 0) {
    // call locally hosted Judge0 API
    console.log(`Input: ${input}`);
    console.log(`Code: ${code}`);

    let data = {
        "source_code": code,
        "language_id": languages[language],
        "stdin": input,
        "expected_output": output || null,
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
            console.log(`Success: ${JSON.stringify(data)}`);
            let token = data.token;
            console.log(data);

            fetchSubmission(apiURL, token, index);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`Error: ${JSON.stringify(jqXHR)}`);
        }
    });
}