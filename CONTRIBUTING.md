# Contributing Guidelines

- [Code style](#code-style)
- [Code issues](#code-issues)
- [General formatting and issue fixing with npm](#code-issues)

## Code style

### Prettier
For this project, Prettier is the library we use for standardize code styling.
This document is going to only cover what's needed to work with Prettier so you upload code with a style that fits our standards.

### Installing Prettier in Visual Studio Code
If you're using Visual Studio Code, it would be very useful if you installed the Prettier extension, as it's going to make you able to automatically format a single file using "Alt + Shift + F". It's important to set Prettier as the default formatter for Visual Studio code also. If you're using "Alt + Shift + F" for the first time, probably you're going to be prompted for the desired formatter: choose Prettier here.

If you have another default formatter and you want to change it, please read [this documentation](https://github.com/prettier/prettier-vscode#default-formatter).

## Code issues
We use ESLint in this project for code issues. It's important to know that ESLint and Prettier check different things. So, code issues is not the same thing as code styling. For instance, an unused variable (ESLint) is not the same as a missing whitespace before a opening curly bracket (Prettier).

You can configure/disable as many rules as you want in ESLint using the [.eslintrc.js](./.eslintrc.js) file. Add the configurations in the "rules" element of the object.

## General formatting and issue fixing with npm
This project comes with a very-main [package.json](./package.json) file which has six scripts for code issues and styling purposes.
- `npm run check`: only checks what needs correction from ESLint and Prettier.
- `npm run format`: checks and auto-fixes what needs correction from ESLint and Prettier.
- `npm run check:prettier`: does the "only-check" process, but only considering code style (Prettier)
- `npm run check:eslint`: does the "only-check" process, but only considering code issues (ESLint)
- `npm run check:prettier`: does the "check and auto-fix" process, but only considering code style (Prettier)
- `npm run check:eslint`: does the "check and auto-fix" process, but only considering code issues (ESLint)

NOTE: Not every issue is auto-fixable. These issues have to be manually fixed, as ESLint can't auto-determine what's the solution for them. If you don't have issues, you're going to see no errors or warnings. 