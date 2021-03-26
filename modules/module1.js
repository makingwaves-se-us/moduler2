export function Module1 (data) {
	let self = this;

	self.settings = {
		color: 'red',
		...data,
	}

	self.init = function () {
		self.el.addEventListener('click', self.someFunction.bind(self), false);
	}

	self.destroy = function () {
		self.el.removeEventListener('click', self.someFunction, false);
	}
	
	self.someFunction = function (event) {
		event.target.style.background = self.settings.color;
	}
}