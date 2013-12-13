!function (a, b) { "use strict"; "object" == typeof exports ? b(exports, require("jquery"), require("knockout"), require("jquery-ui")) : "function" == typeof define && define.amd ? define(["exports", "jquery", "knockout", "jquery-ui"], b) : b(a.kojqui = {}, a.jQuery, a.ko) }(this, function (a, b, c) { "use strict"; var d, e; d = function () { var a, d, e, f; return a = function (a) { var b = (a || "").match(/^(\d\.\d+)\.\d+$/); return b ? b[1] : null }, d = b && b.fn ? a(b.fn.jquery) : null, e = b && b.ui ? a(b.ui.version) : null, f = c ? a(c.version) : null, { jQuery: d, jQueryUI: e, knockout: f } }(), function () { if (!d.jQuery) throw new Error("jQuery must be loaded before knockout-jquery."); if (!d.jQueryUI) throw new Error("jQuery UI must be loaded before knockout-jquery."); if (!d.knockout) throw new Error("knockout must be loaded before knockout-jquery."); if ("1.8" !== d.jQueryUI && "1.9" !== d.jQueryUI && "1.10" !== d.jQueryUI) throw new Error("This version of the jQuery UI library is not supported."); if ("2.2" !== d.knockout && "2.3" !== d.knockout && "3.0" !== d.knockout) throw new Error("This version of the knockout library is not supported.") }(), e = function () { var a, d, e, f, g, h; return a = function (a, b) { var d = {}; return c.utils.arrayForEach(b, function (b) { void 0 !== a[b] && (d[b] = a[b]) }), d }, d = function (a) { var b, d; b = {}; for (d in a) a.hasOwnProperty(d) && (b[d] = c.isObservable(a[d]) ? a[d].peek() : a[d]); return b }, e = function (a, d, e, f) { b(d)[a]("option", e, c.utils.unwrapObservable(f)) }, f = function (a, b, d) { var f; for (f in d) d.hasOwnProperty(f) && c.isObservable(d[f]) && c.computed({ read: e.bind(this, a, b, f, d[f]), disposeWhenNodeIsRemoved: b }) }, g = function (a, d, e) { c.isObservable(e.refreshOn) && c.computed({ read: function () { e.refreshOn(), b(d)[a]("refresh") }, disposeWhenNodeIsRemoved: d }) }, h = function (e) { var h, i; h = e.name, b.fn[h] && (i = function (i, j, k, l, m) { var n, o, p, q, r, s; return n = "ko_" + h + "_initialized", i[n] || (o = j(), p = a(o, e.options), q = a(o, e.events), e.preInit && e.preInit.apply(this, arguments), c.applyBindingsToDescendants(m, i), s = d(q), b.each(s, function (a, b) { s[a] = b.bind(l) }), r = d(p), b(i)[h](c.utils.extend(r, s)), f(h, i, p), e.hasRefresh && g(h, i, o), c.isWriteableObservable(o.widget) && o.widget(b(i)), c.utils.domNodeDisposal.addDisposeCallback(i, function () { b(i)[h]("destroy"), i[n] = null }), e.postInit && e.postInit.apply(this, arguments), i[n] = !0), { controlsDescendantBindings: !0 } }, c.bindingHandlers[h] = { init: i }) }, { create: h } }(), function () { var a, f, g, h, i; switch (f = function (d, e) { var f = e(); c.isWriteableObservable(f.active) && b(d).on(a, function () { f.active(b(d).accordion("option", "active")) }), c.utils.domNodeDisposal.addDisposeCallback(d, function () { b(d).off(".ko") }) }, d.jQueryUI) { case "1.8": g = ["active", "animated", "autoHeight", "clearStyle", "collapsible", "disabled", "event", "fillSpace", "header", "icons", "navigation", "navigationFilter"], h = ["change", "changestart", "create"], i = !1, a = "accordionchange.ko"; break; case "1.9": case "1.10": g = ["active", "animate", "collapsible", "disabled", "event", "header", "heightStyle", "icons"], h = ["activate", "beforeActivate", "create"], i = !0, a = "accordionactivate.ko" } e.create({ name: "accordion", options: g, events: h, postInit: f, hasRefresh: i }) }(), function () { var a; switch (d.jQueryUI) { case "1.8": a = ["change", "close", "create", "focus", "open", "search", "select"]; break; case "1.9": case "1.10": a = ["change", "close", "create", "focus", "open", "response", "search", "select"] } e.create({ name: "autocomplete", options: ["appendTo", "autoFocus", "delay", "disabled", "minLength", "position", "source"], events: a }) }(), function () { e.create({ name: "button", options: ["disabled", "icons", "label", "text"], events: ["create"], hasRefresh: !0 }) }(), function () { e.create({ name: "buttonset", options: ["items", "disabled"], events: ["create"], hasRefresh: !0 }) }(), function () { var a; a = function (a, d) { var e, f, g, h; e = d(), f = c.utils.unwrapObservable(e.value), f && b(a).datepicker("setDate", f), c.isObservable(e.value) && (g = e.value.subscribe(function (c) { b(a).datepicker("setDate", c) }), c.utils.domNodeDisposal.addDisposeCallback(a, function () { g.dispose() })), c.isWriteableObservable(e.value) && (h = b(a).datepicker("option", "onSelect"), b(a).datepicker("option", "onSelect", function (c) { var d, f; d = b(a).datepicker("option", "dateFormat"), f = b.datepicker.parseDate(d, c), e.value(f), "function" == typeof h && h.apply(this, Array.prototype.slice.call(arguments)) })) }, e.create({ name: "datepicker", options: ["altField", "altFormat", "appendText", "autoSize", "buttonImage", "buttonImageOnly", "buttonText", "calculateWeek", "changeMonth", "changeYear", "closeText", "constrainInput", "currentText", "dateFormat", "dayNames", "dayNamesMin", "dayNamesShort", "defaultDate", "duration", "firstDay", "gotoCurrent", "hideIfNoPrevNext", "isRTL", "maxDate", "minDate", "monthNames", "monthNamesShort", "navigationAsDateFormat", "nextText", "numberOfMonths", "prevText", "selectOtherMonths", "shortYearCutoff", "showAnim", "showButtonPanel", "showCurrentAtPos", "showMonthAfterYear", "showOn", "showOptions", "showOtherMonths", "showWeek", "stepMonths", "weekHeader", "yearRange", "yearSuffix", "beforeShow", "beforeShowDay", "onChangeMonthYear", "onClose", "onSelect"], events: [], postInit: a }) }(), function () { var a, f, g, h; switch (a = function (a) { var b; b = document.createElement("DIV"), b.style.display = "none", a.parentNode.insertBefore(b, a), c.utils.domNodeDisposal.addDisposeCallback(b, function () { c.removeNode(a) }) }, f = function (a, d) { var e = d(); e.isOpen && c.computed({ read: function () { c.utils.unwrapObservable(e.isOpen) ? b(a).dialog("open") : b(a).dialog("close") }, disposeWhenNodeIsRemoved: a }), c.isWriteableObservable(e.isOpen) && (b(a).on("dialogopen.ko", function () { e.isOpen(!0) }), b(a).on("dialogclose.ko", function () { e.isOpen(!1) })), c.utils.domNodeDisposal.addDisposeCallback(a, function () { b(a).off(".ko") }) }, d.jQueryUI) { case "1.8": g = ["autoOpen", "buttons", "closeOnEscape", "closeText", "dialogClass", "disabled", "draggable", "height", "maxHeight", "maxWidth", "minHeight", "minWidth", "modal", "position", "resizable", "show", "stack", "title", "width", "zIndex"], h = ["beforeClose", "create", "open", "focus", "dragStart", "drag", "dragStop", "resizeStart", "resize", "resizeStop", "close"]; break; case "1.9": g = ["autoOpen", "buttons", "closeOnEscape", "closeText", "dialogClass", "draggable", "height", "hide", "maxHeight", "maxWidth", "minHeight", "minWidth", "modal", "position", "resizable", "show", "stack", "title", "width", "zIndex"], h = ["beforeClose", "create", "open", "focus", "dragStart", "drag", "dragStop", "resizeStart", "resize", "resizeStop", "close"]; break; case "1.10": g = ["appendTo", "autoOpen", "buttons", "closeOnEscape", "closeText", "dialogClass", "draggable", "height", "hide", "maxHeight", "maxWidth", "minHeight", "minWidth", "modal", "position", "resizable", "show", "title", "width"], h = ["beforeClose", "create", "open", "focus", "dragStart", "drag", "dragStop", "resizeStart", "resize", "resizeStop", "close"] } e.create({ name: "dialog", options: g, events: h, preInit: a, postInit: f }) }(), function () { e.create({ name: "menu", options: ["disabled", "icons", "menus", "position", "role"], events: ["blur", "create", "focus", "select"], hasRefresh: !0 }) }(), function () { var a; switch (d.jQueryUI) { case "1.8": a = ["disabled", "value"]; break; case "1.9": case "1.10": a = ["disabled", "max", "value"] } e.create({ name: "progressbar", options: a, events: ["change", "create", "complete"] }) }(), function () { var a; a = function (a, d) { var e = d(); c.isWriteableObservable(e.value) && b(a).on("slidechange.ko", function (c, d) { var f = b(a).find(".ui-slider-handle"); f[0] === d.handle && e.value(d.value) }), c.utils.domNodeDisposal.addDisposeCallback(a, function () { b(a).off(".ko") }) }, e.create({ name: "slider", options: ["animate", "disabled", "max", "min", "orientation", "range", "step", "value", "values"], events: ["create", "start", "slide", "change", "stop"], postInit: a }) }(), function () { var a; a = function (a, d) { var e = d(); e.value && c.computed({ read: function () { b(a).spinner("value", c.utils.unwrapObservable(e.value)) }, disposeWhenNodeIsRemoved: a }), c.isWriteableObservable(e.value) && b(a).on("spinchange.ko", function () { e.value(b(a).spinner("value")) }), c.utils.domNodeDisposal.addDisposeCallback(a, function () { b(a).off(".ko") }) }, e.create({ name: "spinner", options: ["culture", "disabled", "icons", "incremental", "max", "min", "numberFormat", "page", "step"], events: ["create", "start", "spin", "stop", "change"], postInit: a }) }(), function () { var a, f, g, h, i, j; switch (a = function (a, d) { var e = d(); c.isWriteableObservable(e.active) && b(a).on("tabsshow.ko", function (a, b) { e.selected(b.index) }), c.utils.domNodeDisposal.addDisposeCallback(a, function () { b(a).off(".ko") }) }, f = function (a, d) { var e = d(); c.isWriteableObservable(e.active) && b(a).on("tabsactivate.ko", function (a, b) { e.active(b.newTab.index()) }), c.utils.domNodeDisposal.addDisposeCallback(a, function () { b(a).off(".ko") }) }, d.jQueryUI) { case "1.8": g = ["ajaxOptions", "cache", "collapsible", "cookie", "disabled", "event", "fx", "idPrefix", "panelTemplate", "selected", "spinner", "tabTemplate"], h = ["add", "create", "disable", "enable", "load", "remove", "select", "show"], j = a, i = !1; break; case "1.9": case "1.10": g = ["active", "collapsible", "disabled", "event", "heightStyle", "hide", "show"], h = ["activate", "beforeActivate", "beforeLoad", "create", "load"], j = f, i = !0 } e.create({ name: "tabs", options: g, events: h, postInit: j, hasRefresh: i }) }(), function () { var a; a = function (a, d) { var e = d(); e.isOpen && c.computed({ read: function () { c.utils.unwrapObservable(e.isOpen) ? b(a).tooltip("open") : b(a).tooltip("close") }, disposeWhenNodeIsRemoved: a }), c.isWriteableObservable(e.isOpen) && (b(a).on("tooltipopen.ko", function () { e.isOpen(!0) }), b(a).on("tooltipclose.ko", function () { e.isOpen(!1) })), c.utils.domNodeDisposal.addDisposeCallback(a, function () { b(a).off(".ko") }) }, e.create({ name: "tooltip", options: ["content", "disabled", "hide", "items", "position", "show", "tooltipClass", "track"], events: ["create", "open", "close"], postInit: a }) }(), c.jqui = { bindingFactory: e }, a.version = "0.5.2" });