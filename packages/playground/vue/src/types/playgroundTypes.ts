export type PlaygroundButtonMode = 'label' | 'html';

export type PlaygroundButton = {
  id: string;
  mode: PlaygroundButtonMode;
  value: string;
  className: string;
  ariaLabel: string;
  dismissOnClick: boolean;
};
