/** 
 * hovertips
 * Copyright (c) 2012 DIY Co
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this 
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under 
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF 
 * ANY KIND, either express or implied. See the License for the specific language 
 * governing permissions and limitations under the License.
 *
 * @author Brian Reavis <brian@diy.org>
 *         Andrew Sliwinski <andrew@diy.org>
 */

(function($) {

    /**
     * @constructor
     * @param {object} $el
     * @param {object} options
     */
    var HoverTip = function($el, options) {
        var self = this;
        var anchor; 

        this.options = $.extend({
            capture: true,
            ajax: null,
            anchor: 's',
            delay_hover: 100,
            delay_leave: 500,
            delay_hide: 500,
            render: function($el, data) {
                var text = $el.attr('title');
                if (!text) return false;
                return $('<div>').html(text).addClass('tooltip'); 
            }
        }, options);

        // default tooltip alignment, depending on anchor
        options = this.options;
        anchor  = options.anchor.toLowerCase();

        if (!options.valign) {
            if (anchor.indexOf('n') !== -1) {
                options.valign = 'bottom';
            } else if (anchor.indexOf('s') !== -1) {
                options.valign = 'top';
            } else {
                options.valign = 'middle';
            }
        }

        if (!options.align) {
            if (anchor.indexOf('w') !== -1) {
                options.align = 'right';
            } else if (anchor.indexOf('e') !== -1) {
                options.align = 'left';
            } else {
                options.align = 'center';
            }
        }

        this.$el         = $el;
        this.$tooltip    = null;
        this.xhr         = null;
        this.timer_hover = null;
        this.timer_hide  = null;
        this.timer_leave = null;
        this.active      = false;

        $el.on('mouseenter', function() { self._mouseenter.apply(self, arguments); });
        $el.on('mouseleave', function() { self._mouseleave.apply(self, arguments); });
    };

    HoverTip.prototype._mouseleave = function() {
        var self = this;

        this.timer_leave = window.setTimeout(function() {
            self.timer_leave = null;

            if (self.timer_hover) {
                window.clearTimeout(self.timer_hover);
                self.timer_hover = null;
            }

            if (self.xhr) {
                self.xhr.abort();
                self.xhr = null;
            }

            self.hide();
        }, this.options.delay_leave);
    };

    HoverTip.prototype._mouseenter = function() {
        var self = this;

        if (self.timer_leave) {
            window.clearTimeout(self.timer_leave);
            self.timer_leave = null;
        }

        if (this.timer_hover) return;
        this.timer_hover = window.setTimeout(function() {
            self.timer_hover = null;

            if (self.xhr) return;
            if (self.active) return;
            if (self.data) {
                self.show();
                return;
            }

            if (self.options.ajax) {
                var req = typeof self.options.ajax === 'function'
                    ? self.options.ajax(self.$el)
                    : self.options.ajax;

                self.xhr = $.ajax($.extend(req, {
                    success: function(res) {
                        self.data = res || {};
                        self.render();
                        self.show();
                    }
                }));
            } else {
                self.data = {};
            }

            self.render();
            self.show();
        }, this.options.delay_hover);
    };

    HoverTip.prototype.render = function() {
        var self = this, $tooltip;
        var replace = false;

        if (this.$tooltip) {
            this.$tooltip.remove();
            this.active = false;
            replace = true;
        }

        $tooltip = this.options.render.apply(this, [this.$el, this.data, !this.data]);
        if (!$tooltip) return;

        $tooltip.hide().css({position: 'absolute'});
        if (replace) $tooltip.addClass('replace');

        this.$tooltip = $tooltip;

        $tooltip.on('mouseenter', function() { self._mouseenter.apply(self, arguments); });
        $tooltip.on('mouseleave', function() { self._mouseleave.apply(self, arguments); });
        $tooltip.on('reposition', function() { self.reposition.apply(self, arguments); });
    };

    HoverTip.prototype.reposition = function() {
        if (!this.$el || !this.$tooltip) return;

        var coords     = {};
        var offset     = this.options.offset || {};
        var src_offset = this.$el.offset();
        var src_width  = this.$el.outerWidth();
        var src_height = this.$el.outerHeight();
        var tip_width  = this.$tooltip.outerWidth();
        var tip_height = this.$tooltip.outerHeight();
        var options    = this.options;
        var anchor     = options.anchor.toLowerCase();

        // anchor positioning / tooltip alignment

        if (anchor.indexOf('w') !== -1) coords.x = src_offset.left;
        else if (anchor.indexOf('e') !== -1) coords.x = src_offset.left + src_width;
        else coords.x = src_offset.left + src_width / 2;

        if (anchor.indexOf('n') !== -1) coords.y = src_offset.top;
        else if (anchor.indexOf('s') !== -1) coords.y = src_offset.top + src_height;
        else coords.y = src_offset.top + src_height / 2;

        if (options.align === 'right')    coords.x -= tip_width;
        if (options.align === 'center')   coords.x -= tip_width / 2;
        if (options.valign === 'bottom')  coords.y -= tip_height;
        if (options.vcenter === 'middle') coords.y -= tip_height / 2;

        if (offset.left) coords.x += offset.left;
        if (offset.top)  coords.y += offset.top;

        this.$tooltip.css({
            left : Math.round(coords.x),
            top  : Math.round(coords.y),
        });
    };

    HoverTip.prototype.show = function() {
        if (!this.$tooltip) return;
        if (this.active) return;

        if (this.options.filter && !this.options.filter(this.$el)) {
            return;
        }

        if (this.timer_hide) {
            window.clearTimeout(this.timer_hide);
            this.timer_hide = null;
        }

        this.active = true;
        this.$tooltip.css({visibility: 'hidden'});
        $('body').append(this.$tooltip);
        this.reposition();
        this.$tooltip.css({visibility: 'visible'}).show().addClass('on');
    };

    HoverTip.prototype.hide = function(delay) {
        if (!this.active) return;
        this.active = false;

        if (typeof delay === 'undefined') {
            delay = this.options.delay_hide;
        }

        var self = this;
        if (this.$tooltip) {
            this.$tooltip.removeClass('on');
            this.timer_hide = window.setTimeout(function() {
                if (self.active) return;
                if (self.$tooltip) {
                    self.$tooltip.hide().detach();
                }
            }, delay);
        }
    };

    // ---------------------------------------------------------------

    $.hovertips = function(selector, options) {
        var construct = function(el) {
            var $el = $(el);
            if (!el.hovertip) el.hovertip = new HoverTip($el, options);
            return el.hovertip;
        };

        if (typeof selector === 'string') {
            $(document.body).on('mouseenter', selector, function(e) {
                var $el = $(this);
                var hovertip = construct($el[0]);
                hovertip && hovertip._mouseenter(e);
            });
        } else {
            $(selector).each(function(i, el) {
                construct(el);
            });
        }
    };

})(jQuery);