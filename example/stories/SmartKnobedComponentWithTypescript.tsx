import * as React from 'react'

import {PropTable} from './PropTable'

interface IProps {
  bool: boolean;
  number: number;
  string: string;
  func: () => void;
  object: {};
  node: React.ReactNode;
  oneOf?: 'one' | 'two' | 'three';
}

export const SmartKnobedComponentWithTypescript: React.FC<IProps> & { __docgenInfo?: any } = (props) =>
  <PropTable {...props} docgenInfo={SmartKnobedComponentWithTypescript.__docgenInfo} />
