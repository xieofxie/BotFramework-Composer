// Composer\packages\client\src\plugins.ts

import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';
import type { MergeWithCustomizer } from 'lodash';

import type { PluginConfig } from '@bfc/extension-client';
import composer from '@bfc/ui-plugin-composer';

const mergeArrays: MergeWithCustomizer = (objValue, srcValue, key) => {
    if (isArray(objValue)) {
        // merge recognizers into defaults
        if (key === 'recognizers') {
            return srcValue.concat(objValue);
        }

        // otherwise override other arrays
        return srcValue;
    }
};

const defaultPlugin: Required<PluginConfig> = {
    uiSchema: {},
    widgets: {},
};

// ??
//export function mergePluginConfigs(plugin: PluginConfig, ...plugins: PluginConfig[]): Required<PluginConfig> {
export function mergePluginConfigs(plugin0: PluginConfig, plugin1: PluginConfig): Required<PluginConfig> {
    return mergeWith({}, defaultPlugin, plugin0, plugin1, mergeArrays);
}

export default mergePluginConfigs(
    composer,
    {}
);
