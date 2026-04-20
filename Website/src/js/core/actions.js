// core/actions.js — Action button factory for tables. Creates Edit and Delete button descriptors.

window.uiActions = {
    /**
     * Create an Edit action button descriptor.
     * @example editButton((row) => form.openForm(row))
     */
    editButton(onEdit) {
        return {
            label: 'Edit',
            className: 'btn btn--outline btn--action',
            onClick: (rowData) => onEdit(rowData),
        };
    },

    /**
     * Create a Delete action button descriptor with confirmation dialog.
     * @example deleteButton((row) => runQuery('DELETE...'), 'Are you sure?')
     */
    deleteButton(onDelete, message = 'Are you sure? This action cannot be undone.') {
        return {
            label: 'Delete',
            className: 'btn btn--outline btn--action--danger',
            onClick: async (rowData) => {
                const ok = await window.ui.confirm(message);
                if (!ok) {
                    return;
                }

                await onDelete(rowData);
            },
        };
    },

    /**
     * Create both Edit and Delete action buttons as an array.
     * @example standardActions((row) => form.open(row), (row) => runQuery('DELETE...'), 'Confirm delete?')
     */
    standardActions(onEdit, onDelete, message) {
        return [
            this.editButton(onEdit),
            this.deleteButton(onDelete, message),
        ];
    },
};
