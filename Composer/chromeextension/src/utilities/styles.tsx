import { css } from '@emotion/css';
import { PartialTheme } from '@fluentui/react';
import { DefaultTheme } from '@fluentui/theme-samples';

// https://fabricweb.z5.web.core.windows.net/pr-deploy-site/refs/heads/7.0/theming-designer/index.html
const defaultTheme: PartialTheme = DefaultTheme;

export const buttonStyle = css`
    display: inline-block;
    color: ${defaultTheme.semanticColors.buttonText};
    background-color: ${defaultTheme.semanticColors.buttonBackground};
    &:hover{
        background-color: ${defaultTheme.semanticColors.buttonBackgroundHovered};
    }
    border-color: ${defaultTheme.semanticColors.buttonBorder};
    border-style: solid;
    border-width: 1px;
    border-radius: 2px;
    padding: 2px;
    margin: 1px;
    user-select: none;
`;

export const dividerColor = defaultTheme.semanticColors.menuDivider;
