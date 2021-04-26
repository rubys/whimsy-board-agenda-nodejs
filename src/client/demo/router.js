import React from "react";
import { Switch, Route } from "react-router-dom";
import Index from './index.js';
import DemoObject from './object.js';
import TemplateVariable from './template-variable.js';
import TemplateIteration from './template-iteration.js';
import TemplateCondition from './template-condition.js';
import ComponentState from './component-state.js';
import ComponentProps from './component-props.js';
import ConnectStore from './connect-store.js';
import Conclusion from './conclusion.js';

export default function router(props) {
  let { main } = props;

  return <Switch>
    <Route exact path="/demo/">
      {main({
        color: 'docpage',
        view: Index,
        next: { href: 'demo/object', title: 'Object' },
      })}
    </Route>

    <Route path="/demo/object">
      {main({
        color: 'docpage',
        view: DemoObject,
        title: 'Object',
        next: { href: 'demo/template-variable', title: 'Template Variable' },
        prev: { href: 'demo/', title: 'Index' }
      })}
    </Route>

    <Route path="/demo/template-variable">
      {main({
        color: 'docpage',
        view: TemplateVariable,
        title: 'Template - Variable',
        next: { href: 'demo/template-array', title: 'Template Iteration' },
        prev: { href: 'demo/object', title: 'Object' }
      })}
    </Route>

    <Route path="/demo/template-array">
      {main({
        color: 'docpage',
        view: TemplateIteration,
        title: 'Template - Iteration',
        next: { href: 'demo/template-condition', title: 'Template Condition' },
        prev: { href: 'demo/template-variable', title: 'Template Variable' },
      })}
    </Route>

    <Route path="/demo/template-condition">
      {main({
        color: 'docpage',
        view: TemplateCondition,
        title: 'Template - Condition',
        next: { href: 'demo/component-state', title: 'Condition State' },
        prev: { href: 'demo/template-array', title: 'Template Iteration' },
      })}
    </Route>

    <Route path="/demo/component-state">
      {main({
        color: 'docpage',
        view: ComponentState,
        title: 'Component State',
        next: { href: 'demo/component-props', title: 'Component Props' },
        prev: { href: 'demo/template-condition', title: 'Template Condition' },
      })}
    </Route>

    <Route path="/demo/component-props">
      {main({
        color: 'docpage',
        view: ComponentProps,
        title: 'Component Properties',
        next: { href: 'demo/connect-store', title: 'Connect Store' },
        prev: { href: 'demo/component-state', title: 'Condition State' },
      })}
    </Route>

    <Route path="/demo/connect-store">
      {main({
        color: 'docpage',
        view: ConnectStore,
        title: 'REDUX Store',
        next: { href: 'demo/conclusion', title: 'Conclusion' },
        prev: { href: 'demo/component-props', title: 'Component Props' },
      })}
    </Route>

    <Route path="/demo/conclusion">
      {main({
        color: 'docpage',
        view: Conclusion,
        title: 'Demo Conclusion',
        prev: { href: 'demo/connect-store', title: 'Connect Store' },
        next: { href: 'docs', title: 'Documentation' },
      })}
    </Route>
  </Switch>
}
