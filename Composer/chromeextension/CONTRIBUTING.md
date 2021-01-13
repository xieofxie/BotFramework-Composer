# Contributing

## Build

### Build Composer first

``` bash
cd Composer
yarn install
yarn build
```

### Setup Packages

The following are workarounds for some misconfiguration of webpack, but I don't know how to fix:

- Delete `Composer\node_modules\mutation-summary\src\mutation-summary.ts`
- Delete field `exports.'.'.require` in `Composer\node_modules\nanoid\package.json`

### Build and Install

```bash
cd Composer/chromeextension
yarn watch
```

Open `chrome://extensions/` -> turn on `Developer mode` -> Load unpacked for `Composer\chromeextension\dist` folder.
