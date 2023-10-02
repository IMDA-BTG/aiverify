import Dataset from './dataset.interface';
import ModelFile from './model.interface';
import ProjectTemplate from './projectTemplate.interface';
import { TestInformation, TestEngineTask } from './test.interface';

export enum ProjectReportStatus {
  NotGenerated = 'NotGenerated', //this maps to report status undefined while the rest of the properties below map directly to report status string return from APIGW
  RunningTests = 'RunningTests',
  GeneratingReport = 'GeneratingReport',
  ReportGenerated = 'ReportGenerated',
}

export interface InputBlockData {
  [testID: string]: Record<string, string | number>;
}

export interface Report {
  projectID: string; // id of project
  projectSnapshot: Project;
  status: ProjectReportStatus;
  timeStart: Date;
  timeTaken: number;
  totalTestTimeTaken: number;
  inputBlockData?: InputBlockData;
  tests?: TestEngineTask[];
}

export interface ModelAndDatasets {
  model: ModelFile;
  testDataset: Dataset;
  groundTruthDataset: Dataset;
  groundTruthColumn: string;
}

export type ModelAndDatesetsFileNames = {
  model: string;
  testDataset: string;
  groundTruthDataset: string;
  modelType: string;
  groundTruthColumn: string;
};

/**
 * Project is template with data
 */
export default interface Project extends ProjectTemplate {
  template: ProjectTemplate;
  inputBlockData?: InputBlockData;
  testInformationData?: TestInformation[];
  modelAndDatasets?: ModelAndDatasets;
  report?: Report;
}

export interface ProjectInput extends ProjectTemplate {
  inputBlockData?: InputBlockData;
  testInformationData?: TestInformation[];
  modelAndDatasets?: {
    modelId?: string;
    testDatasetId?: string;
    groundTruthDatasetId?: string;
    groundTruthColumn?: string;
  };
  report?: Report;
}
