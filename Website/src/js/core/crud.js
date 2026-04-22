// core/crud.js — HTML rendering engine. Renders forms and tables from schemas and data.

(() => {
	/**
    * Escape HTML entities to prevent XSS attacks.
    * @example escapeHtml('<script>alert("xss")</script>') // &lt;script&gt;...
    */
	function escapeHtml(value) {
		return String(value ?? '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	/**
    * Get DOM element by ID or return element as-is if already a DOM node.
    * @example resolveContainer('my-table') || resolveContainer(document.getElementById('table'))
    */
	function resolveContainer(containerId) {
		if (!containerId) return null;
		return typeof containerId === 'string'
			? document.getElementById(containerId)
			: containerId;
	}

	/**
    * Ensure options is always an array; return empty array if not array-like.
    * @example normalizeOptions(fieldDef.options)
    */
	function normalizeOptions(options = []) {
		return Array.isArray(options) ? options : [];
	}

	/**
    * Build HTML for a single form field (text, select, textarea, checkbox, date, etc.).
    * @example buildField({name: 'email', label: 'Email', type: 'email', required: true}, 'user@example.com')
    */
	function buildField(field, value) {
		const label = escapeHtml(field.label || field.name);
		const required = field.required ? 'required' : '';
		const disabled = field.disabled ? 'disabled' : '';
		const id = `field-${field.name}`;
		const wrapperClass = field.type === 'checkbox' ? 'form-field form-field--inline' : 'form-field';
		const inputAttrs = [
			`name="${escapeHtml(field.name)}"`,
			required,
			disabled,
			field.min !== undefined ? `min="${escapeHtml(field.min)}"` : '',
			field.max !== undefined ? `max="${escapeHtml(field.max)}"` : '',
			field.step !== undefined ? `step="${escapeHtml(field.step)}"` : '',
			field.placeholder ? `placeholder="${escapeHtml(field.placeholder)}"` : '',
		].filter(Boolean).join(' ');

		if (field.type === 'hidden') {
			return `<input type="hidden" id="${id}" ${inputAttrs} value="${escapeHtml(value ?? field.value ?? '')}" />`;
		}

		if (field.type === 'select') {
			const options = normalizeOptions(field.options)
				.map((option) => `
					<option value="${escapeHtml(option.value)}" ${String(option.value) == String(value) ? 'selected' : ''}>
						${escapeHtml(option.label)}
					</option>
				`)
				.join('');

			return `
				<div class="${wrapperClass}">
					<label for="${id}">${label}</label>
					<select id="${id}" ${inputAttrs}>
						${options}
					</select>
				</div>
			`;
		}

		if (field.type === 'textarea') {
			return `
				<div class="${wrapperClass}">
					<label for="${id}">${label}</label>
					<textarea id="${id}" ${inputAttrs}>${escapeHtml(value ?? '')}</textarea>
				</div>
			`;
		}

		if (field.type === 'checkbox') {
			const checked = value ? 'checked' : '';
			return `
				<div class="${wrapperClass}">
					<label for="${id}">
						<input id="${id}" type="checkbox" ${inputAttrs} ${checked} />
						<span>${label}</span>
					</label>
				</div>
			`;
		}

		if (field.type === 'datalist') {
			const options = normalizeOptions(field.options)
				.map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`)
				.join('');

			return `
				<div class="${wrapperClass}">
					<label for="${id}">${label}</label>
					<input id="${id}" type="text" list="list-${escapeHtml(field.name)}" ${inputAttrs} value="${escapeHtml(value ?? '')}" />
					<datalist id="list-${escapeHtml(field.name)}">${options}</datalist>
				</div>
			`;
		}

		const inputType = ['text', 'number', 'email', 'date'].includes(field.type) ? field.type : 'text';
		return `
			<div class="${wrapperClass}">
				<label for="${id}">${label}</label>
				<input id="${id}" type="${inputType}" ${inputAttrs} value="${escapeHtml(value ?? '')}" />
			</div>
		`;
	}

	/**
    * Render a data table with columns, rows, and action buttons (Edit/Delete).
    * @example renderTable('table-id', [{key: 'name', label: 'Name'}], rows, actions)
    */
	function renderTable(containerId, columns, rows, actions = []) {
		const container = resolveContainer(containerId);
		if (!container) return;

		const safeRows = Array.isArray(rows) ? rows : [];
		const safeColumns = Array.isArray(columns) ? columns : [];
		const safeActions = Array.isArray(actions) ? actions : [];
		const colspan = safeColumns.length + (safeActions.length ? 1 : 0);

		container.innerHTML = `
			<div class="table-wrapper">
				<div class="table-scroll">
					<table class="table">
						<thead>
							<tr>
								${safeColumns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('')}
								${safeActions.length ? '<th>Actions</th>' : ''}
							</tr>
						</thead>
						<tbody>
							${safeRows.length === 0
								? `<tr><td colspan="${colspan}">No records found.</td></tr>`
								: safeRows.map((row, rowIndex) => {
									const cells = safeColumns.map((column) => {
										const value = row[column.key] ?? '';
										return column.isHtml ? `<td>${value}</td>` : `<td>${escapeHtml(value)}</td>`;
									}).join('');

									const actionsHtml = safeActions.length
										? `<td class="actions">${safeActions.map((action, actionIndex) => `
											<button type="button" class="${escapeHtml(action.className || 'btn btn--outline btn--table')}" data-action-index="${actionIndex}" data-row-index="${rowIndex}">${escapeHtml(action.label || 'Action')}</button>
										`).join(' ')}</td>`
										: '';

									return `<tr>${cells}${actionsHtml}</tr>`;
								}).join('')}
						</tbody>
					</table>
				</div>
			</div>
		`;

		container.querySelectorAll('[data-action-index]').forEach((button) => {
			button.addEventListener('click', () => {
				const action = safeActions[Number(button.dataset.actionIndex)];
				const row = safeRows[Number(button.dataset.rowIndex)];
				action?.onClick?.(row);
			});
		});
	}

	/**
    * Render a form dialog with fields and submit handler; display in a panel.
    * @example openForm('Edit User', fields, {name: 'John'}, (data) => runQuery(...), 'form-panel')
    */
	function openForm(title, fields, data = {}, onSubmit, panelId = 'form-panel') {
		const panel = document.getElementById(panelId);
		if (!panel) return null;

		panel.hidden = false;
		panel.innerHTML = `
			<div class="section__header">
				<h3>${escapeHtml(title)}</h3>
			</div>
			<form id="form">
				<div class="form-grid">
					${(Array.isArray(fields) ? fields : []).map((field) => buildField(field, data[field.name])).join('')}
				</div>
				<div class="form-actions">
					<button type="button" class="btn btn--outline" id="cancel">Cancel</button>
					<button type="submit" class="btn btn--primary">Save</button>
				</div>
			</form>
		`;

		const form = panel.querySelector('#form');
		panel.querySelector('#cancel').onclick = () => closeForm(panelId);

		form.onsubmit = async (event) => {
			event.preventDefault();

			const result = {};
			(Array.isArray(fields) ? fields : []).forEach((field) => {
				const element = form.elements.namedItem(field.name);
				if (!element) {
					if (field.type === 'hidden') {
						result[field.name] = data[field.name] ?? field.value ?? '';
					}
					return;
				}

				if (field.type === 'checkbox') {
					result[field.name] = element.checked;
					return;
				}

				result[field.name] = element.value;
			});

			try {
				await onSubmit?.(result);
			} catch (error) {
				console.error('Form submission error:', error);
			}
		};

		setTimeout(() => {
			panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 50);

		return form;
	}

	/**
    * Hide and clear a form panel by ID.
    * @example closeForm('form-panel')
    */
	function closeForm(panelId = 'form-panel') {
		const panel = document.getElementById(panelId);
		if (!panel) return;

		panel.hidden = true;
		panel.innerHTML = '';
	}

	window.crud = {
		escapeHtml,
		renderTable,
		openForm,
		closeForm,
	};

	window.renderTable = renderTable;
	window.openForm = openForm;
	window.closeForm = closeForm;
})();
