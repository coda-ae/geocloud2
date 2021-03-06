Ext.ux.Spinner = Ext.extend(Ext.util.Observable, {
    incrementValue: 1,
    alternateIncrementValue: 5,
    triggerClass: "x-form-spinner-trigger",
    splitterClass: "x-form-spinner-splitter",
    alternateKey: Ext.EventObject.shiftKey,
    defaultValue: 0,
    accelerate: !1,
    constructor: function (a) {
        Ext.ux.Spinner.superclass.constructor.call(this, a), Ext.apply(this, a), this.mimicing = !1
    },
    init: function (a) {
        this.field = a, a.afterMethod("onRender", this.doRender, this), a.afterMethod("onEnable", this.doEnable, this), a.afterMethod("onDisable", this.doDisable, this), a.afterMethod("afterRender", this.doAfterRender, this), a.afterMethod("onResize", this.doResize, this), a.afterMethod("onFocus", this.doFocus, this), a.beforeMethod("onDestroy", this.doDestroy, this)
    },
    doRender: function () {
        var a = this.el = this.field.getEl(), b = this.field;
        b.wrap ? this.wrap = b.wrap.addClass("x-form-field-wrap") : b.wrap = this.wrap = a.wrap({cls: "x-form-field-wrap"}), this.trigger = this.wrap.createChild({
            tag: "span",
            src: Ext.BLANK_IMAGE_URL,
            cls: "x-form-trigger " + this.triggerClass
        }), b.width || this.wrap.setWidth(a.getWidth() + this.trigger.getWidth()), this.splitter = this.wrap.createChild({
            tag: "div",
            cls: this.splitterClass,
            style: "width:13px; height:2px;"
        }), this.splitter.setRight(Ext.isIE ? 1 : 2).setTop(10).show(), this.proxy = this.trigger.createProxy("", this.splitter, !0), this.proxy.addClass("x-form-spinner-proxy"), this.proxy.setStyle("left", "0px"), this.proxy.setSize(14, 1), this.proxy.hide(), this.dd = new Ext.dd.DDProxy(this.splitter.dom.id, "SpinnerDrag", {dragElId: this.proxy.id}), this.initTrigger(), this.initSpinner()
    },
    doAfterRender: function () {
        var a;
        Ext.isIE && this.el.getY() != (a = this.trigger.getY()) && (this.el.position(), this.el.setY(a))
    },
    doEnable: function () {
        this.wrap && (this.disabled = !1, this.wrap.removeClass(this.field.disabledClass))
    },
    doDisable: function () {
        this.wrap && (this.disabled = !0, this.wrap.addClass(this.field.disabledClass), this.el.removeClass(this.field.disabledClass))
    },
    doResize: function (a) {
        "number" == typeof a && this.el.setWidth(a - this.trigger.getWidth()), this.wrap.setWidth(this.el.getWidth() + this.trigger.getWidth())
    },
    doFocus: function () {
        this.mimicing || (this.wrap.addClass("x-trigger-wrap-focus"), this.mimicing = !0, Ext.get(Ext.isIE ? document.body : document).on("mousedown", this.mimicBlur, this, {delay: 10}), this.el.on("keydown", this.checkTab, this))
    },
    checkTab: function (a) {
        a.getKey() == a.TAB && this.triggerBlur()
    },
    mimicBlur: function (a) {
        !this.wrap.contains(a.target) && this.field.validateBlur(a) && this.triggerBlur()
    },
    triggerBlur: function () {
        this.mimicing = !1, Ext.get(Ext.isIE ? document.body : document).un("mousedown", this.mimicBlur, this), this.el.un("keydown", this.checkTab, this), this.field.beforeBlur(), this.wrap.removeClass("x-trigger-wrap-focus"), this.field.onBlur.call(this.field)
    },
    initTrigger: function () {
        this.trigger.addClassOnOver("x-form-trigger-over"), this.trigger.addClassOnClick("x-form-trigger-click")
    },
    initSpinner: function () {
        this.field.addEvents({
            spin: !0,
            spinup: !0,
            spindown: !0
        }), this.keyNav = new Ext.KeyNav(this.el, {
            up: function (a) {
                a.preventDefault(), this.onSpinUp()
            }, down: function (a) {
                a.preventDefault(), this.onSpinDown()
            }, pageUp: function (a) {
                a.preventDefault(), this.onSpinUpAlternate()
            }, pageDown: function (a) {
                a.preventDefault(), this.onSpinDownAlternate()
            }, scope: this
        }), this.repeater = new Ext.util.ClickRepeater(this.trigger, {accelerate: this.accelerate}), this.field.mon(this.repeater, "click", this.onTriggerClick, this, {preventDefault: !0}), this.field.mon(this.trigger, {
            mouseover: this.onMouseOver,
            mouseout: this.onMouseOut,
            mousemove: this.onMouseMove,
            mousedown: this.onMouseDown,
            mouseup: this.onMouseUp,
            scope: this,
            preventDefault: !0
        }), this.field.mon(this.wrap, "mousewheel", this.handleMouseWheel, this), this.dd.setXConstraint(0, 0, 10), this.dd.setYConstraint(1500, 1500, 10), this.dd.endDrag = this.endDrag.createDelegate(this), this.dd.startDrag = this.startDrag.createDelegate(this), this.dd.onDrag = this.onDrag.createDelegate(this)
    },
    onMouseOver: function () {
        if (!this.disabled) {
            var a = this.getMiddle();
            this.tmpHoverClass = Ext.EventObject.getPageY() < a ? "x-form-spinner-overup" : "x-form-spinner-overdown", this.trigger.addClass(this.tmpHoverClass)
        }
    },
    onMouseOut: function () {
        this.trigger.removeClass(this.tmpHoverClass)
    },
    onMouseMove: function () {
        if (!this.disabled) {
            var a = this.getMiddle();
            Ext.EventObject.getPageY() > a && "x-form-spinner-overup" == this.tmpHoverClass || Ext.EventObject.getPageY() < a && "x-form-spinner-overdown" == this.tmpHoverClass
        }
    },
    onMouseDown: function () {
        if (!this.disabled) {
            var a = this.getMiddle();
            this.tmpClickClass = Ext.EventObject.getPageY() < a ? "x-form-spinner-clickup" : "x-form-spinner-clickdown", this.trigger.addClass(this.tmpClickClass)
        }
    },
    onMouseUp: function () {
        this.trigger.removeClass(this.tmpClickClass)
    },
    onTriggerClick: function () {
        if (!this.disabled && !this.el.dom.readOnly) {
            var a = this.getMiddle(), b = Ext.EventObject.getPageY() < a ? "Up" : "Down";
            this["onSpin" + b]()
        }
    },
    getMiddle: function () {
        var a = this.trigger.getTop(), b = this.trigger.getHeight(), c = a + b / 2;
        return c
    },
    isSpinnable: function () {
        return this.disabled || this.el.dom.readOnly ? (Ext.EventObject.preventDefault(), !1) : !0
    },
    handleMouseWheel: function (a) {
        if (0 != this.wrap.hasClass("x-trigger-wrap-focus")) {
            var b = a.getWheelDelta();
            b > 0 ? (this.onSpinUp(), a.stopEvent()) : 0 > b && (this.onSpinDown(), a.stopEvent())
        }
    },
    startDrag: function () {
        this.proxy.show(), this._previousY = Ext.fly(this.dd.getDragEl()).getTop()
    },
    endDrag: function () {
        this.proxy.hide()
    },
    onDrag: function () {
        if (!this.disabled) {
            var a = Ext.fly(this.dd.getDragEl()).getTop(), b = "";
            this._previousY > a && (b = "Up"), this._previousY < a && (b = "Down"), "" != b && this["onSpin" + b](), this._previousY = a
        }
    },
    onSpinUp: function () {
        if (0 != this.isSpinnable()) {
            if (1 == Ext.EventObject.shiftKey)return void this.onSpinUpAlternate();
            this.spin(!1, !1), this.field.fireEvent("spin", this), this.field.fireEvent("spinup", this)
        }
    },
    onSpinDown: function () {
        if (0 != this.isSpinnable()) {
            if (1 == Ext.EventObject.shiftKey)return void this.onSpinDownAlternate();
            this.spin(!0, !1), this.field.fireEvent("spin", this), this.field.fireEvent("spindown", this)
        }
    },
    onSpinUpAlternate: function () {
        0 != this.isSpinnable() && (this.spin(!1, !0), this.field.fireEvent("spin", this), this.field.fireEvent("spinup", this))
    },
    onSpinDownAlternate: function () {
        0 != this.isSpinnable() && (this.spin(!0, !0), this.field.fireEvent("spin", this), this.field.fireEvent("spindown", this))
    },
    spin: function (a, b) {
        var c = parseFloat(this.field.getValue()), d = 1 == b ? this.alternateIncrementValue : this.incrementValue;
        1 == a ? c -= d : c += d, c = isNaN(c) ? this.defaultValue : c, c = this.fixBoundries(c), this.field.setRawValue(c)
    },
    fixBoundries: function (a) {
        var b = a;
        return void 0 != this.field.minValue && b < this.field.minValue && (b = this.field.minValue), void 0 != this.field.maxValue && b > this.field.maxValue && (b = this.field.maxValue), this.fixPrecision(b)
    },
    fixPrecision: function (a) {
        var b = isNaN(a);
        return this.field.allowDecimals && -1 != this.field.decimalPrecision && !b && a ? parseFloat(parseFloat(a).toFixed(this.field.decimalPrecision)) : b ? "" : a
    },
    doDestroy: function () {
        this.trigger && this.trigger.remove(), this.wrap && (this.wrap.remove(), delete this.field.wrap), this.splitter && this.splitter.remove(), this.dd && (this.dd.unreg(), this.dd = null), this.proxy && this.proxy.remove(), this.repeater && this.repeater.purgeListeners(), this.mimicing && Ext.get(Ext.isIE ? document.body : document).un("mousedown", this.mimicBlur, this)
    }
}), Ext.form.Spinner = Ext.ux.Spinner;