export class Module1 {
	constructor(config) {
		this.color = config.color || 'red';
	}

	init () {
		this.el.addEventListener('click', this.someFunction.bind(this), false);
	}

	destroy () {
		this.el.removeEventListener('click', this.someFunction, false);
	}

	someFunction () {
		event.target.style.background = this.color;
	}
}