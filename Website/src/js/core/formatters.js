// core/formatters.js — Data formatting utilities. Formats values for display (dates, currency, etc.).

window.fmt = {
    
    /**
     * Format a date value to YYYY-MM-DD string format.
     * @example fmt.date('2026-04-20T10:30:00Z')
     */
    date(value) {
        if (!value) return '';

        if (typeof value === 'string' && value.length >= 10) {
            return value.slice(0, 10);
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }

        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${date.getFullYear()}-${month}-${day}`;
    },

    
        /**
     * Format a score value as a string; return '-' if null/empty.
     * @example fmt.nullableScore(null) // '-'
     */    nullableScore(value) {
        return value === null || value === undefined || value === '' ? '-' : String(value);
    },

    
        /**
     * Convert empty string or undefined to null; otherwise return value unchanged.
     * @example fmt.emptyToNull('') // null
     */    emptyToNull(value) {
        return value === '' || value === undefined ? null : value;
    },

    
        /**
     * Format a number value as currency string with £ symbol and 2 decimals.
     * @example fmt.currency(1234.567) // '£1234.57'
     */    currency(value) {
        return `£${Number(value || 0).toFixed(2)}`;
    },

    
        /**
     * Format a decimal value as a percentage string with 1 decimal place.
     * @example fmt.percentage(0.455) // '45.5%'
     */    percentage(value) {
        return `${Number(value || 0).toFixed(1)}%`;
    },

    
        /**
     * Get today's date in YYYY-MM-DD format.
     * @example fmt.today() // '2026-04-20'
     */    today() {
        const now = new Date();
        const month = `${now.getMonth() + 1}`.padStart(2, '0');
        const day = `${now.getDate()}`.padStart(2, '0');
        return `${now.getFullYear()}-${month}-${day}`;
    },

    
        /**
     * Format a number value with specified decimal places.
     * @example fmt.number(1234.5678, 2) // '1234.57'
     */    number(value, decimals = 2) {
        return Number(value || 0).toFixed(decimals);
    },

    
        /**
     * Format an object's firstName and lastName fields into a full name string.
     * @example fmt.fullName({firstName: 'John', lastName: 'Doe'}) // 'John Doe'
     */    fullName(obj) {
        if (!obj) return '';
        const first = obj.firstName || obj.first || '';
        const last = obj.lastName || obj.last || '';
        return `${first} ${last}`.trim();
    },
};
