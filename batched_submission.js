let batchedArray = [];

function batchedSubmission(code, language) {
    // starting performance timer
    startTime = performance.now();

  if (isSampleTestCase) {
    let testCases = question.sampleTestCases;
    let testCasesLength = Object.keys(testCases).length;

    // create a batched post requestin judge0

    for (let i = 0; i < testCasesLength; i++) {
      let inputTC = testCases[i].input;
      let outputTC = testCases[i].output;

    //   console.log(`TC ${i}`, inputTC, outputTC);

      batchedArray[i] = {
        source_code: code,
        language_id: languages[language],
        stdin: inputTC,
        expected_output: outputTC || null,
      };
    }
  } else {
    let input = customTestCaseInput.value;

    batchedArray[0] = {
      source_code: code,
      language_id: languages[language],
      stdin: input,
      expected_output: null,
    };
  }

  let data = {
    submissions: batchedArray,
  };

  // POST call to judge0
  $.ajax({
    url:
      apiURL + "submissions/batch?base64_encoded=false" + `&fields=${fields}`,
    type: "POST",
    // async: true,
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (data, textStatus, jqXHR) {
      console.log(`Success: ${JSON.stringify(data)}`);
      let tokens = data;

      for (let index = 0; index < tokens.length; index++) {
        question.arrayOfTokens[index] = tokens[index]["token"];
        console.log(question.arrayOfTokens[index]);
      }

      disableSubmitButton();

      for (let index = 0; index < tokens.length; index++) {
        fetchSubmission(apiURL, tokens[index]["token"], index);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(`Error: ${JSON.stringify(jqXHR)}`);

      enableSubmitButton();
    },
  });
}
