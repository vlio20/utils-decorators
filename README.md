# utils-decorators
[![Build Status](https://travis-ci.org/vlio20/utils-decorators.svg?branch=master)](https://travis-ci.org/vlio20/utils-decorators)      
[![Coverage Status](https://coveralls.io/repos/github/vlio20/utils-decorators/badge.svg?branch=master)](https://coveralls.io/repos/github/vlio20/utils-decorators/)   
[![Mutation testing badge](https://badge.stryker-mutator.io/github.com/vlio20/utils-decorators/master)](https://stryker-mutator.github.io)      
  
This library was highly inspired by lodash but uses decorators to implement its util methods.   
The lib can be used both in node and in web application, it is built to be **tree-shakable so you can use it even if you need a specific decorator**.  
Also, note that this library can be used both as **functions and decorators**, 

<a href="https://opencollective.com/utils-decorators#backers" target="_blank"><img src="https://opencollective.com/utils-decorators/backers.svg?width=890"></a> 

### installation:

```bash
npm install utils-decorators@3
```   

Use Node.js `^22.18.0 || >=24.11.0`. Function wrappers work in JavaScript and
TypeScript; decorator syntax requires a compatible legacy decorator compiler.
For TypeScript, use 5.4+ with `strict` and `experimentalDecorators` enabled.

See [installation and TypeScript setup](https://vlio20.github.io/utils-decorators/#install)
and [migration to 3.0.0, including breaking changes](https://vlio20.github.io/utils-decorators/#migration).

# Docs 
check the <a href="https://vlio20.github.io/utils-decorators/" target="_blank">documentation</a>

### Local docs preview

Open `site/index.html` directly in a browser; no install or build is needed. The new
layout covers installation, migration to 3.0.0, and all 18 decorators. Each page
is a native Web Component with an HTML template. The `after`
component is `site/pages/after/after-page.js`; shared components live under
`site/components/`. The entry point displays `<after-page>` inside `<docs-shell>`.
Styling and navigation live in `site/docs.css` and `site/docs.js`.
Syntax highlighting uses the existing local `site/libs/highlight.js`.

See `site/README.md` for adding pages and serving the same files locally or on
a static host.

# Feedback
I will be more than happy to hear your feedback, don't hesitate to ask any question or open an issue. PRs are always welcomed :)  
Also, I will be happy to hear about new ideas for new decorators, if you have such, please open an issue and describe the requirements and features of your decorator. 
