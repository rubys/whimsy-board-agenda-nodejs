import React from "react";
import { Switch, Route } from "react-router-dom";
import './demo.css';

import Index from './index.js';
import DemoObject from './object.js';
import TemplateVariable from './template-variable.js';
import TemplateArray from './template-array.js';
import TemplateCondition from './template-condition.js';
import ComponentState from './component-state.js';
import ComponentProps from './component-props.js';
import ConnectStore from './connect-store.js';

export default function (props) {
  let { main } = props;

  return <Switch>
    <Route exact path="/demo/">
      {main({
        color: 'purple',
        view: Index,
        next: { href: 'demo/object', title: 'Object' },
      })}
    </Route>

    <Route path="/demo/object">
      {main({
        color: 'purple',
        view: DemoObject,
        title: 'Object',
        next: { href: 'demo/template-variable', title: 'Template Variable' },
        prev: { href: 'demo/', title: 'Index' }
      })}
    </Route>

    <Route path="/demo/template-variable">
      {main({
        color: 'purple',
        view: TemplateVariable,
        title: 'Template - Variable',
        next: { href: 'demo/template-array', title: 'Template Array' },
        prev: { href: 'demo/object', title: 'Object' }
      })}
    </Route>

    <Route path="/demo/template-array">
      {main({
        color: 'purple',
        view: TemplateArray,
        title: 'Template - Array',
        next: { href: 'demo/template-condition', title: 'Template Condition' },
        prev: { href: 'demo/template-variable', title: 'Template Variable' },
      })}
    </Route>

    <Route path="/demo/template-condition">
      {main({
        color: 'purple',
        view: TemplateCondition,
        title: 'Template - Condition',
        next: { href: 'demo/component-state', title: 'Condition State' },
        prev: { href: 'demo/template-array', title: 'Template Array' },
      })}
    </Route>

    <Route path="/demo/component-state">
      {main({
        color: 'purple',
        view: ComponentState,
        title: 'Component State',
        next: { href: 'demo/component-props', title: 'Component Props' },
        prev: { href: 'demo/template-condition', title: 'Template Condition' },
      })}
    </Route>

    <Route path="/demo/component-props">
      {main({
        color: 'purple',
        view: ComponentProps,
        title: 'Component Properties',
        next: { href: 'demo/connect-store', title: 'Connect Store' },
        prev: { href: 'demo/component-state', title: 'Condition State' },
      })}
    </Route>

    <Route path="/demo/connect-store">
      {main({
        color: 'purple',
        view: ConnectStore,
        title: 'Component Properties',
        prev: { href: 'demo/component-props', title: 'Component Props' },
      })}
    </Route>
  </Switch>
}
