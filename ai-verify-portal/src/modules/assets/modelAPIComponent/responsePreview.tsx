import { ResponseForm } from './types';

type ReponsePreviewProps = {
  responseType: ResponseForm;
};

function ResponsePreview(props: ReponsePreviewProps) {
  const { responseType } = props;
  const { schema } = responseType;

  return <div></div>;
}
