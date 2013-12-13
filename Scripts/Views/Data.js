function PageViewModel(options) {
    var self = this;
    var defaults = $.extend({
        baseUrl: '',
        messager: function (m) { },
        messagerClear: function () { },
        modelMessenger: function (m) { },
        modelMessengerClear: function () { }
    }, options);
    self.messager = defaults.messager;
    self.messagerClear = defaults.messagerClear;
    self.modelMessenger = defaults.modelMessenger;
    self.modelMessengerClear = defaults.modelMessengerClear;
    self.messager("Model loading");
    self.items = new ko.observableArray();
    self.sets = new ko.observableArray();
    self.dataDocument = new ko.observable();
    self.lastUpdate = new ko.observable();
    self.sortOrderColumnVisible = new ko.observable(false);
    self.addTemplateFieldItem = ko.mapping.fromJS({ Id: -1, DocumentId: -1, FieldName: '', FieldDescription: '', SortOrder: '', GroupId: '' });
    self.templateDocumentItem = ko.mapping.fromJS({ TemplateName: '' });
    self.templates = new ko.observableArray();
    self.dataDocuments = new ko.observableArray();
    self.fieldGroups = new ko.observableArray();
    self.editorItem = new ko.observable();
    self.selectedSet = new ko.observable();
    self.setItems = new ko.observableArray();
    self.selectDataDocument = function (item) {
        var id = item.Id();
        self.dataDocument.Name = '';
        self.editorItem(null);
        self.load(id)
    };
    self.selectSet = function (item) {
        self.selectedSet(item);
        var xs = jQuery.grep(self.items(), function (e, i) {
            return (e.Name() == item.Name());
        });
        self.setItems(xs[0].Items());
        self.editorItem(null);
    };
    self.createDataDocument = function (item) {
        var id = item.Id();
        var createded = null;
        self.dataDocuments.removeAll();
        $.when(self.create(item))
        .then(function (data) {
            created = ko.mapping.fromJS(data);
        })
        .then(self.loadDataDocuments())
        .then(function (data) {
            self.selectDataDocument(created);
        });
    };

    self.load = function (id) {
        self.addTemplateFieldItem.DocumentId(id);
        self.sets.removeAll();
        self.items.removeAll();
        self.selectedSet(null);
        $.when(
            $.ajaxQueue({
                url: defaults.baseUrl + '/DocumentData/' + id,
                contentType: 'application/json; charset=utf-8'
            }).done(function (data) {
                self.messager("Data document received");
                self.dataDocument(ko.mapping.fromJS(data));
            }).fail(function () {
                self.messager("Data document error");
            })
        ).then(
            $.ajaxQueue({
                url: defaults.baseUrl + '/DocumentData/' + id + '/Sets',
                contentType: 'application/json; charset=utf-8'
            }).done(function (data) {
                self.messager("Data sets received");
                $.each(data, function (i, e) {
                    self.sets.push(ko.mapping.fromJS(e));
                });
            }).fail(function () {
                self.messager("Data sets error");
            })
        ).then(
            $.ajaxQueue({
                url: defaults.baseUrl + '/DocumentData/' + id + '/Items',
                contentType: 'application/json; charset=utf-8'
            }).done(function (data) {
                self.messager("Data items received");
                $.each(data, function (i, e) {
                    self.items.push(ko.mapping.fromJS(e));
                });
                self.selectedSet(self.items()[0]);
            }).fail(function () {
                self.messager("Data items error");
            })
        );
    };

    self.loadTemplates = function () {
        self.templates.removeAll();
        return $.ajaxQueue({
            url: defaults.baseUrl + '/Template/',
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                self.messager("Data received");
                $.each(data, function (i, e) {
                    self.templates.push(ko.mapping.fromJS(e));
                });
            },
            error: function () {
                self.messager("Data error");
            }
        });
    };
    self.loadDataDocuments = function () {
        return $.ajaxQueue({
            url: defaults.baseUrl + '/DocumentData/',
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                self.messager("Data received");
                $.each(data, function (i, e) {
                    self.dataDocuments.push(ko.mapping.fromJS(e));
                });
            },
            error: function () {
                self.messager("Data error");
            }
        });
    };

    self.loadFieldGroups = function () {
        return $.ajaxQueue({
            url: defaults.baseUrl + '/DocumentDataFieldGroup/',
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                self.messager("Data received");
                $.each(data, function (i, e) {
                    self.fieldGroups.push(ko.mapping.fromJS(e));
                });
            },
            error: function () {
                self.messager("Data error");
            }
        });
    };
    self.addTemplateSet = function (target) {
        var id = $(target).select("option:selected").val();
        var text = $(target).find("option:selected").text();
        self.messager("Create Template set for " + id + '/' + text);

    };
    self.addTemplateField = function () {
        self.modelMessengerClear();
        if (!(/^[A-Za-z0-9-]*$/.test(self.addTemplateFieldItem.FieldName()))) {
            self.modelMessenger("Field Name is not valid");
            return false;
        };
        if (self.items().filter(function (e) {
            return e.Name() == self.addTemplateFieldItem.FieldName();
        }).length > 0) {
            self.modelMessenger("Field Name already exists");
            return false;
        };
        return $.ajaxQueue({
            url: defaults.baseUrl + '/DocumentDataFieldGroup/',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: ko.toJSON(self.addTemplateFieldItem),
            success: function (data) {
                self.messager("Creating item");
                self.items.push(ko.mapping.fromJS(data));
                self.messager("Item created " + self.addTemplateFieldItem.Id());
                self.addTemplateFieldItem({});
            },
            error: function () {
                self.messager("Data error");
            }
        });
    };
    self.addTemplateDocument = function (item) {
        if (item.TemplateName()) {
            self.editorItem(null);
            $.when(self.createTemplate(item))
            .then(self.loadTemplates())
            .then(function () { item.TemplateName(""); });
        } else {
            self.messager("You must provide a document template name");
        }
    };
    self.createTemplate = function (item) {
        return $.ajaxQueue({
            url: defaults.baseUrl + '/Template/',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: ko.toJSON(item),
            success: function (data) {
                self.messager("Template created " + data.TemplateName);
            },
            error: function () {
                self.messager("Data error");
            }
        });
    };
    self.create = function (item) {
        return $.ajaxQueue({
            url: defaults.baseUrl + '/DocumentData/',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: ko.toJSON(item),
            success: function (data) {
                self.messager("Document created " + data.Id);
            },
            error: function () {
                self.messager("Data error");
            }
        });
    };
    self.update = function (item) {
        self.messager("Item update " + item.Id());
        $.ajaxQueue({
            type: 'PUT',
            data: ko.toJSON(item),
            dataType: 'json',
            url: defaults.baseUrl + '/DocumentDataFieldGroup/' + item.Id(),
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                self.lastUpdate(item);
                self.messager("Item updated " + item.Id());
            }
        });
    };

    self.edit = function (item) {
        self.editorItem(item);
    };

    self.messager("Model loaded");
    return {
        dataDocument: self.dataDocument,
        messager: self.messager,
        messagerClear: self.messagerClear,
        modelMessenger: self.modelMessenger,
        modelMessengerClear: self.modelMessengerClear,
        load: self.load,
        edit: self.edit,
        update: self.update,
        lastUpdate: self.lastUpdate,
        items: self.items,
        setItems: self.setItems,
        sets: self.sets,
        addTemplateFieldUI: self.addTemplateFieldUI,
        toggleTemplateFieldUI: self.toggleTemplateFieldUI,
        addTemplateSet: self.addTemplateSet,
        addTemplateFieldItem: self.addTemplateFieldItem,
        addTemplateField: self.addTemplateField,
        templateDocumentItem: self.templateDocumentItem,
        addTemplateDocument: self.addTemplateDocument,
        templateDocument: self.templateDocument,
        sortOrderColumnVisible: self.sortOrderColumnVisible,
        loadDataDocuments: self.loadDataDocuments,
        dataDocuments: self.dataDocuments,
        loadTemplates: self.loadTemplates,
        templates: self.templates,
        fieldGroups: self.fieldGroups,
        loadFieldGroups: self.loadFieldGroups,
        selectDataDocument: self.selectDataDocument,
        selectSet: self.selectSet,
        createDataDocument: self.createDataDocument,
        editorItem: self.editorItem,
        selectedSet: self.selectedSet
    };
};