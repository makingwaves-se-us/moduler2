# moduler2.js

> A javascript framework for async loading and binding of es6 modules to DOM elements.

# Installation

`npm i moduler2 --save`

## Initiate the framework from any js file

```
import { moduler2 } from 'moduler2';

moduler2({'path': './modules/'});
```

If the import fails, try specifying the package path in the node_modules folder directly, something like `import { moduler2 } from '../node_modules/moduler2/moduler2.mjs';`

## Options

-   _path_ - string (Path to modules folder)
-   _element_ - HTMLElement (Defaults to document.element if left out)

## Module example

```
export function MyModule (element, data) {
	let module = this;

	module.props = {
		color: 'red',
    ...data
	}

	module.init = () => {
		module.element.addEventListener('click', module.someFunction, false);
	}

	module.destroy = () => {
		module.element.removeEventListener('click', module.someFunction, false);
	}

	module.someFunction = (event) => {
		event.target.style.background = module.props.color;
	}
}
```

## Add data attributes to your markup.

This is what makes the module run on the page.
`<div data-module="mymodule" data-mymodule="color: 'blue'"></div>`

## Develop the framwork

Start a simple webserver with the following command from the root:
`npx http-server -o`
