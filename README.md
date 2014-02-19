# Django Superformset

jQuery Django Dynamic Formset Plugin

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/jgerigmeyer/jquery-django-superformset/master/dist/django-superformset.min.js
[max]: https://raw.github.com/jgerigmeyer/jquery-django-superformset/master/dist/django-superformset.js

In your web page:

```html
<form>
  <fieldset class="formlist">
    <input id="form-TOTAL_FORMS" type="hidden" value="1">
    <input id="form-MAX_NUM_FORMS" type="hidden" value="3">
    <div class="dynamic-form">
      <input type="checkbox" class="remove-row" name="form-0-DELETE" />
      <input type="checkbox" name="form-0-input" />
      <!-- any other inputs... -->
    </div>
  </fieldset>
  <div class="empty-form">
    <div class="dynamic-form" data-empty-permitted="true">
      <input type="checkbox" class="remove-row" name="form-__prefix__-DELETE" />
      <input type="checkbox" name="form-__prefix__-input" />
      <!-- any other inputs... -->
    </div>
  </div>
</form>

<script src="jquery.js"></script>
<script src="dist/django-superformset.min.js"></script>

<script>
jQuery(function($) {
  $('.formlist').superformset();
});
</script>
```

## Documentation

There are numerous options documented in the [development version].

Available options, explictly set to their defaults:

```html
$('.formlist').superformset({
    prefix: 'form',                 // The form prefix for your django formset
    containerSel: 'form',           // Container selector (must contain rows and formTemplate)
    rowSel: '.dynamic-form',        // Selector used to match each form (row) in a formset
    formTemplate: '.empty-form .dynamic-form',
                                    // Selector for empty form (row) template to be cloned to
                                    // ...generate new form instances
                                    // ...This must be outside the element on which ``formset`` is
                                    // ...called, but within the containerSel
    deleteTrigger: '<a href="#" class="remove-row" title="remove">remove</a>',
                                    // The HTML "remove" link added to the end of each form-row
                                    // ...(if ``canDelete: true``)
    deleteTriggerSel: '.remove-row',// Selector for HTML "remove" links
                                    // ...Used to target existing delete-trigger, or to target
                                    // ...``deleteTrigger``
    addTrigger: '<a href="#" class="add-row" title="add">add</a>',
                                    // The HTML "add" link added to the end of all forms if no
                                    // ...``addTriggerSel``
    addTriggerSel: null,            // Selector for trigger to add a new row, if already in markup
                                    // ...Used to target existing trigger; if provided,
                                    // ...``addTrigger`` will be ignored
    addedCallback: null,            // Function called each time a new form row is added
    removedCallback: null,          // Function called each time a form row is deleted
    addAnimationSpeed: 'normal',    // Speed (ms) to animate adding rows
                                    // ...If false, new rows will appear without animation
    removeAnimationSpeed: 'fast',   // Speed (ms) to animate removing rows
                                    // ...If false, new rows will disappear without animation
    autoAdd: false,                 // If true, the "add" link will be removed, and a row will be
                                    // ...automatically added when text is entered in the final
                                    // ...textarea of the last row
    alwaysShowExtra: false,         // If true, an extra (empty) row will always be displayed
                                    // ...(requires ``autoAdd: true``)
    deleteOnlyActive: false,        // If true, extra empty rows cannot be removed until they
                                    // ...acquire focus (requires ``alwaysShowExtra: true``)
    canDelete: false,               // If false, rows cannot be deleted (removed from the DOM).
                                    // ...``deleteTriggerSel`` will remove ``required`` attr from
                                    // ...fields within a "deleted" row
                                    // ...deleted rows should be hidden via CSS
    deleteOnlyNew: false,           // If true, only newly-added rows can be deleted
                                    // ...(requires ``canDelete: true``)
    insertAbove: false,             // If true, ``insertAboveTrigger`` will be added to the end of
                                    // ...each form-row
    insertAboveTrigger: '<a href="#" class="insert-row" title="insert">insert</a>',
                                    // The HTML "insert" link add to the end of each form-row
                                    // ...(requires ``insertAbove: true``)
    optionalIfEmpty: true,          // If true, required fields in a row will be optional until
                                    // ...changed from their initial values
    optionalIfEmptySel: '[data-empty-permitted="true"]'
                                    // Selector for rows to apply optionalIfEmpty logic
                                    // ...(requires ``optionalIfEmpty: true``)
});
```

[development version]: https://raw.github.com/jgerigmeyer/jquery-django-superformset/master/dist/django-superformset.js

## Release History

* 1.0.1 - (02/19/2014) Add bower.json
* 1.0.0 - (10/14/2013) Initial release
