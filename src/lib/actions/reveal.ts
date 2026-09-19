export function reveal(node: HTMLElement) {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	node.classList.add('reveal-init');

	const show = () => {
		node.classList.add('reveal-visible');
		observer.disconnect();
		clearTimeout(failsafe);
	};

	// threshold 0, not a fraction: a fraction of the element's own height can
	// exceed the viewport — the 19-event grid in one column is taller than any
	// screen, so a 0.2 threshold could never be met and the cards stayed at
	// opacity 0 forever. The bottom rootMargin delays the trigger until the
	// element is a little way in, which is what the fraction was there for.
	const observer = new IntersectionObserver(
		(entries) => {
			if (entries.some((entry) => entry.isIntersecting)) show();
		},
		{ threshold: 0, rootMargin: '0px 0px -8% 0px' }
	);
	observer.observe(node);

	// Content that is hidden until an observer fires must never depend on that
	// observer firing. If anything keeps it from doing so, show the content.
	const failsafe = setTimeout(show, 3000);

	return {
		destroy() {
			observer.disconnect();
			clearTimeout(failsafe);
		}
	};
}
