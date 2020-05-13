## Topic: equality

An important part of the architecture is that [reducers](./src/client/reducers)
and `mapStateToProps` funnctions must take care to ensure that the objects
don't change something actually changed, and more importantly that the objects
do change when something changes.  Equality is defined by shallow equals.

Consider:

    let a = { type: "counter", value: 1 };
    let b = a;
    b.value++;

The problem here is that `b` still strictly equals `a`.  Both refer to the
underlying data structure, and while that data structure did change, the
references did not.  Now let's look at a different implementation:

    let a = { type: "counter", value: 1 };
    let b = { ...a, a.value + 1 };

This uses the vintage 2018 JavaScript [spread
syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
to create a new object, copying all of the properties of the original object,
and overriding a single value.

With this approach, `a` and `b` are truly different.

[src/client/deepMerge.js](../../src/client/deepMerge.js) helps by eliminating
unnecessary differences.
