import { ReportWidget, InputBlock } from './plugin.interface';
// import { TestInformation } from './test.interface';

export type PropertyMap = {
  [key: string]: string;
};

/** Allow some simple customization of the layout item box */
export type LayoutItemProperties = {
  justifyContent?: string;
  alignItems?: string;
  color?: string;
  bgcolor?: string;
  textAlign?: string;
};

/** additional properties for widget items in grid */
export type ReportWidgetItem = {
  widget: ReportWidget;
  widgetGID: string; // reference widget GID
  key: string; // layout key
  layoutItemProperties: LayoutItemProperties;
  properties?: PropertyMap;
};

export type Page = {
  layouts: ReactGridLayout.Layout[];
  reportWidgets: ReportWidgetItem[];
};

export type GlobalVariable = {
  key: string; // key
  value: string; // value
};

export interface ProjectInformation {
  name: string;
  description?: string;
  reportTitle?: string;
  company?: string;
}

/**
 * Represents the project data.
 */
export default interface ProjectTemplate {
  id?: string; // project ID, null if new project
  fromPlugin: boolean;
  projectInfo: ProjectInformation;
  createdAt?: Date;
  updatedAt?: Date;
  pages: Page[];
  inputBlocks?: InputBlock[];
  inputBlockGIDs?: string[];
  globalVars: GlobalVariable[];
}
