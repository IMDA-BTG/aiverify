import CloseIcon from '@mui/icons-material/Close';

import { ProjectStore, UpdateActionTypes } from './projectContext';
import { ModelAndDatasets } from 'src/types/project.interface';
import { FileSelectMode } from './datasetModelFilePicker';
import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { DatasetColumn } from 'src/types/dataset.interface';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import styles from './styles/inputs.module.css';

type Props = {
  showGroundTruth: boolean;
  onSelectDataset: () => void;
  onSelectGroundTruthDataset: () => void;
  onSelectModel: () => void;
  projectStore: ProjectStore;
};

export default function SelectDatasetAndModelSection({
  showGroundTruth,
  onSelectDataset,
  onSelectGroundTruthDataset,
  onSelectModel,
  projectStore,
}: Props) {
  let selectedDatasetFilename: string | undefined;
  let selectedTruthDatasetFilename: string | undefined;
  let selectedModelFilename: string | undefined;

  let groundTruthColumns: DatasetColumn[] = [];
  let groundTruthColVal = '';

  if (projectStore.modelAndDatasets) {
    const { model, testDataset, groundTruthDataset, groundTruthColumn } =
      projectStore.modelAndDatasets;
    selectedDatasetFilename = testDataset
      ? testDataset.name
      : selectedDatasetFilename;
    selectedModelFilename = model ? model.name : selectedModelFilename;
    selectedTruthDatasetFilename = groundTruthDataset
      ? groundTruthDataset.name
      : selectedTruthDatasetFilename;
    if (groundTruthDataset && groundTruthDataset.dataColumns) {
      groundTruthColumns = groundTruthDataset.dataColumns;
    }
    if (groundTruthColumn) {
      groundTruthColVal = groundTruthColumn;
    }
  }

  function removeFileHandler(mode: FileSelectMode) {
    const payload: Partial<ModelAndDatasets> = {};
    if (mode === FileSelectMode.DATASET) {
      payload.testDataset = undefined;
    } else if (mode === FileSelectMode.MODEL) {
      payload.model = undefined;
    } else if (mode === FileSelectMode.GROUNDTRUTH) {
      payload.groundTruthDataset = undefined;
      payload.groundTruthColumn = undefined;
    }
    projectStore.dispatchModelAndDatasets({
      type: UpdateActionTypes.UPDATE,
      payload,
    });
  }

  function handleSelectChange(e: SelectChangeEvent<string>) {
    const payload: Partial<ModelAndDatasets> = {};
    payload.groundTruthColumn = e.target.value as string;
    projectStore.dispatchModelAndDatasets({
      type: UpdateActionTypes.UPDATE,
      payload,
    });
  }

  return (
    <div className={styles.inputSection}>
      <div className={styles.sectionHeading}>
        <h3 className="screenHeading">
          Select the Datasets and AI Model to be tested
        </h3>
        <p className="headingDescription">
          Please select the datasets required for report generation followed by
          the AI Model to be tested
        </p>
      </div>

      <div className={styles.inputCard}>
        <div className={styles.inputDescription} style={{ width: '350px' }}>
          <h4>Testing Dataset</h4>
          <p>Select the testing dataset to be used for the tests to run.</p>
        </div>
        <div className={styles.divider} />
        <div className={styles.inputMain}>
          {selectedDatasetFilename ? (
            <div
              style={{
                display: 'flex',
                border: '1px solid #cfcfcf',
                padding: '10px',
                justifyContent: 'space-between',
                minWidth: 345,
              }}>
              <div style={{ display: 'flex' }}>
                <FilePresentIcon
                  style={{ marginRight: '10px', fontSize: '25px' }}
                />
                <div style={{ marginRight: '15px' }}>
                  {selectedDatasetFilename}
                </div>
              </div>
              <CloseIcon
                style={{ marginLeft: '10px', cursor: 'pointer' }}
                onClick={() => removeFileHandler(FileSelectMode.DATASET)}
              />
            </div>
          ) : (
            <button
              id="chooseTestDatasetBtn"
              className="aivBase-button aivBase-button--outlined aivBase-button--small"
              onClick={onSelectDataset}>
              Choose Dataset
            </button>
          )}
        </div>
      </div>

      {showGroundTruth ? (
        <div className={styles.inputCard}>
          <div className={styles.inputDescription} style={{ width: '350px' }}>
            <h4>Ground Truth Dataset</h4>
            <p>
              Select the dataset containing the ground truth. The testing
              dataset can be used.
            </p>
          </div>
          <div className={styles.divider} />
          <div className={styles.inputMain}>
            {selectedTruthDatasetFilename ? (
              <div
                style={{
                  display: 'flex',
                  border: '1px solid #cfcfcf',
                  padding: '10px',
                  justifyContent: 'space-between',
                  minWidth: 345,
                }}>
                <div style={{ display: 'flex' }}>
                  <FilePresentIcon
                    style={{ marginRight: '10px', fontSize: '25px' }}
                  />
                  <div style={{ marginRight: '15px' }}>
                    {selectedTruthDatasetFilename}
                  </div>
                </div>
                <CloseIcon
                  style={{ marginLeft: '10px', cursor: 'pointer' }}
                  onClick={() => removeFileHandler(FileSelectMode.GROUNDTRUTH)}
                />
              </div>
            ) : (
              <button
                id="chooseGroundTruthBtn"
                className="aivBase-button aivBase-button--outlined aivBase-button--small"
                onClick={onSelectGroundTruthDataset}>
                Choose Dataset
              </button>
            )}
            {groundTruthColumns && groundTruthColumns.length ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '15px',
                }}>
                <div style={{ marginRight: '5px' }}> Select Ground Truth: </div>
                <Select
                  id="groundTruthSelect"
                  value={groundTruthColVal}
                  onChange={handleSelectChange}
                  placeholder="Ground Truth"
                  size="small"
                  style={{ minWidth: '200px' }}>
                  <MenuItem value="">
                    <em>Please select</em>
                  </MenuItem>
                  {groundTruthColumns.map((col) => (
                    <MenuItem
                      key={col.name}
                      selected={groundTruthColVal === col.label}
                      value={col.label}>
                      {col.name}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={styles.inputCard}>
        <div className={styles.inputDescription} style={{ width: '350px' }}>
          <h4>AI Model</h4>
          <p>
            Select the AI Model to be tested. Model Upload and API Connection
            available.
          </p>
        </div>
        <div className={styles.divider} />
        <div className={styles.inputMain}>
          {selectedModelFilename ? (
            <div
              style={{
                display: 'flex',
                border: '1px solid #cfcfcf',
                padding: '10px',
                justifyContent: 'space-between',
                minWidth: 345,
              }}>
              <div style={{ display: 'flex' }}>
                <FilePresentIcon
                  style={{ marginRight: '10px', fontSize: '25px' }}
                />
                <div style={{ marginRight: '15px' }}>
                  {selectedModelFilename}
                </div>
              </div>
              <CloseIcon
                style={{ marginLeft: '10px', cursor: 'pointer' }}
                onClick={() => removeFileHandler(FileSelectMode.MODEL)}
              />
            </div>
          ) : (
            <button
              className="aivBase-button aivBase-button--outlined aivBase-button--small"
              onClick={onSelectModel}>
              Choose Model
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
