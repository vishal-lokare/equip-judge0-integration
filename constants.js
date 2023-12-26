// Uncomment this line with correct API URL
// let apiURL = "http://192.168.1.10:2358/";
// let apiURL = "http://139.84.134.60:2358/";
let apiURL = "http://139.84.143.236:2358/"
let cbURL = "http://172.17.0.2:3000/";
// let cbURL = "http://host.docker.internal:3000/";

// Fields to be returned by judge0
let fields = "stdin,stdout,stderr,token,status,compile_output";

// Temporary database at Firebase for storing questions data
let dbURL = "https://equip-test-401e4-default-rtdb.asia-southeast1.firebasedatabase.app/";

// DOM elements
let submitButton = document.getElementById("submitBtn");
let abortButton = document.getElementById("abortBtn");
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
class Question {
    arrayOfTokens = [];
    customTCToken;

    // count of completed test cases
    completedCount = 0;
    completedTestCases = [];

    constructor(qid, qtitle, qdesc, sampleTestCases, prefilledCode, driverCode) {
        this.qid = qid;
        this.qtitle = qtitle;
        this.qdesc = qdesc;
        this.sampleTestCases = sampleTestCases;
        this.prefilledCode = prefilledCode;
        this.driverCode = driverCode;
    }
};

// Language IDs for judge0
let languages = {
    "c++": 54,
    "java": 62,
    "python": 71,
    "javascript": 63,
    "kotlin": 78,
};