# QA Scorecard System - Interview Challenge

## Overview

Build a **transcript quality assurance (QA) system** that evaluates benefit verification (BV) call transcripts using configurable rubrics. You will define a type system, instantiate rubrics with metrics, and write an LLM-powered evaluation function that grades transcripts and produces scorecards.

## Background

In benefit verification, a patient representative from a provider's office calls an insurance company (the payer) to verify that a patient's insurance will cover a specific medication or procedure. The patient representative navigates through the payer's IVR, reaches a payer representative, and then works through a structured set of questions: verifying patient identity, confirming eligibility, gathering cost share details, checking prior authorization requirements, and documenting the call.

We need to automatically evaluate the quality of these BV calls using AI. The patient representative is the person being evaluated — did they follow proper protocol, gather all necessary information, and handle the call professionally? The system works as follows:

1. A **rubric** defines a set of **metrics** that a call should be graded on
2. A **transcript** of the call is fed into the system along with the rubric
3. An LLM evaluates the transcript against each metric
4. The results are collected into a **scorecard** with individual metric results and an overall score

## Part 1: Metrics and Rubrics

### 1.1 Transcript Format

You are given a transcript with this typing:

```typescript
type TranscriptItem = {
    form: "speak" | "dial" | "action";
    content: string;
    speaker: "IVR" | "Human" | "Agent";
    timestamp: number; // Unix timestamp in milliseconds
};

type Transcript = TranscriptItem[];
```

Two example transcripts are provided in `transcript-1.json` and `transcript-2.json`.

### 1.2 Define the Type System

Design types for the following concepts:

- **Metric** - A single evaluation criterion (e.g., "Did the patient representative verify the patient's identity?"). A metric has a name, description, a data type for its answer (boolean, number, string, or enum), and a weight (high, med, low).

- **Rubric** - A named collection of metrics that defines how a call should be graded.

- **Result** - The outcome of evaluating a single metric against a transcript. Should include the value, a pass/fail/borderline determination, citations from the transcript, and an explanation.

- **Scorecard** - The complete evaluation output: all results for a rubric, plus an overall weighted score.

Think about how you'd store these in a database (we won't implement persistence, but be prepared to discuss your schema).

### 1.3 Instantiate a Rubric

Create a rubric called **"BV Call Quality"** with the following 3 metrics:

| #   | Metric Name                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                           | Type    | Expectation            | Weight |
| --- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------- | ------ |
| 1   | HIPAA Patient Verification | Did the patient representative provide and verify the patient's full name and date of birth on the call?                                                                                                                                                                                                                                                                                                                                              | boolean | expected: `true`       | high   |
| 2   | Call Opening Quality       | Rate the patient representative's call opening on a 0-2 scale. A score of 2 (Pass) requires the patient representative to have: (a) stated the call recording/monitoring disclaimer, and (b) used the approved opening identifying themselves and stating they are calling at the request of the provider. A score of 1 (Borderline) means they partially met the requirements. A score of 0 (Fail) means they skipped the opening protocol entirely. | number  | min: `2`               | high   |
| 3   | Call Completeness          | Was the benefit verification completed with all critical information gathered, or was it left incomplete?                                                                                                                                                                                                                                                                                                                                             | enum    | expected: `"complete"` | med    |

For the number metric "Call Opening Quality", the LLM should return 0, 1, or 2. It passes if the value is >= the `min` threshold (2).

For the enum metric "Call Completeness", the allowed values are: `["complete", "incomplete_valid_reason", "incomplete"]`.

### 1.4 Write the Evaluation Function

Implement the core function:

```typescript
async function evaluate(
    rubric: Rubric,
    transcript: Transcript
): Promise<Scorecard>;
```

This function should:

1. Send the transcript and metric definitions to an LLM (OpenAI)
2. For each metric, extract:
    - The **value** (e.g., `true` or `false` for boolean metrics)
    - A **result** (`"pass"`, `"fail"`, or `"borderline"`)
    - **Citations** from the transcript supporting the evaluation
    - An **explanation** of the reasoning
3. Determine pass/fail for each metric:
    - **boolean**: passes if the value matches the `expected` value
    - **enum**: passes if the value matches the `expected` value
    - **number**: passes if the value is >= the `min` threshold
4. Calculate a weighted overall score using a weighting map:
    - high = 3 points
    - med = 2 points
    - low = 1 point
    - Score = (sum of passed metric weights) / (sum of all metric weights) \* 100
5. Return the completed scorecard

Use OpenAI structured outputs to get reliable JSON from the LLM.

### 1.5 Run and Print

Run `evaluate` on both provided transcripts and print the resulting scorecards to the console. The output should clearly show:

- Each metric's name, value, result, and explanation
- The overall score as a percentage
