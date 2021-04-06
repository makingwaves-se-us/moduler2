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
export function MyModule (data) {
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

`<div data-module="mymodule" data-mymodule="color: 'blue'"></div>`
This will initiate a module named "mymodule" and bind it to the element. A prop (color: 'blue') is then added which becomes unique to this instance of the module. Several props can be added, separated by a comma (JSON syntax). The prop will overwrite the default one defined in the module, which makes each instance of the module highly customizable. A module can be attached to several elements on the page.

## Develop the framwork

Things that can come in handy when further developing the framework:

Start a simple webserver with the following command from the root:
`npx http-server -o`
