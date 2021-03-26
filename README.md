moduler2.js
==========

> A javascript framework for async loading and binding of es6 modules to DOM elements.

# Installation
`npm i moduler2 --save`

## Initiate
```
import moduler2 from '../moduler2.js';

moduler2({
    'path': './modules/',
});
```

## Options
* *path* - _string (Path to modules folder)
* *element* - _HTMLElement (Defaults to document.element if left out)

## Module example
```
export function MyModule (data) {
	let module = this;

	module.settings = {
		color: 'red',
		...data,
	}

	module.init = () => {
		module.element.addEventListener('click', module.someFunction, false);
	}

	module.destroy = () => {
		module.element.removeEventListener('click', module.someFunction, false);
	}
	
	module.someFunction = (event) => {
		event.target.style.background = module.settings.color;
	}
}
```

## Add data attributes to your markup.
This is what makes the module run on the page.
`<div data-module="mymodule" data-mymodule="color: 'blue'"></div>`

## Develop the framwork
Start a simple webserver with the following command from the root:
`npx http-server -o`