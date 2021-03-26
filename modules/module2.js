export function Module2 (data) {
	let self = this;

	self.settings = {
		color: 'red',
		...data,
	}

	self.init = function () {
		self.el.addEventListener('click', self.someOtherFunction.bind(self), false);
	}

	self.destroy = function () {
		self.el.removeEventListener('click', self.someOtherFunction, false);
	}
	
	self.someOtherFunction = function (event) {
		event.target.style.background = self.settings.color;
	}
}