(function () {
	'use strict';

	var base = window.PAGE_BASE || './';

	fetch(base + 'template.html')
		.then(function (response) {
			return response.text();
		})
		.then(function (html) {
			html = html.split('[BASE]').join(base);

			var parser = new DOMParser();
			var templateDoc = parser.parseFromString(html, 'text/html');
			var wrap = templateDoc.getElementById('site-wrap');
			var mainSlot = wrap.querySelector('main');

			var pageContent = document.getElementById('page-content');
			mainSlot.innerHTML = pageContent.innerHTML;

			document.body.innerHTML = '';
			document.body.appendChild(wrap);

			document.getElementById('copyrightYear').textContent = new Date().getFullYear();

			var qrImage = document.getElementById('qrImage');
			qrImage.src = 'https://quickchart.io/chart?cht=qr&chs=200x200&chl=' + encodeURIComponent(window.location.href);

			document.getElementById('qrToggle').addEventListener('click', function (event) {
				event.preventDefault();
				if (qrImage.style.display === 'block') {
					qrImage.style.display = 'none';
					this.textContent = 'QR Code';
				} else {
					qrImage.style.display = 'block';
					this.textContent = 'Hide QR';
				}
			});
		});
})();
