/* Admin JS — Todday Modas (media uploader da logo) */
(function () {
	'use strict';

	document.addEventListener('DOMContentLoaded', function () {
		var btnUpload = document.getElementById('tm-logo-upload');
		var btnRemove = document.getElementById('tm-logo-remove');
		var input = document.getElementById('tm_logo_id');
		if (!btnUpload || !input) {
			return;
		}

		var frame = null;
		btnUpload.addEventListener('click', function (e) {
			e.preventDefault();
			if (frame) {
				frame.open();
				return;
			}
			frame = wp.media({
				title: btnUpload.textContent,
				button: { text: btnUpload.textContent },
				library: { type: 'image' },
				multiple: false
			});
			frame.on('select', function () {
				var attachment = frame.state().get('selection').first().toJSON();
				input.value = attachment.id;
				var preview = document.querySelector('.tm-logo-preview');
				if (preview) {
					var url = (attachment.sizes && attachment.sizes.medium) ? attachment.sizes.medium.url : attachment.url;
					preview.innerHTML = '<img src="' + url + '" alt="" />';
				}
				if (btnRemove) {
					btnRemove.disabled = false;
				}
			});
			frame.open();
		});

		if (btnRemove) {
			btnRemove.addEventListener('click', function (e) {
				e.preventDefault();
				input.value = '0';
				var preview = document.querySelector('.tm-logo-preview');
				if (preview) {
					preview.innerHTML = '<span class="tm-logo-vazio"></span>';
				}
				btnRemove.disabled = true;
			});
		}
	});
})();
