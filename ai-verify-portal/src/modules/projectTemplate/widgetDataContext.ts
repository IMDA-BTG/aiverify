import { createContext } from 'react';

export type WidgetDataContextType = {
  [key: string]: {
    properties: Record<string, string | number>;
  };
};

const WidgetDataContext = createContext<WidgetDataContextType>({});
export default WidgetDataContext;
