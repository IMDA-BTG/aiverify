import { Algorithm } from './plugin.interface';

export type TestArguments = Record<
  string,
  string | number | string[] | number[]
>;

export interface TestInformation {
  algorithmGID: string;
  algorithm?: Algorithm;
  isTestArgumentsValid: boolean; // whether testArguments is valid
  testArguments: object; // arguments filled in by users
}

export enum TestEngineTaskStatus {
  Pending = 'Pending',
  Running = 'Running',
  Cancelled = 'Cancelled', // cancelled by user
  Success = 'Success',
  Error = 'Error',
}

export enum ErrorMessageSeverity {
  information = 'information',
  warning = 'warning',
  critical = 'critical',
}

export interface ErrorMessage {
  severity: ErrorMessageSeverity;
  description: string;
  code?: string;
}

export interface TestEngineTask {
  algorithmGID: string; // GID of algorithm
  algorithm: Algorithm;
  testArguments: TestArguments; // snapshot of test arguments
  status: TestEngineTaskStatus;
  progress?: number; // progress in percentage
  timeStart?: Date;
  timeTaken?: number; // in seconds
  errorMessages?: ErrorMessage[];
}
