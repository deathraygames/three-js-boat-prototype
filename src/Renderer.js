import { WebGLRenderer, ACESFilmicToneMapping } from 'three';

class Renderer extends WebGLRenderer {
	constructor(options = {}) {
		super();
		// Desired width, height, aspect
		this.width = options.width || null; // window.innerWidth;
		this.height = options.height || null; // window.innerHeight;
		this.aspect = options.aspect || null;
		if (options.height && options.width) {
			this.aspect = options.width / options.height;
		}
		
		this.pixelated = Boolean(options.pixelated);
		this.setPixelRatio(window.devicePixelRatio);
		// this.setSize(this.width, this.height);
		this.toneMapping = ACESFilmicToneMapping;
		this.container = window.document.body;
		if (typeof options.container === 'string') this.container = window.document.getElementById('container');
		this.container.appendChild(this.domElement);
		this.fixSize();
	}

	fixSize(camera) {
		const w = this.width || window.innerWidth;
		const h = this.height || window.innerHeight;
		const aspect = this.aspect || (w / h); // Desired aspect
		const windowAspect = window.innerWidth / window.innerHeight; // Actual aspect
		this.setSize(w, h);
		// Set the style to help keep the aspect ratio desired
		const { style } = this.domElement;
		const expandWidth = (windowAspect <= this.aspect);
		style.width = expandWidth ? '100vw' : 'auto';
		style.height = expandWidth ? 'auto' : '100vh';
		if (this.pixelated) style.imageRendering = 'pixelated';
		if (camera) {
			camera.aspect = aspect;
			camera.updateProjectionMatrix();
		}
	}
}

// const renderer = new WebGLRenderer();
// renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setSize(window.innerWidth, window.innerHeight);
// window.document.body.appendChild(renderer.domElement);

/*
function onWindowResize() {

}
*/

export default Renderer;
