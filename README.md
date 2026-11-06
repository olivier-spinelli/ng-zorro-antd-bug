# ng-zorro-antd: a second `@angular/cdk` instance under Yarn Plug'n'Play

`ng-zorro-antd` depends on `@angular/cdk` and `@ant-design/icons-angular`, which both have `rxjs` as a peer
dependency, but it declares `rxjs` neither as a dependency nor as a peer dependency. Under Yarn Plug'n'Play (the
default linker of Yarn 2+), the CDK reached through ng-zorro-antd therefore gets no `rxjs`, while the application's CDK
gets the application's one: two different sets of peers, so Yarn creates two instances of `@angular/cdk`, and the
application runs two copies of the CDK.

npm and the node-modules linker hide the problem by hoisting.

## Reproduce

This project is only a `package.json` (ng-zorro-antd 22.2.0, @angular/cdk 22.2.6, Angular 22, rxjs 7.8). Yarn 4.18.1
is in `.yarn/releases`: any `yarn` command (Yarn 1, a global Yarn 4 or Corepack) runs it.

```
yarn install
```

```
➤ YN0086: │ Some peer dependencies are incorrectly met by dependencies; run yarn explain peer-requirements for details.
```

```
yarn explain peer-requirements
```

```
p2c7365 → ✘ ng-zorro-antd@npm:22.2.0 [e2df7] doesn't provide rxjs to @angular/cdk@npm:22.2.6 [d1970] and 1 other dependency
```

(The other dependency is `@ant-design/icons-angular`.) `yarn count-cdk` lists the instances of `@angular/cdk`
(with Yarn's `pnpapi`, see [count-cdk.cjs](count-cdk.cjs)):

```
2 instance(s) of @angular/cdk:
- virtual:d1970cbc6c2aca3ece7902... rxjs: none
- virtual:e2df7ef72387cc06f9449b... rxjs: npm:7.8.2
```

The first one is the CDK that ng-zorro-antd uses, without `rxjs`; the second one is the application's.

## The fix

Declaring `rxjs` in the `peerDependencies` of ng-zorro-antd (as `@angular/cdk` and `@ant-design/icons-angular` do):
the application's `rxjs` is then forwarded to the CDK of ng-zorro-antd and Yarn merges the two instances into one.

It can be checked from the application side, with a package extension: add this to `.yarnrc.yml`, then run
`yarn install` again.

```yaml
packageExtensions:
  "ng-zorro-antd@*":
    peerDependencies:
      "rxjs": "*"
```

```
yarn count-cdk
1 instance(s) of @angular/cdk:
- virtual:e2df7ef72387cc06f9449b... rxjs: npm:7.8.2
```

`yarn explain peer-requirements` no longer reports any unmet peer.
