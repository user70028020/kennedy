import { browser } from '$app/environment';

// Lazy load GSAP only when needed
let gsapInstance: typeof import('gsap').gsap | null = null;

async function getGsap() {
	if (!browser) return null;
	if (!gsapInstance) {
		const { gsap } = await import('gsap');
		gsapInstance = gsap;
	}
	return gsapInstance;
}

/**
 * Fade in animation
 */
export async function fadeIn(element: HTMLElement, options?: { duration?: number; delay?: number }) {
	const gsap = await getGsap();
	if (!gsap || !element) return;

	gsap.fromTo(
		element,
		{ opacity: 0, y: 20 },
		{
			opacity: 1,
			y: 0,
			duration: options?.duration ?? 0.3,
			delay: options?.delay ?? 0,
			ease: 'power2.out'
		}
	);
}

/**
 * Fade out animation
 */
export async function fadeOut(element: HTMLElement, options?: { duration?: number; delay?: number }) {
	const gsap = await getGsap();
	if (!gsap || !element) return;

	gsap.to(element, {
		opacity: 0,
		y: -10,
		duration: options?.duration ?? 0.2,
		delay: options?.delay ?? 0,
		ease: 'power2.in'
	});
}

/**
 * Scale in animation (for modals, dropdowns)
 */
export async function scaleIn(element: HTMLElement, options?: { duration?: number; delay?: number }) {
	const gsap = await getGsap();
	if (!gsap || !element) return;

	gsap.fromTo(
		element,
		{ opacity: 0, scale: 0.95 },
		{
			opacity: 1,
			scale: 1,
			duration: options?.duration ?? 0.2,
			delay: options?.delay ?? 0,
			ease: 'back.out(1.7)'
		}
	);
}

/**
 * Scale out animation
 */
export async function scaleOut(element: HTMLElement, options?: { duration?: number; delay?: number }) {
	const gsap = await getGsap();
	if (!gsap || !element) return;

	gsap.to(element, {
		opacity: 0,
		scale: 0.95,
		duration: options?.duration ?? 0.15,
		delay: options?.delay ?? 0,
		ease: 'power2.in'
	});
}

/**
 * Slide in from right
 */
export async function slideInRight(element: HTMLElement, options?: { duration?: number; delay?: number }) {
	const gsap = await getGsap();
	if (!gsap || !element) return;

	gsap.fromTo(
		element,
		{ opacity: 0, x: 50 },
		{
			opacity: 1,
			x: 0,
			duration: options?.duration ?? 0.3,
			delay: options?.delay ?? 0,
			ease: 'power2.out'
		}
	);
}

/**
 * Slide in from left
 */
export async function slideInLeft(element: HTMLElement, options?: { duration?: number; delay?: number }) {
	const gsap = await getGsap();
	if (!gsap || !element) return;

	gsap.fromTo(
		element,
		{ opacity: 0, x: -50 },
		{
			opacity: 1,
			x: 0,
			duration: options?.duration ?? 0.3,
			delay: options?.delay ?? 0,
			ease: 'power2.out'
		}
	);
}

/**
 * Stagger animation for lists
 */
export async function staggerIn(elements: HTMLElement[], options?: { duration?: number; stagger?: number }) {
	const gsap = await getGsap();
	if (!gsap || !elements.length) return;

	gsap.fromTo(
		elements,
		{ opacity: 0, y: 20 },
		{
			opacity: 1,
			y: 0,
			duration: options?.duration ?? 0.3,
			stagger: options?.stagger ?? 0.05,
			ease: 'power2.out'
		}
	);
}

/**
 * Button press animation
 */
export async function buttonPress(element: HTMLElement) {
	const gsap = await getGsap();
	if (!gsap || !element) return;

	gsap.to(element, {
		scale: 0.95,
		duration: 0.1,
		ease: 'power2.out',
		onComplete: () => {
			gsap.to(element, {
				scale: 1,
				duration: 0.1,
				ease: 'power2.out'
			});
		}
	});
}

/**
 * Shake animation (for errors)
 */
export async function shake(element: HTMLElement) {
	const gsap = await getGsap();
	if (!gsap || !element) return;

	gsap.to(element, {
		keyframes: [
			{ x: -10, duration: 0.1 },
			{ x: 10, duration: 0.1 },
			{ x: -10, duration: 0.1 },
			{ x: 10, duration: 0.1 },
			{ x: 0, duration: 0.1 }
		],
		ease: 'power2.out'
	});
}

/**
 * Pulse animation
 */
export async function pulse(element: HTMLElement, options?: { scale?: number; duration?: number }) {
	const gsap = await getGsap();
	if (!gsap || !element) return;

	gsap.to(element, {
		scale: options?.scale ?? 1.05,
		duration: (options?.duration ?? 0.3) / 2,
		ease: 'power2.out',
		onComplete: () => {
			gsap.to(element, {
				scale: 1,
				duration: (options?.duration ?? 0.3) / 2,
				ease: 'power2.out'
			});
		}
	});
}

/**
 * Dropdown animation
 */
export async function dropdownOpen(element: HTMLElement) {
	const gsap = await getGsap();
	if (!gsap || !element) return;

	gsap.fromTo(
		element,
		{ opacity: 0, y: -10, scaleY: 0.8 },
		{
			opacity: 1,
			y: 0,
			scaleY: 1,
			duration: 0.2,
			ease: 'power2.out',
			transformOrigin: 'top'
		}
	);
}

export async function dropdownClose(element: HTMLElement) {
	const gsap = await getGsap();
	if (!gsap || !element) return;

	gsap.to(element, {
		opacity: 0,
		y: -10,
		scaleY: 0.8,
		duration: 0.15,
		ease: 'power2.in',
		transformOrigin: 'top'
	});
}
