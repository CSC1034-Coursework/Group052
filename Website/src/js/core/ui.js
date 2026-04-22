// core/ui.js — User interface utilities. Alerts, confirmations, dropdowns, loading states.

window.ui = {
    
    /**
    * Show a confirmation dialog and return the user's choice as a boolean promise.
    * @example if (await ui.confirm('Delete this item?')) { ... }
    */
    confirm(message) {
        return Promise.resolve(confirm(message));
    },

    /**
    * Show a success message alert and log it to the console.
    * @example ui.success('Saved successfully!')
    */    success(message) {
        alert(message);
        console.log('[Success]', message);
    },

    /**
    * Show an error message alert with 'Error:' prefix and log to console.
    * @example ui.error('Failed to save')
    */    error(message) {
        alert(`Error: ${message}`);
        console.error('[Error]', message);
    },
    
    /**
    * Populate a select element with options from a data array.
    * @example ui.populateSelect(selectEl, regions, 'regionID', 'regionName', true)
    */
    populateSelect(selectElement, data, valueKey, labelKey, includeAll = false) {
        if (!selectElement) return;

        const previousValue = selectElement.value;
        selectElement.innerHTML = '';

        if (includeAll) {
            const allOption = document.createElement('option');
            allOption.value = 'All';
            allOption.textContent = 'All';
            selectElement.appendChild(allOption);
        }

        data.forEach((item) => {
            const option = document.createElement('option');
            option.value = String(item[valueKey]);
            option.textContent = item[labelKey];
            selectElement.appendChild(option);
        });

        if ([...selectElement.options].some((option) => option.value === previousValue)) {
            selectElement.value = previousValue;
        }
    },

    /**
    * Execute an async operation while showing a loading state on a button.
    * @example ui.withLoadingButton(button, async () => await saveData())
    */
    async withLoadingButton(button, asyncOperation) {
        if (!button) return asyncOperation();

        const originalText = button.textContent;
        const originalDisabled = button.disabled;

        try {
            button.disabled = true;
            button.textContent = 'Loading...';
            return await asyncOperation();
        } finally {
            button.disabled = originalDisabled;
            button.textContent = originalText;
        }
    },

    /**
    * Toggle a button's loading state (disabled + text change).
    * @example ui.setButtonLoading(button, true, 'Saving...')
    */
    setButtonLoading(button, isLoading, text = 'Loading...') {
        if (!button) return;
        button.disabled = isLoading;
        if (isLoading) {
            button.dataset.originalText = button.textContent;
            button.textContent = text;
        } else {
            button.textContent = button.dataset.originalText || 'Save';
        }
    },
};
