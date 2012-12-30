var xfan = { ipe: {

  defaultOptions: {

    formType: 'text',
    editEvent: 'click',
    editableMarkText: 'edit',
    saveButtonCaption: 'save',
    cancelButtonCaption: 'cancel',
    savingMessage: 'saving...',
    placeholder: '(please input)',
    
    // css classes
    editableClass: 'xfanIpeEditable',
    editableMouseoverClass: 'xfanIpeEditableMouseover',
    editableLabelClass: 'xfanIpeEditableLabel',
    editableMarkClass: 'xfanIpeEditableMark',
    ipeClass: 'xfanIpe',
    saveButtonClass: 'xfanIpeSaveButton',
    cancelButtonClass: 'xfanIpeCancelButton',
    savingMessageClass: 'xfanIpeSavingMessage',
    errorMessageClass: 'xfanIpeErrorMessage'
  },
  
  Editable: function(id, opts) {
    this._init(id, opts);
  },
  
  AbstractIpe: function(id, opts) {
    this._init(id, opts);
  },

  register: function(name, definition) {
    var editor = (xfan.ipe.editors[name] = function(id, opts){
      this._init(id, opts);
    });
    $.extend(editor.prototype, xfan.ipe.AbstractIpe.prototype, definition);
  },

  editors: {
  }

}};

(function($) {

  var _T = function(template, params) {
    var replace = function(str, match) {
      return typeof params[match] === 'string'
          || typeof params[match] === 'number' ? params[match] : str;
    };
    return template.replace(/#\{([^{}]*)}/g, replace);
  };
  
  var escapeHTML = function(val) {
    return $("<div>").text(val).html();
  };
  
  $.extend(xfan.ipe.Editable.prototype, {
    
    _init: function(id, opts) {
    
      this.opts = opts;
      
      if (id)
        this.id = 'xfanIpeEditable-' + id;

      this.dom = $('<div></div>')
        // do nothing if this.id is undefined
        .attr('id', this.id)
        .addClass(opts['editableClass'])
        .bind('mouseenter', function() {
          $(this).addClass(opts['editableMouseoverClass']);
        })
        .bind('mouseleave', function() {
          $(this).removeClass(opts['editableMouseoverClass']);
        });

      var labelTag = opts['labelTag'] || 'span';
      this.editableLabel = $('<' + labelTag + '></' + labelTag + '>')
        .addClass(opts['editableLabelClass'])
        .appendTo(this.dom);
      
      this.editableMark = $(_T('<span>#{t}</span>', { t: opts.editableMarkText }))
        .addClass(opts['editableMarkClass'])
        .appendTo(this.dom);
    },
    
    label: function(v) {
      return this.editableLabel.html(v);
    },
    
    hide: function(speed, callback) {
      this.dom.fadeOut(speed, callback);
    },
    
    show: function(speed, callback) {
      this.dom.fadeIn(speed, callback);
    },
    
    addEditEventListener: function(eventType, listener) {
      var editableMouseoverClass = this.opts['editableMouseoverClass'];
      this.dom.bind(eventType, function() {
        $(this).removeClass(editableMouseoverClass);
        listener.apply(this);
      });
    }

  });


  $.extend(xfan.ipe.AbstractIpe.prototype, {
    
    _init: function(id, opts) {

      this.opts = opts;

      if (id)
        this.id = 'xfanIpe-' + id;
      
      this.dom = $('<div></div>')
        .attr('id', this.id)
        .addClass(opts['ipeClass'])
        .hide();
      
      this.input = this.createInput();
      this.savingMessage = this.createSavingMessage();
      this.saveButton = this.createSaveButton();
      this.cancelButton = this.createCancelButton();
      this.errorMessage = this.createErrorMessage();
      
      this.dom
        .append(this.input)
        .append(this.savingMessage)
        .append(this.saveButton)
        .append(this.cancelButton)
        .append(this.errorMessage);
      
      this.init();

      if (opts['init'])
        this.val(opts['init']);
    },
    
    init: function() {
    },

    createInput: function() {
      return $('<span>need to override createInput() method.</span>');
    },
  
    createSaveButton: function() {
      return $(_T('<input type="button" value="#{v}" />', {v: this.opts['saveButtonCaption']}))
        .addClass(this.opts['saveButtonClass']);
    },
  
    createCancelButton: function() {
      return $(_T('<input type="button" value="#{v}" />', {v: this.opts['cancelButtonCaption']}))
        .addClass(this.opts['cancelButtonClass']);
    },
  
    createSavingMessage: function() {
      return $(_T('<span>#{v}</span>', {v: this.opts['savingMessage']}))
        .addClass(this.opts['savingMessageClass']);
    },
  
    createErrorMessage: function() {
      return $('<span></span>')
        .addClass(this.opts['errorMessageClass']);
    },
    
    show: function(speed, callback) {
      this.dom.fadeIn(speed, callback);
    },
    
    hide: function(speed, callback) {
      this.dom.fadeOut(speed, callback);
    },
    
    activate: function(callback) {
      this.oldValue = this.val();
      this.editingMode();
      this.show('fast', callback);
    },
  
    passivate: function(callback) {
      this.hide('fast', callback);
    },

    discard: function(callback) {
      this.onFinishEditing();
      this.val(this.oldVal());
      this.passivate(callback);
    },
    
    savingMode: function(callback) {
      this.onFinishEditing();
      this.saveButton.attr('disabled', true);
      this.cancelButton.attr('disabled', true);
      this.input.hide();
      this.savingMessage.show();
      if (callback)
        callback();
    },
  
    editingMode: function() {
      this.errorMessage.hide();
      this.savingMessage.hide();
      this.input.show();
      this.saveButton.attr('disabled', false);
      this.cancelButton.attr('disabled', false);
      this.focusTarget().focus();
      this.onStartEditing();
    },
    
    showError: function(msg) {
      this.errorMessage.html(msg);
      this.errorMessage.show();
    },
    
    focusTarget: function() {
      return this.input;
    },
  
    val: function(v) {
      return 'need to override val(v) methos.';
    },
  
    oldVal: function() {
      return this.oldValue;
    },
  
    newVal: function() {
      return this.val();
    },
    
    toPlaceholder: function(v) {
    	if (v === null || v === undefined || v === "" || $.isArray(v) && v.length === 0) {
    		return this.opts.placeholder;
    	}
    },
    
    toLabel: function(v) {
      return escapeHTML(v);
    },

    addSaveEventListener: function(listener) {
      this.saveButton.bind('click', listener);
      this.dom.find('.xfanIpeEnableKeyDownEvent').bind('keydown', function(e) {
        // enter key
        if (e.which == 13)
          listener();
      });
    },
  
    addCancelEventListener: function(listener) {
      this.cancelButton.bind('click', listener);
      this.dom.find('.xfanIpeEnableKeyDownEvent').bind('keydown', function(e) {
        // esc key
        if (e.which == 27)
          listener();
      });
    },
    
    onStartEditing: function() {
    },
    
    onFinishEditing: function() {
    },
  
    onAppendToDocument: function() {
    }
  
  });

  xfan.ipe.register('text', {
    
    val: function(v) {
      return v === undefined ? this.input.val() : this.input.val(v);
    },
    
    createInput: function() {

      var input = $('<input type="text" />')
        .addClass('xfanIpeEnableKeyDownEvent')
        .addClass(this.opts['textFieldClass'] || 'xfanIpeTextField');

      if (this.opts['name'])
        input.attr('name', this.opts['name']);
      
      return input;
    }
    
  });

  xfan.ipe.register('textarea', {

    toLabel: function(v) {
      return escapeHTML(v).replace(/\n/g, '<br/>');
    },
    
    val: function(v) {
      return v === undefined ? this.input.val() : this.input.val(v);
    },
  
    createInput: function() {
      var area = $('<textarea></textarea>')
        .addClass(this.opts['textAreaClass'] || 'xfanIpeTextArea');
      if (this.opts['name'])
        area.attr('name', this.opts['name']);

      if (this.opts['enableKeyDownEvent'])
        area.addClass('xfanIpeEnableKeyDownEvent');

      return area;
    }
  
  });

  xfan.ipe.register('radio', {

    toLabel: function(v) {
      return this.opts['options'][v];
    },

    val: function(v) {
      if (v) {
        this.input.find("input[type='radio']").each(function() {
          if (v == $(this).val()) {
            $(this).attr('checked', 'checked');
            return false;
          }
        });
      } else {
        return this.input.find("input[type='radio']:checked").val();
      }
    },
    
    createInput: function() {
      
      var radioGroup = $('<span></span>')
        .addClass(this.opts['radioGroupClass'] || 'xfanIpeRadioGroup');
      
      var self = this;
      
      $.each(this.opts['options'], function(value, label) {
        
        var option = $('<span></span>')
          .addClass(self.opts['radioOptionClass'] || 'xfanIpeRadioOption');

        var input = $(_T('<input type="radio" id="xfanIpeRadioInput-#{n}-#{v}" name="#{n}" value="#{v}" />', {
          n: self.opts['name'],
          v: value
        }))
          .addClass(self.opts['radioInputClass'] || 'xfanIpeRadioInput')
          .addClass('xfanIpeEnableKeyDownEvent');
        
        var label = $(_T('<label for="xfanIpeRadioInput-#{n}-#{v}">#{l}</label>', {
          n: self.opts['name'],
          v: value,
          l: label
        }))
          .addClass(self.opts['radioLabelClass'] || 'xfanIpeRadioLabel');
        
        option.append(input).append(label).appendTo(radioGroup);
      });

      return radioGroup;
    }
  
  });

  xfan.ipe.register('select', {

    toLabel: function(v) {
      return this.opts['options'][v];
    },

    val: function(v) {
      return v === undefined ? this.input.val() : this.input.val(v);
    },
    
    createInput: function() {
      
      var select = $(_T('<select name="#{n}" />', { n: this.opts['name'] }))
        .addClass(this.opts['selectClass'] || 'xfanIpeSelect')
        .addClass('xfanIpeEnableKeyDownEvent');
      
      if (this.opts['caption'])
        select.append($(_T('<option value="">#{l}</option>', { l: this.opts['caption'] })));

      var self = this;
      
      $.each(this.opts['options'], function(value, label) {
        var option = $(_T('<option value="#{v}">#{l}</option>', { v: value, l: label }))
          .addClass(self.opts['selectOptionClass'] || 'xfanIpeSelectOption');
        select.append(option);
      });

      return select;
    }
  
  });

  xfan.ipe.register('checkbox', {

    toLabel: function(v) {
      var label = "";
      var delim = this.opts['delim'] || ', ';
      for (var i = 0; i < v.length; i++) {
        label += this.opts['options'][v[i]];
        if (i != v.length - 1)
          label += delim;
      }
      return label;
    },
    
    val: function(values) {
      if (values) {
        var self = this;
        $.each(values, function() {
          var v = this;
          self.input.find("input[type='checkbox']").each(function() {
            if (v == $(this).val()) {
              $(this).attr('checked', 'checked');
              return false;
            }
          });
        });
      } else {
        var values = [];
        this.input.find("input[type='checkbox']:checked").each(function() {
          values.push($(this).val());
        });
        return values;
      }
    },
    
    createInput: function() {
      
      var checkboxGroup = $('<span></span>')
        .addClass(this.opts['checkboxGroupClass'] || 'xfanIpeCheckboxGroup');
      
      var self = this;
      
      $.each(this.opts['options'], function(value, label) {
        
        var option = $('<span></span>')
          .addClass(self.opts['checkboxOptionClass'] || 'xfanIpeCheckboxOption')
          .addClass('xfanIpeEnableKeyDownEvent');

        var input = $(_T('<input type="checkbox" id="xfanIpeCheckboxInput-#{n}-#{v}" name="#{n}" value="#{v}" />', {
          n : self.opts['name'],
          v : value
        }))
          .addClass(self.opts['checkboxInputClass'] || 'xfanIpeCheckboxInput');
        
        var label = $(_T('<label for="xfanIpeCheckboxInput-#{n}-#{v}">#{l}</label>', {
          n : self.opts['name'],
          v : value,
          l : label
        }))
          .addClass(self.opts['checkboxLabelClass'] || 'xfanIpeCheckboxLabel');
        
        option.append(input).append(label).appendTo(checkboxGroup);
      });

      return checkboxGroup;
    }
  
  });

  xfan.ipe.register('password', {
    
    init: function() {
      this.passwordValue = {};
    },

    toLabel: function(v) {
      return v.input && v.input.length > 0 ? '********' : '';
    },

    val: function(v) {
      if (v) {
        this.passwordValue.input = v.input;
        this.passwordValue.confirm = v.confirm;
      } else {
        return {
          input: this.passwordValue.input,
          confirm: this.passwordValue.confirm
        };
      }
    },
    
    onFinishEditing: function() {
      this.val({
       input: this.passwordInput.val(),
       confirm: this.passwordConfirm.val()
      });
      this.passwordInput.val('');
      this.passwordConfirm.val('');
    },
    
    createInput: function() {
      
      var password = $('<span></span>')
        .addClass(this.opts['passwordClass'] || 'xfanIpePassword');
      
      var inputLine = $('<span></span>')
        .addClass(this.opts['passwordInputLineClass'] || 'xfanIpePasswordInputLine');
      var confirmLine = $('<span></span>')
        .addClass(this.opts['passwordConfirmLineClass'] || 'xfanIpePasswordConfirmLine');
      
      this.passwordInput = $('<input type="password" />')
        .addClass(this.opts['passwordInputClass'] || 'xfanIpePasswordInput')
        .addClass('xfanIpeEnableKeyDownEvent')
        .appendTo(inputLine);

      this.passwordConfirm = $('<input type="password" />')
        .addClass(this.opts['passwordConfirmClass'] || 'xfanIpePasswordConfirm')
        .addClass('xfanIpeEnableKeyDownEvent')
        .appendTo(confirmLine);
      
      var reenter = $(_T('<span>#{n}</span>', { n: (this.opts['reenterMessage'] || 'reenter') }))
        .addClass(this.opts['passwordReenterMessageClass'] || 'xfanIpePasswordReenterMessage')
        .appendTo(confirmLine);
      
      password.append(inputLine).append(confirmLine);
      return password;
    }
  
  });

  xfan.ipe.register('date', {

    init: function() {
    
      if (this.opts['yearDisabled'] && this.opts['monthDisabled'] && this.opts['dayDisabled']) {
        throw "at least one field (year|month|day) must be enabled";
      }

      this.opts['yearName'] = this.opts['yearName'] || 'year';
      this.opts['monthName'] = this.opts['monthName'] || 'month';
      this.opts['dayName'] = this.opts['dayName'] || 'day';
      
      if (!this.opts['format']) {
        var e = [];
        if (!this.opts['yearDisabled']) e.push('yyyy');
        if (!this.opts['monthDisabled']) e.push('MM');
        if (!this.opts['dayDisabled']) e.push('dd');
        this.opts['format'] = e.join('/');
      }
      this.fmt = new DateFormat(this.opts['format']);
    },
    
    toLabel: function(v) {
      var y = this.opts['yearDisabled'] ? 1 : v.year;
      var m = this.opts['monthDisabled'] ? 0 : v.month;
      var d = this.opts['dayDisabled'] ? 1 : v.day;
      return this.fmt.format(new Date(y, m, d));
    },

    val: function(v) {
      if (v) {
        if (!this.opts['yearDisabled']) this.yearInput.val(v.year);
        if (!this.opts['monthDisabled']) this.monthInput.val(v.month + 1);
        if (!this.opts['dayDisabled']) this.dayInput.val(v.day);
      } else {
        return $.extend({}, 
          (this.opts['yearDisabled'] ? {} : { year: parseInt(this.yearInput.val()) }),
          (this.opts['monthDisabled'] ? {} : { month: parseInt(this.monthInput.val()) - 1 }),
          (this.opts['dayDisabled'] ? {} : { day: parseInt(this.dayInput.val()) })
        );
      }
    },
    
    createInput: function() {
      
      var input = $('<span></span>')
        .addClass(this.opts['dateClass'] || 'xfanIpeDate');

      if (!this.opts['yearDisabled']) {
        this.yearInput = $(_T('<select name="#{n}" />', { n : this.opts['yearName'] }))
          .addClass(this.opts['dateYearClass'] || 'xfanIpeDateYear')
          .addClass('xfanIpeEnableKeyDownEvent');
        var start = this.opts['yearStart'] || new Date().getFullYear() - 100;
        var end = this.opts['yearEnd'] || new Date().getFullYear();
        for (var i=start; i<=end; i++) {
          this.yearInput.append($(_T('<option value="#{v}">#{v}</option>', { v : i })));
        }
        input.append(this.yearInput);
        if (this.opts['yearLabel']) {
          var label = $(_T('<span>#{l}</span>', { l : this.opts['yearLabel'] }))
            .addClass(this.opts['dateYearLabelClass'] || 'xfanIpeDateYearLabel');
          input.append(label);
        }
      }

      if (!this.opts['monthDisabled']) {
        this.monthInput = $(_T('<select name="#{n}" />', { n : this.opts['monthName'] }))
          .addClass(this.opts['dateMonthClass'] || 'xfanIpeDateMonth')
          .addClass('xfanIpeEnableKeyDownEvent');
        for (var i=1; i<=12; i++) {
          this.monthInput.append($(_T('<option value="#{v}">#{v}</option>', { v : i })));
        }
        input.append(this.monthInput);
        if (this.opts['monthLabel']) {
          var label = $(_T('<span>#{l}</span>', { l : this.opts['monthLabel'] }))
            .addClass(this.opts['dateMonthLabelClass'] || 'xfanIpeDateMonthLabel');
          input.append(label);
        }
      }

      if (!this.opts['dayDisabled']) {
        this.dayInput = $(_T('<select name="#{n}" />', { n : this.opts['dayName'] }))
          .addClass(this.opts['dateDayClass'] || 'xfanIpeDateDay')
          .addClass('xfanIpeEnableKeyDownEvent');
        for (var i=1; i<=31; i++) {
          this.dayInput.append($(_T('<option value="#{v}">#{v}</option>', { v : i })));
        }
        input.append(this.dayInput);
        if (this.opts['dayLabel']) {
          var label = $(_T('<span>#{l}</span>', { l : this.opts['dayLabel'] }))
            .addClass(this.opts['dateDayLabelClass'] || 'xfanIpeDateDayLabel');
          input.append(label);
        }
      }

      return input;
    }
  
  });

  xfan.ipe.register('datepicker', {
    
    init: function() {
      this.opts['datepicker'] = this.opts['datepicker'] || {};
      if (!this.opts['datepicker']['dateFormat'])
        // default value of 'dateFormat' option of the jQuery UI datepicker
        this.opts['datepicker']['dateFormat'] = 'mm/dd/yy';
    },
    
    format: function(v) {
      if (v === null) {
        return "";
      }
      return $.datepicker.formatDate(
          this.opts['datepicker']['dateFormat'], 
          new Date(v.year, v.month, v.day));
    },
    
    parse: function(s) {
      var date = $.datepicker.parseDate(
          this.opts['datepicker']['dateFormat'], s);
      if (date === null) {
        return null;
      }
      return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
    },

    toLabel: function(v) {
      return this.format(v);
    },
    
    val: function(v) {
      if (v) {
        this.dateInput.val(this.format(v));
      } else {
        return this.parse(this.dateInput.val());
      }
    },
  
    createInput: function() {
      this.dateInput = $(_T('<input type="text" size="#{s}" />', { 
        s : this.opts['fieldSize'] || 10
      }))
        .addClass(this.opts['datepickerFieldClass'] || 'xfanIpeDatepickerFieldClass');
      if (this.opts['name'])
        this.dateInput.attr('name', this.opts['name']);
      this.dateInput.datepicker(this.opts['datepicker']);
      return $('<span></span>').append(this.dateInput);
    }

  });
  
  xfan.ipe.register('tinymce', {
    
    init: function() {
      this.content = '';
      this.opts['tinymce'] = this.opts['tinymce'] || {};
    },
    
    savingMode: function(callback) {
      this.onFinishEditing();
      this.saveButton.attr('disabled', true);
      this.cancelButton.attr('disabled', true);
      if (this.opts['tinymce']['theme'] == 'advanced') {
        tinyMCE.get(this.editorId).setProgressState(true);
      } else {
        this.input.hide();
        this.savingMessage.show();
      }
      if (callback)
        callback();
    },

    editingMode: function() {
      this.errorMessage.hide();
      this.savingMessage.hide();
      if (this.opts['tinymce']['theme'] == 'advanced') {
        tinyMCE.get(this.editorId).setProgressState(false);
      } else {
        this.input.show();
      }
      this.saveButton.attr('disabled', false);
      this.cancelButton.attr('disabled', false);
      this.focusTarget().focus();
      this.onStartEditing();
    },
    
    onFinishEditing: function() {
      this.content = tinyMCE.get(this.editorId).getContent();
    },
    
    onStartEditing: function() {
      tinyMCE.get(this.editorId).setContent(this.content);
    },

    val: function(v) {
      if (v) {
        this.content = v;
      } else {
        return this.content;
      }
    },
  
    createInput: function() {

      this.editorId = _T('xfanIpeTinymceTextArea-#{n}', {n : this.opts['name']});
      var textarea = $(_T('<textarea id="#{id}" name="#{n}"></textarea>', {
        id : this.editorId,
        n : this.opts['name']
      }));

      var args = {
        body_class : 'xfanIpeTinymceBody'
      };
      $.extend(args, this.opts['tinymce'], {
        mode : 'exact',
        elements : this.editorId
      });
      $(window).bind('load', function() {
        tinyMCE.init(args);
      });
      
      return $('<span></span>').append(textarea);
    }

  });
  
  $.fn.xfanIpe = function(saveUrl, options) {

    this.each(function() {

      var opts = $.extend({}, xfan.ipe.defaultOptions, options || {});
      var self = $(this);
      var id = self.attr('id');
      var editable = new xfan.ipe.Editable(id, opts);
      var ipe = new xfan.ipe.editors[opts['formType']](id, opts);

      var label = ipe.toPlaceholder(ipe.val()) || ipe.toLabel(ipe.val());
      editable.label(label);
      self.append(editable.dom).append(ipe.dom);
      ipe.onAppendToDocument();

      var onSave = function() {
        
        ipe.savingMode();
        
        var oldVal = ipe.oldVal();
        var newVal = ipe.newVal();
        
        oldVal = JSON.stringify(oldVal);
        newVal = JSON.stringify(newVal);

        if (oldVal == newVal) {
          ipe.passivate(function() {
            editable.show('fast');
          });
          return;
        }
        
        var ajaxParams = {
          oldValue: oldVal,
          newValue: newVal
        };
        if (opts.id) {
          $.extend(ajaxParams, {
            id: opts.id
          });
        }
        $.extend(ajaxParams, opts.data);
    
        if (opts['beforeSave']) {
          if (opts['beforeSave'](oldVal, newVal) === false) {
            ipe.passivate(function() {
              editable.show('fast');
            });
            return;
          }
        }

        $.ajax({
          url: saveUrl,
          type: 'POST',
          dataType: 'json',
          data: ajaxParams,
          success: function(res) {
            if (res.error) {
              ipe.editingMode();
              ipe.showError(res.message);
              return;
            }
            ipe.passivate(function() {
              var v = JSON.parse(res.data);
              ipe.val(v);
              var label = ipe.toPlaceholder(v) || ipe.toLabel(v);
              editable.label(label);
              editable.show('fast', function() {
                if (opts['onSaveComplete']) {
                  opts['onSaveComplete'](v, editable, ipe);
                }
              });
            });
          }
        });

      };

      var onCancel = function() {
        ipe.discard(function() {
          editable.show('fast');
        });
      };
      
      ipe.addSaveEventListener(onSave);
      ipe.addCancelEventListener(onCancel);
      
      editable.addEditEventListener(opts['editEvent'], function() {
        editable.hide('fast', function() {
          ipe.activate();
        });
      });
      
    });
    
    return $(this);
  
  };
  
})(jQuery);

