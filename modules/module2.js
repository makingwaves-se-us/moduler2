export class Module2 {
	constructor(config) {
		this.color = config.color || 'red';
	}

	init () {
		this.el.addEventListener('click', this.someOtherFunction.bind(this), false);
	}

	destroy () {
		this.el.removeEventListener('click', this.someOtherFunction, false);
	}

	someOtherFunction () {
		event.target.style.background = this.color;
	}
}