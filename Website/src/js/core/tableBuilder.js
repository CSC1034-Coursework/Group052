// core/tableBuilder.js — Table column schemas and data transformation. Build tables and format table data.

window.tableColumns = {
    
    /**
     * Create a text column definition.
     * @example tableColumns.text('programmeName', 'Programme')
     */
    text(key, label) {
        return { key, label };
    },

        /**
     * Create a date column definition; automatically formats dates via transform.
     * @example tableColumns.date('startDate', 'Start Date', 'startDateDisplay')
     */    date(key, label, displayKey = null) {
        const displayKeyFinal = displayKey || `${key}Display`;
        return { key: displayKeyFinal, label };
    },

        /**
     * Create a boolean column definition; shows Yes/No based on row value.
     * @example tableColumns.boolean('isActive', 'Active', 'isActiveDisplay')
     */    boolean(key, label, displayKey = null) {
        const displayKeyFinal = displayKey || `${key}Display`;
        return { key: displayKeyFinal, label };
    },


        /**
     * Create a currency column definition; formats monetary values with £ symbol.
     * @example tableColumns.currency('amount', 'Amount (£)', 'amountDisplay')
     */    currency(key, label, displayKey = null) {
        const displayKeyFinal = displayKey || `${key}Display`;
        return { key: displayKeyFinal, label };
    },

        /**
     * Create a percentage column definition.
     * @example tableColumns.percentage('passRate', 'Pass Rate')
     */    percentage(key, label) {
        return { key, label };
    },

 
        /**
     * Create an HTML column definition; renders cell content as-is without escaping.
     * @example tableColumns.html('statusBadge', 'Status')
     */    html(key, label) {
        return { key, label, isHtml: true };
    },

        /**
     * Create a badge column definition; renders cell content as HTML without escaping.
     * @example tableColumns.badge('regionBadge', 'Region')
     */    badge(key, label) {
        return { key, label, isHtml: true };
    },
};



window.tableTransforms = {

    
    /**
     * Transform row dates to formatted display strings using fmt.date().
     * @example tableTransforms.dates(rows, {enrolDate: 'enrolDateDisplay'})
     */
    dates(rows, dateFields = {}) {
        return rows.map((row) => {
            const transformed = { ...row };
            for (const [key, displayKey] of Object.entries(dateFields)) {
                transformed[displayKey] = window.fmt.date(row[key]);
            }
            return transformed;
        });
    },

        /**
     * Transform row booleans to display labels (Yes/No) based on config.
     * @example tableTransforms.booleans(rows, {attended: {displayKey: 'attendedDisplay', trueLabel: 'Yes'}})
     */    booleans(rows, boolFields = {}) {
        return rows.map((row) => {
            const transformed = { ...row };
            for (const [key, config] of Object.entries(boolFields)) {
                const value = Number(row[key]) === 1;
                transformed[config.displayKey] = value ? (config.trueLabel || 'Yes') : (config.falseLabel || 'No');
            }
            return transformed;
        });
    },


        /**
     * Transform row currency values to formatted display strings using fmt.currency().
     * @example tableTransforms.currencies(rows, ['amount', 'budget'])
     */    currencies(rows, currencyFields = []) {
        return rows.map((row) => {
            const transformed = { ...row };
            currencyFields.forEach((key) => {
                transformed[`${key}Display`] = window.fmt.currency(row[key]);
            });
            return transformed;
        });
    },


        /**
     * Apply all transforms (dates, booleans, currencies) to rows in one operation.
     * @example tableTransforms.apply(rows, {dates: {...}, booleans: {...}, currencies: [...]})
     */    apply(rows, config = {}) {
        let transformed = rows;

        if (config.dates) {
            transformed = this.dates(transformed, config.dates);
        }
        if (config.booleans) {
            transformed = this.booleans(transformed, config.booleans);
        }
        if (config.currencies) {
            transformed = this.currencies(transformed, config.currencies);
        }

        return transformed;
    },
};
