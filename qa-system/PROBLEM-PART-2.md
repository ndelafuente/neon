# QA Scorecard System - Interview Challenge

## Part 2: Modules

### 2.1 Introduce Modules

With 3 metrics, a flat list works fine. But as the number of metrics grows, we need organization. Introduce the concept of a **module**: a named group of related metrics with its own prompt/instructions.

Update your type system so that:

- A **Module** has a name, description, a prompt (instructions for the LLM specific to this group), and a list of metrics
- A **Rubric** contains a list of modules (rather than a flat list of metrics)
- A **Scorecard** records results organized by module, with per-module scores and an overall score

### 2.2 Create New Modules and Metrics

Restructure the original 3 metrics into a module called **"Compliance & Call Opening"**, then add the following two new modules with their metrics:

**Module: Eligibility & Plan Information** (3 metrics)

| #   | Metric Name                 | Description                                                                                                                                                                                                                                                                                                          | Type    | Expectation            | Weight |
| --- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------- | ------ |
| 1   | Eligibility Status Obtained | Did the patient representative request and obtain the member's eligibility status (active/inactive) from the payer representative?                                                                                                                                                                                   | boolean | expected: `true`       | high   |
| 2   | Plan Details Gathering      | Rate the patient representative's thoroughness in gathering plan details on a 0-2 scale. A score of 2 (Pass) requires obtaining: plan effective date, group number, and network status. A score of 1 (Borderline) means some but not all were gathered. A score of 0 (Fail) means plan details were largely skipped. | number  | min: `2`               | med    |
| 3   | Coordination of Benefits    | Did the patient representative verify whether the plan is the member's primary or secondary insurance (coordination of benefits)?                                                                                                                                                                                    | enum    | expected: `"verified"` | med    |

For "Coordination of Benefits", the allowed values are: `["verified", "not_verified", "not_applicable"]`.

**Module: Cost Share & Authorization** (2 metrics)

| #   | Metric Name                 | Description                                                                                                                                                                  | Type    | Expectation                      | Weight |
| --- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------- | ------ |
| 1   | Product Cost Share Obtained | Did the patient representative request cost share information for the drug code, including copay/coinsurance and whether it applies to the deductible and out-of-pocket max? | boolean | expected: `true`                 | high   |
| 2   | Prior Authorization Inquiry | Did the patient representative ask whether prior authorization is required for the drug code?                                                                                | enum    | expected: `"asked_and_obtained"` | med    |

For "Prior Authorization Inquiry", the allowed values are: `["asked_and_obtained", "asked_not_required", "not_asked"]`.

### 2.3 Update the Evaluation Function

Update `evaluate` so that:

1. Each module is evaluated separately (each module's prompt + metrics go to the LLM in one call)
2. The scorecard includes per-module breakdowns
3. The overall score is still computed across all metrics

Run the updated evaluation on both transcripts and print the results, now showing module-level scores.
