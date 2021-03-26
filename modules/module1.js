export function Module1 (data) {
	let module = this;

	module.settings = {
		color: 'red',
		...data,
	}

	module.init = function () {
		module.element.addEventListener('click', module.someFunction, false);
	}

	module.destroy = function () {
		module.element.removeEventListener('click', module.someFunction, false);
	}
	
	module.someFunction = function (event) {
		event.target.style.background = module.settings.color;
	}
}