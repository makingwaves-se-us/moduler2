export function Module2 (data) {
	let module = this;

	module.settings = {
		color: 'red',
		...data,
	}

	module.init = () => {
		module.element.addEventListener('click', module.someOtherFunction, false);
	}

	module.destroy = () => {
		module.element.removeEventListener('click', module.someOtherFunction, false);
	}
	
	module.someOtherFunction = (event) => {
		event.target.style.background = module.settings.color;
	}
}