(() => {
	const state = {
		currentSubmit: null,
	};

	function escapeHtml(value) {
		return String(value ?? '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function buildField(field, value) {
		const id = `field-${field.name}`;
		const label = escapeHtml(field.label || field.name);
		const required = field.required ? 'required' : '';
		const type = field.type || 'text';

		if (type === 'select') {
			return `
				<div class="form-field">
					<label>${label}</label>
					<select name="${field.name}" ${required}>
						${(field.options || []).map(o => `
							<option value="${o.value}" ${o.value == value ? 'selected' : ''}>
								${o.label}
							</option>
						`).join('')}
					</select>
				</div>
			`;
		}

		if (type === 'textarea') {
			return `
				<div class="form-field">
					<label>${label}</label>
					<textarea name="${field.name}" ${required}>${escapeHtml(value ?? '')}</textarea>
				</div>
			`;
		}

		const inputType = ['text','number','email','date'].includes(type) ? type : 'text';

		return `
			<div class="form-field">
				<label>${label}</label>
				<input 
					type="${inputType}"
					name="${field.name}"
					value="${escapeHtml(value ?? '')}"
					${required}
				/>
			</div>
		`;
	}

	function openForm(title, fields, data = {}, onSubmit) {
		const panel = document.getElementById('form-panel');
		if (!panel) return;

		panel.hidden = false;

		panel.innerHTML = `
			<div class="section__header">
				<h3>${escapeHtml(title)}</h3>
			</div>

			<form id="form">
				<div class="form-grid">
					${fields.map(f => buildField(f, data[f.name])).join('')}
				</div>

				<div class="form-actions">
					<button type="button" class="btn btn--outline" id="cancel">Cancel</button>
					<button type="submit" class="btn btn--primary">Save</button>
				</div>
			</form>
		`;

		const form = panel.querySelector('#form');

		panel.querySelector('#cancel').onclick = () => closeForm();

		state.currentSubmit = async () => {
			const result = {};
			fields.forEach(f => {
				result[f.name] = form.elements[f.name].value;
			});
			await onSubmit?.(result);
		};

		form.onsubmit = async (e) => {
			e.preventDefault();
			await state.currentSubmit?.();
		};
	}

	function closeForm() {
		const panel = document.getElementById('form-panel');
		if (!panel) return;
		panel.hidden = true;
		panel.innerHTML = '';
		state.currentSubmit = null;
	}

	window.openForm = openForm;
	window.closeForm = closeForm;
})();