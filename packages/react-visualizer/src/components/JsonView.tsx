import ReactJson from 'react-json-view';

export const JsonView = ({ src }: { src: unknown }): JSX.Element => (
  // @ts-ignore bad typing from react json
  <ReactJson src={typeof src === 'object' && src !== null ? src : { src }} />
);
