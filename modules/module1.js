export function Module1 (data) {
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