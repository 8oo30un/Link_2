/// <reference types="react" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "lord-icon": {
        src?: string;
        trigger?: string;
        colors?: string;
        delay?: string;
        stroke?: string;
        style?: React.CSSProperties;
        onClick?: () => void;
        className?: string;
      };
    }
  }
}

export {};
