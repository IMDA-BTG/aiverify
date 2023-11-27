## Workflow

The AI Verify Toolkit operates in a report-oriented workflow where you start with your ‘end-goal’ in mind. Through the customisable report canvas, **design** page-by-page using report widgets what you want your report to consist of. Be it a bar chart for fairness metrics, or a pie chart summarising how the AI system has aligned with the testable criteria for Safety. This will determine the technical tests and process checks needed to be done. AI Verify will then **streamline your workflow** to collect only the relevant files, test arguments and user inputs needed to run the tests and generate your customized report.

To help companies align their reports with the AI Verify framework, the toolkit also comes with a set of report templates, which pre-defines the report layout, technical tests and process checks needed.

## Technical Test

The AI Verify Toolkit conducts black-box testing on AI models by ingesting the AI model to be tested in the form of a serialized model file/folder. Depending on the test to run, various dataset files and test arguments will also be needed.

The AI Verify report templates contains technical tests that covers 3 principles:

- Fairness: [Fairness Metrics Toolbox for Classification](https://imda-btg.github.io/aiverify-developer-tools/stock_plugins/fmtc/) & [Fairness Metrics Toolbox for Regression](https://imda-btg.github.io/aiverify-developer-tools/stock_plugins/fmtr/)
- Robustness: [Robustness Toolbox](https://imda-btg.github.io/aiverify-developer-tools/stock_plugins/robustness_toolbox/)
- Explainability (Global): [SHAP Toolbox](https://imda-btg.github.io/aiverify-developer-tools/stock_plugins/shap/)

There are also three other technical tests that are not included in the AI Verify report templates:

- [Accumulated Local Effect](https://imda-btg.github.io/aiverify-developer-tools/stock_plugins/ale/)
- [Partial Dependence Plot](https://imda-btg.github.io/aiverify-developer-tools/stock_plugins/pdp/)
- [Image Corruption Toolbox](https://imda-btg.github.io/aiverify-developer-tools/stock_plugins/image_corruption/)

## Process Checks

The AI Verify Toolkit supports the AI Verify Testing Framework by providing an integrated interface that helps you to track the completion progress of the 85 testable criteria over the 11 Process Checklists, and generating a summary of how the AI system aligns with the AI Verify Testing Framework.

## Relevant Links

- [Accessing the AI model to be tested](../../getting-started/accessing-ai-model/)
- [Preparation of Input Files](../../getting-started/preparation-of-input-files/)
- [List of Supported AI Framework and Datatypes](../../others/compatibility/)