(function($) {

    module('init', {
        setup: function () {
            this.container = $('#qunit-fixture .container');
            this.formlist = this.container.find('.formlist');
            this.template = this.container.find('.empty-form .dynamic-form');
            this.templateInput = this.template.find('#template-input');
            this.modifiedTemplate = this.template.clone().removeAttr('id');
            this.modifiedTemplate.find('#template-input').addClass('required').removeAttr('required');
            this.row = this.formlist.find('.dynamic-form');
            this.methods = this.formlist.superformset('exposeMethods');
            sinon.stub(this.methods, 'addDeleteTrigger');
            sinon.stub(this.methods, 'addInsertAboveTrigger');
            sinon.stub(this.methods, 'watchForChangesToOptionalIfEmptyRow');
            sinon.stub(this.methods, 'activateAddTrigger');
            sinon.stub(this.methods, 'autoAddRow');
        },
        teardown: function () {
            this.methods.addDeleteTrigger.restore();
            this.methods.addInsertAboveTrigger.restore();
            this.methods.watchForChangesToOptionalIfEmptyRow.restore();
            this.methods.activateAddTrigger.restore();
            this.methods.autoAddRow.restore();
        }
    });

    test('init is chainable', 1, function () {
        ok(this.formlist.superformset().is(this.formlist), 'is chainable');
    });

    test('removes "required" attr and "required-by" data-attr from template', 3, function () {
        this.templateInput.data('required-by', true);
        this.formlist.superformset();

        ok(this.templateInput.hasClass('required'), 'template input has class "required"');
        ok(!this.templateInput.is('[required]'), 'template input no longer has "required" attr');
        strictEqual(this.templateInput.data('required'), undefined, 'template input no longer has "required-by" data-attr');
    });

    test('calls addDeleteTrigger with template and options.canDelete', 3, function () {
        this.formlist.superformset({canDelete: 'test-delete'});

        ok(this.methods.addDeleteTrigger.called, 'addDeleteTrigger was called');
        strictEqual(this.methods.addDeleteTrigger.args[0][0].get(0).outerHTML, this.modifiedTemplate.get(0).outerHTML, 'addDeleteTrigger was passed modified template');
        strictEqual(this.methods.addDeleteTrigger.args[0][1], 'test-delete', 'addDeleteTrigger was passed options.canDelete');
    });

    test('calls addInsertAboveTrigger with template', 2, function () {
        this.formlist.superformset();

        ok(this.methods.addInsertAboveTrigger.called, 'addInsertAboveTrigger was called');
        strictEqual(this.methods.addInsertAboveTrigger.args[0][0].get(0).outerHTML, this.modifiedTemplate.get(0).outerHTML, 'addInsertAboveTrigger was passed modified template');
    });

    test('calls addDeleteTrigger with each row', 2, function () {
        this.formlist.superformset({canDelete: true});

        ok(this.methods.addDeleteTrigger.called, 'addDeleteTrigger was called');
        ok(this.methods.addDeleteTrigger.args[1][0].is(this.row), 'addDeleteTrigger was passed row');
    });

    test('calls addDeleteTrigger with (options.canDelete && !options.deleteOnlyNew)', 4, function () {
        this.formlist.superformset();

        ok(!this.methods.addDeleteTrigger.args[1][1], 'addDeleteTrigger was passed "false" as second arg');

        this.methods.addDeleteTrigger.reset();
        this.formlist.superformset({canDelete: true});

        ok(this.methods.addDeleteTrigger.args[1][1], 'addDeleteTrigger was passed "true" as second arg');

        this.methods.addDeleteTrigger.reset();
        this.formlist.superformset({deleteOnlyNew: true});

        ok(!this.methods.addDeleteTrigger.args[1][1], 'addDeleteTrigger was passed "false" as second arg');

        this.methods.addDeleteTrigger.reset();
        this.formlist.superformset({canDelete: true, deleteOnlyNew: true});

        ok(!this.methods.addDeleteTrigger.args[1][1], 'addDeleteTrigger was passed "false" as second arg');
    });

    test('calls addInsertAboveTrigger with each row', 2, function () {
        this.formlist.superformset();

        ok(this.methods.addInsertAboveTrigger.called, 'addInsertAboveTrigger was called');
        ok(this.methods.addInsertAboveTrigger.args[1][0].is(this.row), 'addInsertAboveTrigger was passed row');
    });

    test('calls watchForChangesToOptionalIfEmptyRow with each row', 2, function () {
        this.formlist.superformset();

        ok(this.methods.watchForChangesToOptionalIfEmptyRow.calledOnce, 'watchForChangesToOptionalIfEmptyRow was called once');
        ok(this.methods.watchForChangesToOptionalIfEmptyRow.args[0][0].is(this.row), 'watchForChangesToOptionalIfEmptyRow was passed row');
    });

    test('calls activateAddTrigger if options.autoAdd is falsy', 1, function () {
        this.formlist.superformset();

        ok(this.methods.activateAddTrigger.calledOnce, 'activateAddTrigger was called once');
    });

    test('does not call activateAddTrigger if options.autoAdd is truthy', 1, function () {
        this.formlist.superformset({autoAdd: true});

        ok(!this.methods.activateAddTrigger.called, 'activateAddTrigger was not called');
    });

    test('calls autoAddRow if options.alwaysShowExtra && options.autoAdd are truthy', 4, function () {
        this.formlist.superformset();

        ok(!this.methods.autoAddRow.called, 'autoAddRow was not called');

        this.methods.autoAddRow.reset();
        this.formlist.superformset({alwaysShowExtra: true});

        ok(!this.methods.autoAddRow.called, 'autoAddRow was not called');

        this.methods.autoAddRow.reset();
        this.formlist.superformset({autoAdd: true});

        ok(!this.methods.autoAddRow.called, 'autoAddRow was not called');

        this.methods.autoAddRow.reset();
        this.formlist.superformset({alwaysShowExtra: true, autoAdd: true});

        ok(this.methods.autoAddRow.calledOnce, 'autoAddRow was called once');
    });

    test('removes "name" attr from .extra-row inputs on form submit', 1, function () {
        var newRow = this.row.clone().addClass('extra-row').appendTo(this.formlist);
        var input = newRow.find('.test-input');
        this.container.on('submit', function (e) { e.preventDefault(); });
        this.formlist.superformset({alwaysShowExtra: true, autoAdd: true});
        this.container.trigger('submit');

        ok(!input.is('[name]'), '.extra-row input no longer has "name" attr');
    });


    module('activateAddTrigger', {
        setup: function () {
            this.container = $('#qunit-fixture .container');
            this.formlist = this.container.find('.formlist');
            this.template = this.container.find('.empty-form .dynamic-form').clone().removeAttr('id');
            this.template.find('#template-input').addClass('required').removeAttr('required');
            this.newRow = this.template.clone().addClass('new-row');
            this.newInput = this.newRow.find('#template-input').attr('required', 'required');
            this.row = this.formlist.find('.dynamic-form');
            this.addButton = this.formlist.find('.add');
            this.totalForms = this.formlist.find('#test-form-TOTAL_FORMS');
            this.methods = this.formlist.superformset('exposeMethods');
            this.vars = {
                options: $.extend({}, $.fn.superformset.defaults),
                wrapper: this.formlist,
                totalForms: this.totalForms,
                template: this.template
            };
            this.vars.options.addTriggerSel = '.add';
            this.vars.options.addAnimationSpeed = false;
            sinon.stub(this.methods, 'showAddButton').returns(true);
            sinon.stub(this.methods, 'updateElementIndex');
            sinon.stub(this.methods, 'watchForChangesToOptionalIfEmptyRow');
        },
        teardown: function () {
            this.methods.showAddButton.restore();
            this.methods.updateElementIndex.restore();
            this.methods.watchForChangesToOptionalIfEmptyRow.restore();
        }
    });

    test('if options.addTriggerSel is missing, appends options.addTrigger to wrapper', 1, function () {
        delete this.vars.options.addTriggerSel;
        this.formlist.superformset('activateAddTrigger', this.vars);

        ok(this.formlist.find('.add-row').length, '.add-row has been appended to wrapper');
    });

    test('hides the addButton if methods.showAddButton returns false', 1, function () {
        this.methods.showAddButton.returns(false);
        this.formlist.superformset('activateAddTrigger', this.vars);

        ok(!this.addButton.is(':visible'), 'addButton has been hidden');
    });

    test('does not hide addButton if methods.showAddButton returns true', 1, function () {
        this.formlist.superformset('activateAddTrigger', this.vars);

        ok(this.addButton.is(':visible'), 'addButton has not been hidden');
    });

    test('inserts new row after last row on addButton click', 1, function () {
        var expected = this.newRow.html();
        this.formlist.superformset('activateAddTrigger', this.vars);
        this.addButton.trigger('click');

        strictEqual(this.row.next().html(), expected, 'new-row has been appended to formlist');
    });

    test('animates display of new row if options.addAnimationSpeed', 2, function () {
        sinon.stub($.fn, 'animate');
        this.vars.options.addAnimationSpeed = 'test-speed';
        this.formlist.superformset('activateAddTrigger', this.vars);
        this.addButton.trigger('click');

        ok(this.row.next().animate.calledOnce, 'new-row .animate was called once');
        ok(this.row.next().animate.calledWith({"height": "toggle", "opacity": "toggle"}, 'test-speed'), 'new-row .animate was passed addAnimationSpeed');

        $.fn.animate.restore();
    });

    test('calls updateElementIndex for each input in new row', 4, function () {
        this.formlist.superformset('activateAddTrigger', this.vars);
        this.addButton.trigger('click');

        ok(this.methods.updateElementIndex.calledOnce, 'updateElementIndex was called once');
        strictEqual(this.methods.updateElementIndex.args[0][0].get(0).outerHTML, this.newInput.get(0).outerHTML, 'updateElementIndex was passed new row input');
        strictEqual(this.methods.updateElementIndex.args[0][1], 'form', 'updateElementIndex was passed prefix');
        strictEqual(this.methods.updateElementIndex.args[0][2], 1, 'updateElementIndex was passed zero-indexed number of rows');
    });

    test('calls watchForChangesToOptionalIfEmptyRow with new row', 2, function () {
        this.formlist.superformset('activateAddTrigger', this.vars);
        this.addButton.trigger('click');

        ok(this.methods.watchForChangesToOptionalIfEmptyRow.calledOnce, 'watchForChangesToOptionalIfEmptyRow was called once');
        strictEqual(this.methods.watchForChangesToOptionalIfEmptyRow.args[0][0].get(0).outerHTML, this.newRow.get(0).outerHTML, 'watchForChangesToOptionalIfEmptyRow was passed new row');
    });

    test('increments totalForms by 1', 1, function () {
        this.formlist.superformset('activateAddTrigger', this.vars);
        this.addButton.trigger('click');

        strictEqual(this.totalForms.val(), '2', 'totalForms is now 2');
    });

    test('hides the addButton if methods.showAddButton returns false', 2, function () {
        this.formlist.superformset('activateAddTrigger', this.vars);

        ok(this.addButton.is(':visible'), 'addButton is visible');

        this.methods.showAddButton.returns(false);
        this.addButton.trigger('click');

        ok(!this.addButton.is(':visible'), 'addButton has been hidden');
    });

    test('calls options.addedCallback with new row', 2, function () {
        var callback = this.vars.options.addedCallback = sinon.spy();
        this.formlist.superformset('activateAddTrigger', this.vars);
        this.addButton.trigger('click');

        ok(callback.calledOnce, 'addedCallback was called once');
        strictEqual(callback.args[0][0].get(0).outerHTML, this.newRow.get(0).outerHTML, 'addedCallback was passed new row');
    });


    module('watchForChangesToOptionalIfEmptyRow', {
        setup: function () {
            this.container = $('#qunit-fixture .container');
            this.formlist = this.container.find('.formlist');
            this.row = this.formlist.find('.dynamic-form').attr('data-empty-permitted', true);
            this.input = this.row.find('.test-input');
            this.totalForms = this.formlist.find('#test-form-TOTAL_FORMS');
            this.methods = this.formlist.superformset('exposeMethods');
            this.vars = {
                options: $.extend({}, $.fn.superformset.defaults)
            };
            sinon.stub(this.methods, 'updateRequiredFields');
        },
        teardown: function () {
            this.methods.updateRequiredFields.restore();
        }
    });

    test('removes "required" attr, adds .required class and "required-by" data-attr to row input', 3, function () {
        this.formlist.superformset('watchForChangesToOptionalIfEmptyRow', this.row, this.vars);

        ok(!this.input.is('[required]'), 'input no longer has "required" attr');
        ok(this.input.hasClass('required'), 'input has .required');
        strictEqual(this.input.data('required-by'), 'form', 'input data-required-by is prefix');
    });

    test('saves serialized inputs in row data-original-vals', 1, function () {
        this.formlist.superformset('watchForChangesToOptionalIfEmptyRow', this.row, this.vars);

        strictEqual(this.row.data('original-vals'), this.input.serialize(), 'row data-original-vals has serialized inputs');
    });

    test('does nothing if options.optionalIfEmpty is falsy or row is not options.optionalIfEmpty', 2, function () {
        this.vars.options.optionalIfEmpty = false;
        this.formlist.superformset('watchForChangesToOptionalIfEmptyRow', this.row, this.vars);

        ok(this.input.is('[required]'), 'input is still :required');

        this.vars.options.optionalIfEmpty = true;
        this.vars.options.optionalIfEmptySel = '.optional';
        this.formlist.superformset('watchForChangesToOptionalIfEmptyRow', this.row, this.vars);

        ok(this.input.is('[required]'), 'input is still :required');
    });

    test('calls updateRequiredFields with row when input changes', 3, function () {
        this.vars.options.deleteTriggerSel = '[id$="-TOTAL_FORMS"]';
        this.formlist.superformset('watchForChangesToOptionalIfEmptyRow', this.row, this.vars);
        this.totalForms.trigger('change');

        ok(!this.methods.updateRequiredFields.called, 'updateRequiredFields was not called');

        this.input.trigger('change');

        ok(this.methods.updateRequiredFields.calledOnce, 'updateRequiredFields was called once');
        ok(this.methods.updateRequiredFields.calledWith(this.row), 'updateRequiredFields was passed row');
    });


    module('updateElementIndex', {
        setup: function () {
            this.container = $('#qunit-fixture .container');
            this.input = $('<input type="checkbox" id="test-__prefix__-input" name="test-__prefix__-name" />');
            this.label = $('<label for="test-__prefix__-input"></label>');
            this.methods = this.container.superformset('exposeMethods');
        }
    });

    test('replaces "__prefix__" with index in "for" attr', 1, function () {
        this.container.superformset('updateElementIndex', this.label, 'test', '2');

        strictEqual(this.label.attr('for'), 'test-2-input', '__prefix__ replaced in "for" attr');
    });

    test('replaces "__prefix__" with index in "id" attr', 1, function () {
        this.container.superformset('updateElementIndex', this.input, 'test', '2');

        strictEqual(this.input.attr('id'), 'test-2-input', '__prefix__ replaced in "id" attr');
    });

    test('replaces "__prefix__" with index in "name" attr', 1, function () {
        this.container.superformset('updateElementIndex', this.input, 'test', '2');

        strictEqual(this.input.attr('name'), 'test-2-name', '__prefix__ replaced in "name" attr');
    });


    module('showAddButton', {
        setup: function () {
            this.container = $('#qunit-fixture .container');
            this.vars = {
                totalForms: this.container.find('#test-form-TOTAL_FORMS'),
                maxForms: this.container.find('#test-form-MAX_NUM_FORMS')
            };
            this.methods = this.container.superformset('exposeMethods');
        }
    });

    test('returns true if maxForms has no val', 1, function () {
        this.vars.maxForms.val('');
        var result = this.container.superformset('showAddButton', this.vars);

        ok(result, 'true');
    });

    test('returns false if maxForms minus totalForms is zero', 1, function () {
        this.vars.maxForms.val('1');
        var result = this.container.superformset('showAddButton', this.vars);

        ok(!result, 'false');
    });

    test('returns true if maxForms minus totalForms is greater than zero', 1, function () {
        var result = this.container.superformset('showAddButton', this.vars);

        ok(result, 'true');
    });


    module('addDeleteTrigger', {
        setup: function () {
            this.container = $('#qunit-fixture .container');
            this.formlist = this.container.find('.formlist');
            this.row = this.formlist.find('.dynamic-form');
            this.row2 = this.row.clone().addClass('extra-row').insertAfter(this.row);
            this.input = this.row.find('.test-input');
            this.totalForms = this.formlist.find('#test-form-TOTAL_FORMS');
            this.methods = this.formlist.superformset('exposeMethods');
            this.vars = {
                options: $.extend({}, $.fn.superformset.defaults),
                wrapper: this.formlist,
                totalForms: this.totalForms
            };
            this.vars.options.removeAnimationSpeed = false;
            sinon.stub(this.methods, 'updateElementIndex');
            sinon.spy($.fn, 'animate');
            this.clock = sinon.useFakeTimers();
        },
        teardown: function () {
            this.methods.updateElementIndex.restore();
            $.fn.animate.restore();
            this.clock.restore();
        }
    });

    test('if canDelete, appends deleteTrigger to row', 1, function () {
        this.formlist.superformset('addDeleteTrigger', this.row, true, this.vars);

        ok(this.row.find('.remove-row').length, '.remove-row has been added to row');
    });

    test('if canDelete, removes row on deleteTrigger click', 1, function () {
        this.formlist.superformset('addDeleteTrigger', this.row, true, this.vars);
        this.row.find('.remove-row').trigger('click');

        ok(!this.formlist.find(this.row).length, 'row has been removed');
    });

    test('if canDelete, updates totalForms on deleteTrigger click', 1, function () {
        this.formlist.superformset('addDeleteTrigger', this.row, true, this.vars);
        this.row.find('.remove-row').trigger('click');

        strictEqual(this.vars.totalForms.val(), '0', 'totalForms val is now zero');
    });

    test('if canDelete, calls updateElementIndex on each remaining input after deleteTrigger click', 4, function () {
        this.formlist.superformset('addDeleteTrigger', this.row, true, this.vars);
        this.row.find('.remove-row').trigger('click');

        ok(this.methods.updateElementIndex.calledOnce, 'updateElementIndex was called once');
        ok(this.methods.updateElementIndex.args[0][0].is(this.row2.find('.test-input')), 'updateElementIndex was passed input');
        strictEqual(this.methods.updateElementIndex.args[0][1], 'form', 'updateElementIndex was passed options.prefix');
        strictEqual(this.methods.updateElementIndex.args[0][2], 0, 'updateElementIndex was passed input index');
    });

    test('if canDelete and removeAnimationSpeed, removes row after animation on deleteTrigger click', 3, function () {
        this.vars.options.removeAnimationSpeed = 100;
        this.formlist.superformset('addDeleteTrigger', this.row, true, this.vars);
        this.row.find('.remove-row').trigger('click');
        this.clock.tick(110);

        ok(this.row.animate.calledOnce, '$.fn.animate was called on row');
        ok(this.row.animate.calledWith({'height': 'toggle', 'opacity': 'toggle'}, 100), '$.fn.animate was passed options');
        ok(!this.formlist.find(this.row).length, 'row has been removed');
    });

    test('if canDelete, calls options.removedCallback with row on deleteTrigger click', 2, function () {
        var callback = this.vars.options.removedCallback = sinon.spy();
        this.formlist.superformset('addDeleteTrigger', this.row, true, this.vars);
        this.row.find('.remove-row').trigger('click');

        ok(callback.calledOnce, 'removedCallback was called once');
        ok(callback.args[0][0].is(this.row), 'removedCallback was passed row');
    });

    test('when deleteTriggerSel is checked, removes :required attr and adds .deleted-required', 2, function () {
        var deleteTrigger = $('<input type="checkbox" class="remove-row" checked />').appendTo(this.row);
        this.formlist.superformset('addDeleteTrigger', this.row, false, this.vars);
        deleteTrigger.trigger('change');

        ok(!this.input.is('[required]'), 'input is no longer :required');
        ok(this.input.hasClass('deleted-required'), 'input has .deleted-required');
    });

    test('when deleteTriggerSel is unchecked, adds :required attr and removes .deleted-required', 2, function () {
        var deleteTrigger = $('<input type="checkbox" class="remove-row deleted-required" />').appendTo(this.row);
        this.formlist.superformset('addDeleteTrigger', this.row, false, this.vars);
        deleteTrigger.trigger('change');

        strictEqual(this.input.attr('required'), 'required', 'input is now :required');
        ok(!this.input.hasClass('deleted-required'), 'input no longer has .deleted-required');
    });


    module('addInsertAboveTrigger', {
        setup: function () {
            this.container = $('#qunit-fixture .container');
            this.formlist = this.container.find('.formlist');
            this.row = this.formlist.find('.dynamic-form');
            this.input = this.row.find('.test-input');
            this.template = this.container.find('.empty-form .dynamic-form').clone().removeAttr('id');
            this.template.find('#template-input').addClass('required').removeAttr('required');
            this.newRow = this.template.clone().addClass('new-row');
            this.newRow.find('#template-input').attr('required', 'required');
            this.totalForms = this.formlist.find('#test-form-TOTAL_FORMS');
            this.methods = this.formlist.superformset('exposeMethods');
            this.vars = {
                options: $.extend({}, $.fn.superformset.defaults),
                wrapper: this.formlist,
                totalForms: this.totalForms,
                template: this.template
            };
            this.vars.options.addAnimationSpeed = false;
            this.vars.options.insertAbove = true;
            sinon.stub(this.methods, 'updateElementIndex');
            sinon.stub(this.methods, 'showAddButton').returns(true);
            sinon.stub(this.methods, 'watchForChangesToOptionalIfEmptyRow');
            sinon.spy($.fn, 'animate');
            this.clock = sinon.useFakeTimers();
        },
        teardown: function () {
            this.methods.updateElementIndex.restore();
            this.methods.showAddButton.restore();
            this.methods.watchForChangesToOptionalIfEmptyRow.restore();
            $.fn.animate.restore();
            this.clock.restore();
        }
    });

    test('prepends insertAboveTrigger to row', 1, function () {
        this.formlist.superformset('addInsertAboveTrigger', this.row, this.vars);

        ok(this.row.find('.insert-row').length, '.insert-row has been added to row');
    });

    test('does nothing if options.insertAbove is falsy', 1, function () {
        this.vars.options.insertAbove = false;
        this.formlist.superformset('addInsertAboveTrigger', this.row, this.vars);

        ok(!this.row.find('.insert-row').length, '.insert-row has not been added to row');
    });

    test('inserts new row above triggered row', 2, function () {
        this.formlist.superformset('addInsertAboveTrigger', this.row, this.vars);
        this.row.find('.insert-row').trigger('click');
        var result = this.row.prev();

        strictEqual(result.get(0).outerHTML, this.newRow.get(0).outerHTML, 'new row was added above triggered row');
        ok(result.is(':visible'), 'new row is visible');
    });

    test('if addAnimationSpeed, inserts row after animation', 4, function () {
        this.vars.options.addAnimationSpeed = 100;
        this.formlist.superformset('addInsertAboveTrigger', this.row, this.vars);
        this.row.find('.insert-row').trigger('click');
        this.clock.tick(110);
        var result = this.row.prev();

        ok(result.animate.calledOnce, '$.fn.animate was called on row');
        ok(result.animate.calledWith({'height': 'toggle', 'opacity': 'toggle'}, 100), '$.fn.animate was passed options');
        ok(result.is(':visible'), 'new row is visible');
        strictEqual(result.removeAttr('style').get(0).outerHTML, this.newRow.get(0).outerHTML, 'new row was added above triggered row');
    });

    test('updates totalForms', 1, function () {
        this.formlist.superformset('addInsertAboveTrigger', this.row, this.vars);
        this.row.find('.insert-row').trigger('click');

        strictEqual(this.vars.totalForms.val(), '2', 'totalForms val is now two');
    });

    test('calls updateElementIndex on each input', 7, function () {
        this.formlist.superformset('addInsertAboveTrigger', this.row, this.vars);
        this.row.find('.insert-row').trigger('click');
        var result = this.row.prev();

        ok(this.methods.updateElementIndex.calledTwice, 'updateElementIndex was called twice');
        ok(this.methods.updateElementIndex.args[0][0].is(result.find('.test-input')), 'updateElementIndex was passed new input');
        strictEqual(this.methods.updateElementIndex.args[0][1], 'form', 'updateElementIndex was passed options.prefix');
        strictEqual(this.methods.updateElementIndex.args[0][2], 0, 'updateElementIndex was passed new input index');
        ok(this.methods.updateElementIndex.args[1][0].is(this.input), 'updateElementIndex was passed existing input');
        strictEqual(this.methods.updateElementIndex.args[1][1], 'form', 'updateElementIndex was passed options.prefix');
        strictEqual(this.methods.updateElementIndex.args[1][2], 1, 'updateElementIndex was passed existing input index');
    });

    test('calls watchForChangesToOptionalIfEmptyRow with new row', 2, function () {
        this.formlist.superformset('addInsertAboveTrigger', this.row, this.vars);
        this.row.find('.insert-row').trigger('click');

        ok(this.methods.watchForChangesToOptionalIfEmptyRow.calledOnce, 'watchForChangesToOptionalIfEmptyRow was called once');
        strictEqual(this.methods.watchForChangesToOptionalIfEmptyRow.args[0][0].get(0).outerHTML, this.newRow.get(0).outerHTML, 'watchForChangesToOptionalIfEmptyRow was passed new row');
    });

    test('hides the addButton if methods.showAddButton returns false', 1, function () {
        this.methods.showAddButton.returns(false);
        this.formlist.superformset('addInsertAboveTrigger', this.row, this.vars);
        var trigger = this.row.find('.insert-row').trigger('click');

        ok(!trigger.is(':visible'), 'insertAbove trigger has been hidden');
    });

    test('does not hide addButton if methods.showAddButton returns true', 1, function () {
        this.formlist.superformset('addInsertAboveTrigger', this.row, this.vars);
        var trigger = this.row.find('.insert-row').trigger('click');

        ok(trigger.is(':visible'), 'insertAbove trigger has not been hidden');
    });

    test('calls options.addedCallback with new row', 2, function () {
        var callback = this.vars.options.addedCallback = sinon.spy();
        this.formlist.superformset('addInsertAboveTrigger', this.row, this.vars);
        this.row.find('.insert-row').trigger('click');

        ok(callback.calledOnce, 'addedCallback was called once');
        strictEqual(callback.args[0][0].get(0).outerHTML, this.newRow.get(0).outerHTML, 'addedCallback was passed new row');
    });

    test('blurs trigger', 1, function () {
        sinon.spy($.fn, 'blur');
        this.formlist.superformset('addInsertAboveTrigger', this.row, this.vars);
        var trigger = this.row.find('.insert-row').trigger('click');

        ok(trigger.blur.calledOnce, 'trigger.blur was called once');

        $.fn.blur.restore();
    });


    module('autoAddRow', {
        setup: function () {
            this.container = $('#qunit-fixture .container');
            this.formlist = this.container.find('.formlist');
            this.row = this.formlist.find('.dynamic-form');
            this.input = this.row.find('.test-input');
            this.template = this.container.find('.empty-form .dynamic-form').clone().removeAttr('id');
            this.newRow = this.template.clone().addClass('extra-row').css('opacity', 0.5);
            this.newRow.find('.test-input').addClass('required').removeAttr('required');
            this.totalForms = this.formlist.find('#test-form-TOTAL_FORMS');
            this.methods = this.formlist.superformset('exposeMethods');
            this.vars = {
                options: $.extend({}, $.fn.superformset.defaults),
                wrapper: this.formlist,
                totalForms: this.totalForms,
                template: this.template
            };
            this.vars.options.addAnimationSpeed = false;
            this.vars.options.optionalIfEmpty = false;
            sinon.stub(this.methods, 'updateElementIndex');
            sinon.stub(this.methods, 'showAddButton').returns(true);
            sinon.stub(this.methods, 'watchForChangesToOptionalIfEmptyRow');
            sinon.spy($.fn, 'animate');
            this.clock = sinon.useFakeTimers();
        },
        teardown: function () {
            this.methods.updateElementIndex.restore();
            this.methods.showAddButton.restore();
            this.methods.watchForChangesToOptionalIfEmptyRow.restore();
            $.fn.animate.restore();
            this.clock.restore();
        }
    });

    test('adds new row with opacity: 0.5 after last row', 2, function () {
        this.formlist.superformset('autoAddRow', this.vars);
        var result = this.row.next();

        strictEqual(result.get(0).outerHTML, this.newRow.get(0).outerHTML, 'new row was added after last row');
        ok(result.is(':visible'), 'new row is visible');
    });

    test('calls updateElementIndex with each new row', 4, function () {
        this.formlist.superformset('autoAddRow', this.vars);
        var input = this.row.next().find('.test-input');

        ok(this.methods.updateElementIndex.calledOnce, 'updateElementIndex was called once');
        ok(this.methods.updateElementIndex.args[0][0].is(input), 'updateElementIndex was passed new row input');
        strictEqual(this.methods.updateElementIndex.args[0][1], 'form', 'updateElementIndex was passed prefix');
        strictEqual(this.methods.updateElementIndex.args[0][2], 1, 'updateElementIndex was passed new row zero-based index');
    });

    test('removes :required attr and adds .required to inputs in new row', 2, function () {
        this.formlist.superformset('autoAddRow', this.vars);
        var input = this.row.next().find('.test-input');

        ok(!input.is('[required]'), 'new input is not :required');
        ok(input.hasClass('required'), 'new input has class .required');
    });

    test('if addAnimationSpeed, adds row after animation', 4, function () {
        this.vars.options.addAnimationSpeed = 100;
        this.formlist.superformset('autoAddRow', this.vars);
        this.clock.tick(110);
        var result = this.row.next();

        ok(result.animate.calledOnce, '$.fn.animate was called on row');
        ok(result.animate.calledWith({'height': 'toggle', 'opacity': '0.5'}, 100), '$.fn.animate was passed options');
        strictEqual(result.get(0).outerHTML, this.newRow.get(0).outerHTML, 'new row was added after last row');
        ok(result.is(':visible'), 'new row is visible');
    });

    test('on focus, remove .extra-row and opacity: 0.5 from new row', 2, function () {
        this.formlist.superformset('autoAddRow', this.vars);
        var row = this.row.next();
        row.find('.test-input').trigger('focus');

        ok(!row.hasClass('extra-row'), 'new row no longer has class .extra-row');
        strictEqual(row.css('opacity'), '1', 'new row now has opacity: 1');
    });

    test('on focus, add :required to .required inputs', 1, function () {
        this.formlist.superformset('autoAddRow', this.vars);
        var input = this.row.next().find('.test-input').trigger('focus');

        ok(input.is('[required]'), 'input is now :required');
    });

    test('on focus, add :required to .required inputs', 1, function () {
        this.vars.options.optionalIfEmpty = true;
        this.formlist.superformset('autoAddRow', this.vars);
        var input = this.row.next().find('.test-input').trigger('focus');

        ok(input.is('[required]'), 'input is now :required');
    });

    test('on focus, add :required to .required inputs', 1, function () {
        this.formlist.superformset('autoAddRow', this.vars);
        var row = this.row.next().attr('data-empty-permitted', true);
        var input = row.find('.test-input').trigger('focus');

        ok(input.is('[required]'), 'input is now :required');
    });

    test('on focus, do not add :required to .required inputs if optionalIfEmpty row', 1, function () {
        this.vars.options.optionalIfEmpty = true;
        this.formlist.superformset('autoAddRow', this.vars);
        var row = this.row.next().attr('data-empty-permitted', true);
        var input = row.find('.test-input').trigger('focus');

        ok(!input.is('[required]'), 'input is still not :required');
    });

    test('updates totalForms', 1, function () {
        this.formlist.superformset('autoAddRow', this.vars);
        this.formlist.prepend('<div class="dynamic-form extra-row"></div>');
        this.row.next().find('.test-input').trigger('focus');

        strictEqual(this.vars.totalForms.val(), '2', 'totalForms val is now two');
    });

    test('shows deleteTrigger if deleteOnlyActive', 1, function () {
        this.vars.options.deleteOnlyActive = true;
        this.formlist.superformset('autoAddRow', this.vars);
        var row = this.row.next();
        $('<div class="remove-row"></div>').hide().appendTo(row);
        var remove = row.find('.remove-row');
        row.find('.test-input').trigger('focus');
        this.clock.tick(410);

        ok(remove.is(':visible'), 'deleteTrigger is visible');
    });

    test('does not show deleteTrigger if deleteOnlyActive is falsy', 1, function () {
        this.formlist.superformset('autoAddRow', this.vars);
        var row = this.row.next();
        $('<div class="remove-row"></div>').hide().appendTo(row);
        var remove = row.find('.remove-row');
        row.find('.test-input').trigger('focus');
        this.clock.tick(410);

        ok(!remove.is(':visible'), 'deleteTrigger is visible');
    });

    test('calls autoAddRow if showAddButton returns true and row is last row', 1, function () {
        this.formlist.superformset('autoAddRow', this.vars);
        sinon.stub(this.methods, 'autoAddRow');
        this.row.next().find('.test-input').trigger('focus');

        ok(this.methods.autoAddRow.calledOnce, 'autoAddRow was called once');

        this.methods.autoAddRow.restore();
    });

    test('does not call autoAddRow if showAddButton returns false', 1, function () {
        this.methods.showAddButton.returns(false);
        this.formlist.superformset('autoAddRow', this.vars);
        sinon.stub(this.methods, 'autoAddRow');
        this.row.next().find('.test-input').trigger('focus');

        ok(!this.methods.autoAddRow.called, 'autoAddRow was not called');

        this.methods.autoAddRow.restore();
    });

    test('does not call autoAddRow if row is not last row', 1, function () {
        this.formlist.superformset('autoAddRow', this.vars);
        sinon.stub(this.methods, 'autoAddRow');
        this.formlist.append('<div class="dynamic-form"></div>');
        this.row.next().find('.test-input').trigger('focus');

        ok(!this.methods.autoAddRow.called, 'autoAddRow was not called');

        this.methods.autoAddRow.restore();
    });

    test('calls watchForChangesToOptionalIfEmptyRow with new row', 2, function () {
        this.formlist.superformset('autoAddRow', this.vars);
        var row = this.row.next();

        ok(this.methods.watchForChangesToOptionalIfEmptyRow.calledOnce, 'watchForChangesToOptionalIfEmptyRow was called once');
        strictEqual(this.methods.watchForChangesToOptionalIfEmptyRow.args[0][0].get(0).outerHTML, row.get(0).outerHTML, 'watchForChangesToOptionalIfEmptyRow was passed new row');
    });

    test('hides deleteTrigger if deleteOnlyActive', 1, function () {
        this.vars.options.deleteOnlyActive = true;
        $('<div class="remove-row"></div>').appendTo(this.template);
        this.formlist.superformset('autoAddRow', this.vars);
        var remove = this.row.next().find('.remove-row');

        ok(!remove.is(':visible'), 'deleteTrigger is not visible');
    });

    test('does not hide deleteTrigger if deleteOnlyActive is falsy', 1, function () {
        $('<div class="remove-row"></div>').appendTo(this.template);
        this.formlist.superformset('autoAddRow', this.vars);
        var remove = this.row.next().find('.remove-row');

        ok(remove.is(':visible'), 'deleteTrigger is still visible');
    });

    test('calls options.addedCallback with new row', 2, function () {
        var callback = this.vars.options.addedCallback = sinon.spy();
        this.formlist.superformset('autoAddRow', this.vars);
        var row = this.row.next();

        ok(callback.calledOnce, 'addedCallback was called once');
        strictEqual(callback.args[0][0].get(0).outerHTML, row.get(0).outerHTML, 'addedCallback was passed new row');
    });


    module('updateRequiredFields', {
        setup: function () {
            this.container = $('#qunit-fixture .container');
            this.formlist = this.container.find('.formlist');
            this.row = this.formlist.find('.dynamic-form');
            this.input = this.row.find('.test-input');
            this.input.data('required-by', 'form');
            this.row.data('original-vals', this.input.serialize());
            this.methods = this.formlist.superformset('exposeMethods');
            this.vars = {
                options: $.extend({}, $.fn.superformset.defaults)
            };
        }
    });

    test('removes :required from inputs if serialized data matches row data-original-vals', 1, function () {
        this.formlist.superformset('updateRequiredFields', this.row, this.vars);

        ok(!this.input.is('[required]'), 'input is no longer :required');
    });

    test('does not remove :required from inputs where data-required-by !== options prefix', 1, function () {
        this.input.removeData('required-by');
        this.formlist.superformset('updateRequiredFields', this.row, this.vars);

        ok(this.input.is('[required]'), 'input is still :required');
    });

    test('adds :required to inputs if serialized data does not match row data-original-vals', 1, function () {
        this.row.removeData('original-vals');
        this.input.removeAttr('required').addClass('required');
        this.formlist.superformset('updateRequiredFields', this.row, this.vars);

        strictEqual(this.input.attr('required'), 'required', 'input is :required');
    });

    test('does not add :required to inputs with .deleted-required', 1, function () {
        this.row.removeData('original-vals');
        this.input.removeAttr('required').addClass('required deleted-required');
        this.formlist.superformset('updateRequiredFields', this.row, this.vars);

        ok(!this.input.is('[required]'), 'input is not :required');
    });


    module('superformset methods', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.methods = this.container.superformset('exposeMethods');
            this.initStub = sinon.stub(this.methods, 'init');
        },
        teardown: function () {
            this.initStub.restore();
        }
    });

    test('if no args, calls init method', 1, function () {
        this.container.superformset();

        ok(this.initStub.calledOnce, 'init was called once');
    });

    test('if first arg is an object, calls init method with args', 2, function () {
        this.container.superformset({test: 'data'}, 'more');

        ok(this.initStub.calledOnce, 'init was called once');
        ok(this.initStub.calledWith({test: 'data'}, 'more'), 'init was passed args');
    });

    test('if first arg is a method, calls method with remaining args', 2, function () {
        this.container.superformset('init', {test: 'data'}, 'more');

        ok(this.initStub.calledOnce, 'init was called once');
        ok(this.initStub.calledWith({test: 'data'}, 'more'), 'init was passed remaining args');
    });

    test('if first arg not a method or object, returns an error', 3, function () {
        sinon.stub($, 'error');
        this.container.superformset('test');

        ok(!this.initStub.called, 'init was not called');
        ok($.error.calledOnce, '$.error was called once');
        ok($.error.calledWith('Method test does not exist on jQuery.superformset'), '$.error was passed error msg');

        $.error.restore();
    });

}(jQuery));
