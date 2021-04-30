import { srcPath } from '../config.js';
import { promises as fs } from 'fs';
import glob from 'glob';
import { Parser } from 'acorn';
import AcornStage3 from 'acorn-stage3';
import AcornJSX from 'acorn-jsx';

/*
Calls to Redux's mapStateToProps functions are /nearly/ declarative, enough
so that if the source code is parsed with a JavaScript parser into an abstract
symbol tree (AST), the items of state that are referenced by each source file
can be extracted.

While the parser used (Acorn) is a full function JavaScript parser, the
extraction of data from the AST is not a full interpreter, so the code below
may from time to time need to be updated to match any new idioms or code
patterns that are used in the source files.

As an example, currently the code assumes that the mapping function is named
mapStateToProps (in reality, this can be called anything as long as the
function is passed to redux's connect function), and that destructuring of
state is either done in parameter declarations to this function or in the
return statement.

xref returns a object where the keys are state paths and the values are arrays
of source files relative to the src/client directory.
*/

const JSParser = Parser.extend(AcornStage3, AcornJSX());

export default async function xref() {
  return new Promise((resolve, reject) => {
    glob('{*.js,**/*.js}', {cwd: `${srcPath}/client`}, async (error, files) => {
      if (error) reject(error);

      let xref = {};

      for (var file of files) {
        if (file.includes('__tests__/')) continue;
        let contents = await fs.readFile(`${srcPath}/client/${file}`, 'utf8');
        if (!contents.includes('mapStateToProps')) continue;

        let ast = JSParser.parse(
          contents,
          { sourceType: 'module', ecmaVersion: 2021 }
        )

        let mapStateToProps = ast.body.find(node =>
          node.type === 'FunctionDeclaration' &&
          node.id.name === 'mapStateToProps'
        )

        if (!mapStateToProps) continue;

        // a few mapStateToProps functions destructure state in the parameters to
        // the function itself
        if (mapStateToProps.params[0].type === 'ObjectPattern') {
          // eslint-disable-next-line no-loop-func
          function destruct(path, node) {
            node.properties.forEach(prop => {
              path.push(prop.key.name);
              switch (prop.value.type) {
                case 'ObjectPattern':
                  destruct(path, prop.value);
                  break;

                case 'Identifier':
                  let name = path.join('.')
                  if (!xref[name]) xref[name] = new Set();
                  xref[name].add(file)
                  break;

                default:
              }
              path.pop();
            });
          };

          mapStateToProps.params.forEach(param => destruct([], param));
          continue;
        }

        // more common case: mapStateToProps returns an object literal, where the
        // property values identify the part of the state being watched
        let result = mapStateToProps.body;

        if (result.type === 'BlockStatement') {
          result = result.body.find(node => node.type === 'ReturnStatement')
        }
        if (!result) continue;

        let { properties } = result.argument;
        for (let property of properties) {
          let value = property.value;

          let name = [];

          collect: for (; ;) {
            switch (value.type) {
              case 'LogicalExpression':
                value = value.left;
                break;

              case 'UnaryExpression':
                value = value.argument;
                break;

              case 'ChainExpression':
                value = value.expression;
                break

              case 'MemberExpression':
                if (!value.computed) {
                  name.unshift(value.property.name);
                }

                value = value.object;
                break;

              case 'CallExpression':
                if (value.callee.name === 'lookup') {
                  name = [value.arguments[0].value];
                  break collect
                } else {
                  name = [];

                  if (value.callee.property.name === 'values') {
                    value = value.arguments[0];
                  } else {
                    value = value.callee;
                  }
                }
                break;

              default:
                break collect
            }
          }

          if (value.type === 'Identifier') {
            if (value.name !== 'state') {
              name.unshift(value.name);
            }
          }

          name = name.join('.');
          if (!xref[name]) xref[name] = new Set();
          xref[name].add(file)
        }
      }

      xref = Object.fromEntries(Object.keys(xref).sort().map(key => [key, [...xref[key]]]));

      resolve(xref);
    })
  })
}
