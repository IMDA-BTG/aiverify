import { IconButton } from 'src/components/iconButton';
import { TextInput } from 'src/components/textInput';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import styles from './styles/newModelApiConfig.module.css';
import { ChangeEvent } from 'react';
import { SelectInput } from 'src/components/selectInput';
import { optionsOpenApiDataTypes } from './selectOptions';
import {
  ModelApiFormModel,
  OpenApiDataTypes,
  URLParamType,
  UrlParam,
} from './types';
import { usePresetHelper } from './providers/presetHelperProvider';
import { ColorPalette } from 'src/components/colorPalette';
import { Tooltip, TooltipPosition } from 'src/components/tooltip';
import { useFormikContext } from 'formik';

type UrlParameterInputProps = {
  isFormikBinded?: boolean;
  value: UrlParam;
  showAddBtn?: boolean;
  disabled?: boolean;
  paramError?: string;
  typeError?: string;
  paramInputName?: string;
  paramTypeName?: string;
  onChange: {
    (e: ChangeEvent<HTMLInputElement>): void;
    (value: UrlParam): void;
  };
  onAddClick?: () => void;
  onDeleteClick?: (param: UrlParam) => void;
};

function UrlParamsInputHeading() {
  return (
    <div style={{ display: 'flex', marginBottom: 4 }}>
      <div className={styles.headingName}>Parameter Name</div>
      <div className={styles.headingVal}>Data Type</div>
    </div>
  );
}

function UrlParamCaptureInput(props: UrlParameterInputProps) {
  const {
    isFormikBinded = false,
    value,
    showAddBtn = false,
    disabled = false,
    paramError,
    typeError,
    paramInputName,
    paramTypeName,
    onChange,
    onAddClick,
    onDeleteClick,
  } = props;
  const { highlightedFields } = usePresetHelper();
  const disableAddBtn = value.name.trim() === '' || value.type.trim() === '';
  const { values } = useFormikContext<ModelApiFormModel>();

  function handleRemoveBtnClick(param: UrlParam) {
    return () => onDeleteClick && onDeleteClick(param);
  }

  function handleKeyChange(e: ChangeEvent<HTMLInputElement>) {
    const updatedParam: UrlParam = { ...value, name: e.target.value };
    onChange(updatedParam);
  }

  function handleTypeChange(val: OpenApiDataTypes) {
    const updatedParam = { ...value, type: val };
    onChange(updatedParam);
  }

  return (
    <div className={styles.keyValRow} data-testid="urlParamInputRow">
      <div className={styles.keyValCol}>
        <Tooltip
          defaultShow={highlightedFields['urlParamName']}
          disabled
          backgroundColor={ColorPalette.gray}
          fontColor={ColorPalette.white}
          content={
            <div style={{ marginBottom: 5, textAlign: 'left' }}>
              {values.modelAPI.parameters?.paramType === URLParamType.QUERY
                ? `
              Add the URL parameter names and corresponding data types. Mapping of these parameters to dataset columns will
              be done before generating report. URL query parameters or
              query strings are the part of a URL that typically comes after a
              question mark (?) and are used to pass data along with the URL.`
                : `Add the URL parameter names and corresponding data types.  Mapping of these parameters to dataset columns will
                be done before generating report.
              Path parameters are variable parts of a URL path. Order of the parameters matter.`}
            </div>
          }
          position={TooltipPosition.left}
          offsetLeft={-10}
          offsetTop={15}>
          <div>
            <TextInput
              disabled={disabled}
              value={value.name}
              name={
                isFormikBinded && paramInputName
                  ? paramInputName
                  : 'urlParamName'
              }
              style={{ marginBottom: 0 }}
              maxLength={100}
              onChange={isFormikBinded ? onChange : handleKeyChange}
              error={paramError}
              inputStyle={
                !isFormikBinded && highlightedFields['urlParamName']
                  ? {
                      border: `1px solid ${ColorPalette.gray}`,
                      backgroundColor: ColorPalette.softPurpleTint,
                    }
                  : undefined
              }
            />
          </div>
        </Tooltip>
      </div>
      <div className={styles.keyValCol}>
        <SelectInput<OpenApiDataTypes>
          disabled={disabled}
          name={
            isFormikBinded && paramTypeName ? paramTypeName : 'urlParamDataType'
          }
          options={optionsOpenApiDataTypes}
          onChange={isFormikBinded ? undefined : handleTypeChange}
          onSyntheticChange={isFormikBinded ? onChange : undefined}
          value={value.type}
          style={{ marginBottom: 0 }}
          error={typeError}
          inputStyle={
            !isFormikBinded && highlightedFields['urlParamDataType']
              ? {
                  border: `1px solid ${ColorPalette.gray}`,
                  backgroundColor: ColorPalette.softPurpleTint,
                }
              : undefined
          }
        />
      </div>
      {showAddBtn ? (
        <div className={styles.iconContainer}>
          <IconButton
            id="addUrlParamBtn"
            iconComponent={AddIcon}
            onClick={onAddClick}
            disabled={disableAddBtn}>
            <div
              style={{
                color: '#676767',
                fontSize: 15,
                margin: '0 6px',
              }}>
              Add
            </div>
          </IconButton>
        </div>
      ) : !disabled ? (
        <div className={styles.delIconContainer}>
          <IconButton
            iconComponent={CloseIcon}
            noOutline
            onClick={handleRemoveBtnClick(value)}
          />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DragIndicatorIcon style={{ color: '#cfcfcf', cursor: 'grab' }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { UrlParamCaptureInput, UrlParamsInputHeading };
