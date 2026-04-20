// core/validators.js — Form validation rules. Validates user input (scores, currency, dates, required fields).

window.validators = {
    /**
     * Validate a score is a number between 0 and 100, or allow null/empty.
     * @example validators.score(85)
     */
    score(value) {
        if (value === null || value === undefined || value === '') {
            return { valid: true };
        }

        const num = Number(value);
        if (!Number.isFinite(num) || num < 0 || num > 100) {
            return { valid: false, message: 'Score must be between 0 and 100.' };
        }

        return { valid: true };
    },

    /**
     * Validate a currency amount is greater than a minimum value.
     * @example validators.currency(100.50, 10)
     */
    currency(value, minAmount = 0) {
        const num = Number(value);
        if (!Number.isFinite(num) || num <= minAmount) {
            return { valid: false, message: `Amount must be greater than ${minAmount}.` };
        }
        return { valid: true };
    },

    /**
     * Validate an end date is the same or after a start date.
     * @example validators.dateRange('2026-01-01', '2026-12-31')
     */
    dateRange(startDate, endDate) {
        if (endDate && endDate < startDate) {
            return { valid: false, message: 'End Date must be the same or after Start Date.' };
        }
        return { valid: true };
    },
    
    /**
     * Validate a field value is not empty; return error if required field is blank.
     * @example validators.required(formData.email, 'Email Address')
     */
    required(value, fieldName = 'Field') {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return { valid: false, message: `${fieldName} is required.` };
        }
        return { valid: true };
    },

    
    /**
     * Combine multiple validation results; return first error found, else valid.
     * @example validators.combine(required('name'), score('score'), currency('amount'))
     */
    combine(...validations) {
        for (const result of validations) {
            if (!result.valid) {
                return result;
            }
        }
        return { valid: true };
    },

    
    /**
     * Conditionally run a validator only if a condition is true; otherwise return valid.
     * @example validators.conditional(startDate && endDate, dateRange, startDate, endDate)
     */
    conditional(condition, validator, value, ...args) {
        if (!condition) {
            return { valid: true };
        }
        return validator(value, ...args);
    },
};
