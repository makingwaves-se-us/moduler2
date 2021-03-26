/*
	This new version of moduler utilizes modern javascript techniques like:
	* Dynimic module imports for efficient async loading of es6-modules
	* MutationObserver to detect DOM-changes
	* Proxy object for handling states (yet to be implemented)
*/

let state = {}; // TODO
let path = {};

export default function (settings) {
	path = settings.path;

	loadModules(settings.element || document.body);
	detectDomChanges();
}

export function loadModules (node) {
	const elements = node.querySelectorAll('[data-module]');

	// Iterate all nodes with a data-module attribute
	for (let element of elements) {
		let names = element.getAttribute('data-module').split(' ');

		// Iterate all module names in current data-module attribute
		for (let name of names) {
			addModuleToElement(name, element);
		}
	}
}

export function addModuleToElement (name, element) {
	// Abort if module is already loaded on the element
	if (element.modules && element.modules[name]) {
		return;
	}

	// Dynamicly import module
	import(path + name + '.js').then(Module => {
		if (Module) {
			// Add empty object to element property with module name as the key
			element.modules ? element.modules[name] = {} : element.modules = { [name]: {} };

			const data = parseData(element.getAttribute('data-' + name));
			const namePascal = name.replace(/^\w/, c => c.toUpperCase());
			element.modules[name] = new Module[namePascal](data);
			element.modules[name].el = element;
			element.modules[name].init();
		}
	}).catch(console.error);
}

export function removeModuleFromElement (name, element) {
	// Make sure module is loaded on element
	if (element.modules[name]) {
		// Run destroy method to remove stuff like attached events
		if (element.modules[name].destroy) {
			element.modules[name].destroy();
		}

		// Remove module name from element module-attribute
		if (element.getAttribute('module')) {
			element.setAttribute('module', element.getAttribute('module').replace(name, ''));
		}

		// Remove module-named object from element object
		delete element.modules[name];
	}
}

export function detectDomChanges () {
	// Callback function to execute when mutations are observed
	const callback = function(mutationsList) {
		for (let mutation of mutationsList) {
			// Node is added to DOM
			if (mutation.addedNodes.length) {
				// Look for new modules
				for (let node of mutation.addedNodes) {
					loadModules(node);
				}
			}

			// Node is removed from DOM
			if (mutation.removedNodes.length) {
				for (let node of mutation.removedNodes) {
					// If element has modules
					if (node.getAttribute('data-module').length) {
						for (let name in node.modules) {
							removeModuleFromElement(name, node);
						}
					}
				}
			}
		}
	};

	// Create an observer instance linked to the callback function
	const observer = new MutationObserver(callback);

	// Start observing the target node for configured mutations
	observer.observe(document.body, { childList: true });
}

function parseData (data) {
	let parsedData;

	if (!data) {
		parsedData = {};
	} else if (data[0] === '{') {
		// Replace single-quote character with double quotes
		parsedData = JSON.parse(data.replace(/'/g, '\"'));
	} else {
		// Wrap all property names with quotes and replace single-quote character with double quotes
		parsedData = JSON.parse('{' + data.replace(/([\w\-$]+):(?:|\s|\d|false|true|null|undefined|\{|\[|\"|\')/gi, '\"$1\":').replace(/'/g, '\"') + '}');
	}

	return parsedData;
};

export function setState (element, name, key, value) {

}

export function getState (element, name, key) {
	let value;

	return value;
}