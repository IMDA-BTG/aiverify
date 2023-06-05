from test_engine_core.plugins.enums.model_type import ModelType
from tests.plugin_test import PluginTest

if __name__ == "__main__":
    # Binary Classification Non-Pipeline
    data_path = "tests/user_defined_files/data/pickle_pandas_mock_binary_classification_credit_risk_testing.sav"
    model_path = (
        "tests/user_defined_files/model/"
        "binary_classification_mock_credit_risk_sklearn.linear_model._logistic.LogisticRegression.sav"
    )
    ground_truth_path = (
        "tests/user_defined_files/data/"
        "pickle_pandas_mock_binary_classification_credit_risk_testing.sav"
    )
    ground_truth = "default"
    run_pipeline = False
    model_type = ModelType.CLASSIFICATION

    # # Multiclass Classification Non-Pipeline
    # data_path = ("tests/user_defined_files/data/"
    #              "pickle_pandas_mock_multiclass_classification_toxic_classification_testing.sav")
    # model_path = ("tests/user_defined_files/model/""multiclass_classification_mock_toxic_"
    #               "classification_sklearn.linear_model._logistic.LogisticRegression.sav")
    # ground_truth_path = (
    #     "tests/user_defined_files/data/pickle_pandas_mock_multiclass_classification_toxic_classification_testing.sav"
    # )
    # ground_truth = "toxic"
    # run_pipeline = False
    # model_type = ModelType.CLASSIFICATION

    # # Tabular Binary Classification Pipeline
    # data_path = ("tests/user_defined_files/data/"
    #              "pickle_pandas_mock_binary_classification_pipeline_credit_risk_testing.sav")
    # model_path = "tests/user_defined_files/pipeline/binary_classification_tabular_credit_loan"
    # ground_truth_path = ("tests/user_defined_files/data/"
    #                      "pickle_pandas_mock_binary_classification_pipeline_credit_risk_ytest.sav")
    # ground_truth = "default"
    # run_pipeline = True
    # model_type = ModelType.CLASSIFICATION

    # # Multiclass Classification Pipeline
    # data_path = ("tests/user_defined_files/data/pickle_pandas_mock_multiclass_classification_pipeline_toxic_"
    #              "classification_testing.sav")
    # model_path = "tests/user_defined_files/pipeline/multiclass_classification_tabular_toxic_classification"
    # ground_truth_path = ("tests/user_defined_files/data/"
    #                      "pickle_pandas_mock_multiclass_classification_pipeline_toxic_classification_ytest.sav")
    # ground_truth = "toxic"
    # run_pipeline = True
    # model_type = ModelType.CLASSIFICATION

    core_modules_path = "../../../test-engine-core-modules"

    # =====================================================================================
    # NOTE: Do not modify the code below
    # =====================================================================================
    # Perform Plugin Testing
    try:
        # Create an instance of PluginTest with defined paths and arguments and Run.
        plugin_test = PluginTest(
            run_pipeline,
            core_modules_path,
            data_path,
            model_path,
            ground_truth_path,
            ground_truth,
            model_type,
        )
        plugin_test.run()

    except Exception as exception:
        print(f"Exception caught while running the plugin test: {str(exception)}")
