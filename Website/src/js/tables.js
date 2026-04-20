(() => {
	function resolveContainer(containerId) {
		if (!containerId) return null;
		return typeof containerId === 'string'
			? document.getElementById(containerId)
			: containerId;
	}

	function escapeHtml(value) {
		return String(value ?? '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function renderTable(containerId, columns, rows, actions = []) {
		const container = resolveContainer(containerId);
		if (!container) return;

		const safeRows = Array.isArray(rows) ? rows : [];
		const safeColumns = Array.isArray(columns) ? columns : [];
		const safeActions = Array.isArray(actions) ? actions : [];

		const actionHeader = safeActions.length ? '<th>Actions</th>' : '';
		const headerHtml = safeColumns.map(c => `<th>${escapeHtml(c.label)}</th>`).join('');

		const rowsHtml = safeRows.length === 0
			? `<tr><td colspan="${safeColumns.length + (safeActions.length ? 1 : 0)}">No records found.</td></tr>`
			: safeRows.map((row, rowIndex) => {
				const cells = safeColumns.map(col => {
					const value = row[col.key] ?? '';
					return col.isHtml
						? `<td>${value}</td>`
						: `<td>${escapeHtml(value)}</td>`;
				}).join('');

				const actionsHtml = safeActions.length
					? `<td class="actions">
						${safeActions.map((a, actionIndex) => {
							const className = a.className || 'btn btn--outline btn--table';
							return `
								<button 
									type="button"
									class="${escapeHtml(className)}"
									data-action-index="${actionIndex}"
									data-row-index="${rowIndex}">
									${escapeHtml(a.label || 'Action')}
								</button>
							`;
						}).join(' ')}
					</td>`
					: '';

				return `<tr>${cells}${actionsHtml}</tr>`;
			}).join('');

		container.innerHTML = `
			<div class="table-wrapper">
				<div class="table-scroll">
					<table class="table">
						<thead>
							<tr>${headerHtml}${actionHeader}</tr>
						</thead>
						<tbody>${rowsHtml}</tbody>
					</table>
				</div>
			</div>
		`;

		container.querySelectorAll('[data-action-index]').forEach(btn => {
			btn.addEventListener('click', () => {
				const action = safeActions[+btn.dataset.actionIndex];
				const row = safeRows[+btn.dataset.rowIndex];

				if (action?.onClick) action.onClick(row);
			});
		});
	}

	window.renderTable = renderTable;
})();