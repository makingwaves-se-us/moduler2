export function Module2 (data) {
	let module = this;

	module.settings = {
		color: 'red',
		...data,
	}

	module.init = function () {
		module.element.addEventListener('click', module.someOtherFunction, false);
	}

	module.destroy = function () {
		module.element.removeEventListener('click', module.someOtherFunction, false);
	}
	
	module.someOtherFunction = function (event) {
		event.target.style.background = module.settings.color;
	}
}