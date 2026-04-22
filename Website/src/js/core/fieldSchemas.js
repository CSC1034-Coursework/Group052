// core/fieldSchemas.js — Form field factory. Creates reusable field definitions for openForm().

window.fieldSchemas = {
   
    /**
    * Create a text input field definition.
    * @example fieldSchemas.text('firstName', 'First Name', true)
    */
    text(name, label, required = false) {
        return { name, label, type: 'text', required };
    },


    /**
    * Create an email input field definition.
    * @example fieldSchemas.email('contactEmail', 'Email Address', true)
    */ 
    email(name, label, required = false) {
        return { name, label, type: 'email', required };
    },


    /**
    * Create a number input field definition with optional min/max/step.
    * @example fieldSchemas.number('age', 'Age', {min: 0, max: 150})
    */ 
    number(name, label, options = {}) {
        return { 
            name, 
            label, 
            type: 'number', 
            min: options.min,
            max: options.max,
            step: options.step,
            placeholder: options.placeholder,
            required: options.required || false,
        };
    },


    /**
    * Create a date input field definition.
    * @example fieldSchemas.date('startDate', 'Start Date', true)
    */ 
    date(name, label, required = false) {
        return { name, label, type: 'date', required };
    },


    /**
    * Create a dropdown select field definition.
    * @example fieldSchemas.select('regionID', 'Region', [{value: 1, label: 'North'}, ...], true)
    */ 
    select(name, label, options = [], required = false) {
        return { name, label, type: 'select', options, required };
    },


    /**
    * Create a datalist field (autocomplete text input).
    * @example fieldSchemas.datalist('venue', 'Venue', [{value: 'London', label: 'London'}, ...])
    */ 
    datalist(name, label, options = [], required = false) {
        return { name, label, type: 'datalist', options, required };
    },


    /**
    * Create a multi-line text field definition.
    * @example fieldSchemas.textarea('notes', 'Notes', true)
    */ 
    textarea(name, label, required = false) {
        return { name, label, type: 'textarea', required };
    },


    /**
    * Create a checkbox field definition.
    * @example fieldSchemas.checkbox('isActive', 'Active')
    */ 
    checkbox(name, label) {
        return { name, label, type: 'checkbox', required: false };
    },

   
    /**
    * Create a hidden input field definition.
    * @example fieldSchemas.hidden('userID', 42)
    */ 
    hidden(name, value) {
        return { name, type: 'hidden', required: false, value };
    },

  
    /**
    * Create a currency input field definition (number with £0.01 min).
    * @example fieldSchemas.currency('budget', 'Budget (£)', {min: 100})
    */ 
    currency(name, label, options = {}) {
        return {
            name,
            label,
            type: 'number',
            min: options.min || 0.01,
            step: options.step || 0.01,
            required: options.required || false,
        };
    },


    /**
    * Create a score input field definition (0-100 number).
    * @example fieldSchemas.score('preAssessmentScore', 'Pre-Assessment Score', true)
    */ 
    score(name, label, required = false) {
        return { name, label, type: 'number', min: 0, max: 100, required };
    },


    /**
    * Create a percentage input field definition (0-100 with 0.1 step).
    * @example fieldSchemas.percentage('passRate', 'Pass Rate (%)', true)
    */ 
    percentage(name, label, required = false) {
        return { name, label, type: 'number', min: 0, max: 100, step: 0.1, required };
    },


    /**
    * Group multiple fields together for fieldset organization.
    * @example fieldSchemas.group(field1, field2, field3)
    */ 
    group(...fields) {
        return fields;
    },


    /**
    * Create a conditional field that shows only when another field has a specific value.
    * @example fieldSchemas.conditional({name: 'other', type: 'text'}, 'status', 'active')
    */ 
    conditional(field, dependsOn, showWhenValue) {
        return {
            ...field,
            depends: { field: dependsOn, value: showWhenValue },
        };
    },
};
