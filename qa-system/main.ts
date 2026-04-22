type TranscriptItem = {
    form: "speak" | "dial" | "action";
    content: string;
    speaker: "IVR" | "Human" | "Agent";
    timestamp: number; // Unix timestamp in milliseconds
};

type Transcript = TranscriptItem[];

/**
For the number metric "Call Opening Quality", the LLM should return 0, 1, or 2. It passes if the value is >= the `min` threshold (2).
For the enum metric "Call Completeness", the allowed values are: `["complete", "incomplete_valid_reason", "incomplete"]`.
*/

type Metric = {
    metric_id: number;
    name: string;
    description: string;
    type: "boolean" | "number" | "enum";
    expectation: number | boolean | "complete" | "incomplete_valid_reason" | "incomplete";
    weight: "high" | "med" | "low";
}

type Rubric = {
    name: string;
    metrics: Metric[];
}

type Result = {
    metric_id: number;
    value: boolean | number | Enumerator;
    certainty: string;
    citations: TranscriptItem[];
    explanation: string;
}
type Score = {
    passed: boolean,
}
type Scorecard = {
    results: Result[];
    score: number;
}

const RUBRIC: Rubric = {
    name: "BV Call Quality",
    metrics: [
        {
            metric_id: 1,
            name: "HIPAA Patient Verification ",
            description: "Did the patient representative provide and verify the patient's full name and date of birth on the call?",
            type: "boolean",
            expectation: true,
            weight: "high",
        },
        {
            metric_id: 2,
            name: "Call Opening Quality",
            description: "Rate the patient representative's call opening on a 0-2 scale. A score of 2 (Pass) requires the patient representative to have: (a) stated the call recording/monitoring disclaimer, and (b) used the approved opening identifying themselves and stating they are calling at the request of the provider. A score of 1 (Borderline) means they partially met the requirements. A score of 0 (Fail) means they skipped the opening protocol entirely.",
            type: "number",
            expectation: 2,
            weight: "high",
        },
        {
            metric_id: 3,
            name: "Call Completeness",
            description: "Was the benefit verification completed with all critical information gathered, or was it left incomplete?",
            type: "enum",
            expectation: "complete",
            weight: "med",
        },
    ]
}

const PROMPT = `
Please grade the transcript on each of the provdided metrics,
returning a <Result> based on the metric's description,
in the format expected by the metric's type.
`

async function evaluate(
    rubric: Rubric,
    transcript: Transcript
): Promise<Scorecard> {
    /**
        * Send the transcript and metric definitions to an LLM (OpenAI)
        * For each metric, extract:
        - The **value** (e.g., `true` or `false` for boolean metrics)
        - A **result** (`"pass"`, `"fail"`, or `"borderline"`)
        - **Citations** from the transcript supporting the evaluation
        - An **explanation** of the reasoning
        * Determine pass/fail for each metric:
        - **boolean**: passes if the value matches the `expected` value
        - **enum**: passes if the value matches the `expected` value
        - **number**: passes if the value is >= the `min` threshold
        * Calculate a weighted overall score using a weighting map:
        - high = 3 points
        - med = 2 points
        - low = 1 point
        - Score = (sum of passed metric weights) / (sum of all metric weights) \* 100
        * Return the completed scorecard
   */
    
    const req = {
        instrunctions: PROMPT,
        rubric,
        transcript,
    }
    // TODO send request
    const res = await fetch("dummycall");
    const results: Result[] = await res.json();
    // Iterate through rubric metrics 
    results.
    for (const result of results) {

    }
    let score: Scorecard = {};
    return Promise.resolve(score);
}

