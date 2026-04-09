# Modernisation Plan

All 361 tests pass and the app runs. The tasks below bring the project fully up to date.

---

## 1. Remove tslint → Migrate to ESLint

tslint is deprecated and unmaintained. It still runs in the build but will not receive updates.

- Remove `tslint` and `@types/tslint` from `devDependencies`
- Remove the `tslint` script from `package.json`
- Remove `conf/tslint.json`
- Install `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`
- Add `eslint.config.js` with equivalent rule coverage
- Update `build-dev` script: replace `npm run tslint` with `npm run lint`

---

## 2. Enable TypeScript Strict Mode

`strict: false` was set to keep the build green during the upgrade. There are **78 errors** to fix before strict mode can be re-enabled — all in source files, not tests.

Main files affected:

| File | Issues |
|---|---|
| `src/structure-view/app/structure-view.ts` | 13 errors — implicit `any[]`, `null` assigned to typed vars, uninitialized properties |
| `src/structure-view/app/structure-view-node.ts` | 6 errors — uninitialized properties |
| `src/structure-map/structure-map-package-builder.ts` | multiple implicit any, null assignment |
| `src/structure-map/structure-map-package.ts` | implicit any arrays |
| `src/structure-map/extension-registry.ts` | Map bracket-notation instead of `.get()`/`.set()` |
| `src/module-structure.ts` | implicit any on logger, callback params |
| test files | uninitialized class properties, `null` passed to `.throw()` |

Steps:
- Fix each file's type errors (add explicit types, `!` assertions, `?.` optional chaining)
- Remove `"strict": false` from both `tsconfig.json` and `conf/tsconfig.prod.json`

---

## 3. Resolve TypeScript Module Resolution Deprecation

`moduleResolution: "node"` is deprecated in TypeScript 6 (silenced via `ignoreDeprecations: "6.0"`). It will stop working in TypeScript 7.

- Migrate to `moduleResolution: "bundler"` in `conf/tsconfig.prod.json` (webpack handles bundling)
- Migrate to `moduleResolution: "node16"` (or `"bundler"`) in `tsconfig.json` for tests
- Fix any import resolution errors that surface (likely require adding `.js` extensions to relative imports or adjusting path aliases)
- Remove `"ignoreDeprecations": "6.0"` from both tsconfig files once resolved

---

## 4. Fix Duplicate jQuery Bundling

jQuery is currently bundled into **both** `vendor.js` and `app.js` because webpack 5 does not automatically share modules between entry points.

Options (pick one):

**Option A — Remove the vendor entry point** (simplest)
- Delete `src/structure-view/vendor.ts` and its entry in `webpack.common.js`
- jQuery is already provided via `ProvidePlugin` in `app.js`

**Option B — Configure `optimization.splitChunks`**
- Add to `webpack.common.js`:
  ```js
  optimization: {
      splitChunks: {
          chunks: "all",
          cacheGroups: {
              vendor: { test: /[\\/]node_modules[\\/]/, name: "vendor" }
          }
      }
  }
  ```
- Update `index.html` template if chunk names change

---

## 5. Replace `file-loader` with webpack 5 Asset Modules

`file-loader` is deprecated in webpack 5. The built-in asset module system replaces it.

In `webpack.common.js`, replace:
```js
{test: /\.(png|jpe?g|gif|woff|woff2|ttf|eot|ico)$/, use: {loader: "file-loader", options: {name: "assets/[name].[hash].[ext]"}}},
{test: /\.svg/, use: {loader: "file-loader", options: {name: "assets/[name].[ext]"}}},
```
With:
```js
{test: /\.(png|jpe?g|gif|woff|woff2|ttf|eot|ico|svg)$/, type: "asset/resource", generator: {filename: "assets/[name][hash][ext]"}},
```
Then remove `file-loader` from `devDependencies`.

---

## 6. Remove Stale devDependencies

Packages still listed in `package.json` that are no longer used:

- `script-loader` — removed from webpack config, still in `devDependencies`
- `mv` — appears unused
- `mocha-typescript` — replaced by `@testdeck/mocha`
- `uglifyjs-webpack-plugin` — replaced by webpack 5 built-in TerserPlugin
- `extract-text-webpack-plugin` — replaced by `mini-css-extract-plugin`
- `awesome-typescript-loader` — replaced by `ts-loader`
- `source-map-loader` — check if actively used in any webpack config rule

Run `npm uninstall` for each confirmed unused package.

---

## 7. Upgrade sinon to v21

sinon v21 is blocked by a TypeScript 6 incompatibility in `@sinonjs/fake-timers` types (duplicate `withGlobal` identifier). Currently on sinon v19 with `skipLibCheck: true` as a workaround.

- Track the upstream issue: `@sinonjs/fake-timers` needs a type fix for TypeScript 6
- Once fixed, run `npm install sinon@latest @types/sinon@latest`
- If strict mode (task 2) is done first, re-evaluate whether `skipLibCheck` can be removed

---

## 8. Fix the `posttest` / codecov Script

The `posttest` script calls `codecov -f coverage/*.json` using the old `codecov` npm package which is deprecated.

- Remove `codecov` from `devDependencies`
- If CI coverage reporting is wanted, replace with the official [Codecov GitHub Action](https://github.com/codecov/codecov-action) in a CI workflow
- Update `posttest` to just `nyc report --reporter=json` (remove the codecov call)

---

## 9. Add `engines` Field to `package.json`

No minimum Node.js version is declared. TypeScript 6 requires Node.js ≥ 18.

```json
"engines": {
    "node": ">=18"
}
```

---

## 10. Add a CI Workflow

There is no CI configuration. Add a GitHub Actions workflow at `.github/workflows/ci.yml`:

```yaml
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm test
      - run: npm run build-prod-webapp
```

---

## 11. Clean Up Compiled `.js` Files from `src/`

The `build-dev` tsc pass outputs `.js` and `.js.map` files alongside `.ts` sources in `src/` and `test/`. These are checked in (or left on disk) and cause webpack to resolve pre-compiled JS instead of TypeScript source.

- Add `src/**/*.js`, `src/**/*.js.map`, `test/**/*.js`, `test/**/*.js.map` to `.gitignore`
- Change `resolve.extensions` in webpack config from `[".js", ".ts"]` to `[".ts", ".js"]` so webpack always prefers TypeScript source
- Verify the webpack prod build still works after the change

---

## Priority Order

| # | Task | Effort | Impact |
|---|---|---|---|
| 6 | Remove stale devDependencies | Low | Low |
| 8 | Fix posttest/codecov | Low | Low |
| 9 | Add engines field | Low | Low |
| 4 | Fix duplicate jQuery | Low | Medium |
| 5 | Replace file-loader | Low | Medium |
| 11 | Clean up compiled JS in src/ | Low | Medium |
| 1 | tslint → ESLint | Medium | High |
| 10 | Add CI workflow | Medium | High |
| 7 | Upgrade sinon to v21 | Low (blocked upstream) | Low |
| 2 | Enable strict mode | High | High |
| 3 | Fix moduleResolution deprecation | Medium | Medium |
