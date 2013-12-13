/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
// Module
var DataDocument;
(function (DataDocument) {
    var User = (function () {
        function User() {
        }
        User.message = function (s, clear) {
            if (typeof clear === 'undefined') {
                clear = true;
            }
            if (clear || clear == true) {
                User.clear();
            }
            ;
            this.messages.push(moment().format('DD-MMM-YYYY HH:MM:SS') + ' ' + s);
        };
        User.errorMessage = function (jqXHR, clear) {
            if (typeof clear === 'undefined') {
                clear = true;
            }
            if (jqXHR) {
                if (jqXHR.responseText) {
                    if (jqXHR.responseText) {
                        var e = jQuery.parseJSON(jqXHR.responseText);
                        if (clear || clear == true) {
                            User.clear();
                        }
                        ;
                        this.messages.push(moment().format('DD-MMM-YYYY HH:MM:SS') + ' ' + e.Message);
                    }
                }
            }
        };
        User.clear = function () {
            this.messages.removeAll();
        };
        User.messages = ko.observableArray();
        return User;
    })();
    DataDocument.User = User;

    var VMConfig = (function () {
        function VMConfig(options) {
            this.baseUrl = '';
            this.message = function (m) {
            };
            this.messageClear = function () {
            };
            $.extend(this, options);
        }
        return VMConfig;
    })();
    DataDocument.VMConfig = VMConfig;

    var TemplateDataDocument = (function () {
        function TemplateDataDocument(config) {
            var self = this;
            self.Id = ko.observable(0);
            self.Name = ko.observable('');
            self.RV = ko.observable('');
            self.config = config;
            self.dataSets = ko.observableArray();
            self.editTemplateDataSet = ko.observable(new TemplateDataSet(config, 0));
            self.load = function (id) {
                self.config.message('dataSets is loading');
                return $.ajax({
                    url: self.config.baseUrl + '/DocumentData/' + id + '/DataSets',
                    contentType: 'application/json; charset=utf-8'
                }).done(function (data) {
                    $.each(data, function (i, e) {
                        var dataSet = new TemplateDataSet(self.config, id);
                        ko.mapping.fromJS(e, {}, dataSet);
                        self.dataSets.push(dataSet);
                        dataSet.load();
                    });
                    self.config.message('dataSets has loaded');
                }).fail(function () {
                    self.config.message('dataSets failed to load');
                });
            };
            self.selectTemplateDataSet = function (item) {
                self.editTemplateDataSet(item);
            };

            self.updateDataSet = function (dataSet) {
                var name = self.Name();
                if (name) {
                    self.config.message('updating dataset ' + self.Id());
                    return $.ajax({
                        url: config.baseUrl + '/DocumentData/' + self.Id() + '/DataSet',
                        type: 'PUT',
                        contentType: 'application/json; charset=utf-8',
                        data: ko.mapping.toJSON({ Id: dataSet.Id(), Name: dataSet.Name() })
                    }).done(function (data) {
                        self.config.message('added dataset group ' + self.Id());
                        User.message('Data Set ' + data.Name + ' added');
                    }).fail(function (jqXHR, textStatus) {
                        self.config.message('adding dataset group ' + self.Id() + ' failed');
                        User.errorMessage(jqXHR);
                    });
                }
            };
            self.addDataSet = function (group) {
                var name = $('#addDataSetName').val();
                if (name) {
                    self.config.message('adding dataset group ' + self.Id());
                    return $.ajax({
                        url: config.baseUrl + '/DocumentData/' + self.Id() + '/DataSet',
                        type: 'POST',
                        contentType: 'application/json; charset=utf-8',
                        data: ko.mapping.toJSON({ Id: group.Id(), Name: name })
                    }).done(function (data) {
                        self.config.message('added dataset group ' + self.Id());
                        User.message('Data Set ' + data.Name + ' added');
                    }).fail(function (jqXHR, textStatus) {
                        self.config.message('adding dataset group ' + self.Id() + ' failed');
                        User.errorMessage(jqXHR);
                    });
                }
            };
        }
        return TemplateDataDocument;
    })();
    DataDocument.TemplateDataDocument = TemplateDataDocument;

    var TemplateField = (function () {
        function TemplateField() {
            ko.mapping.fromJS({ Id: 0, GroupId: 0, Name: '', Description: '', RV: '', SortOrder: '', isOpenAddTemplateFieldDialog: false }, {}, this);
        }
        return TemplateField;
    })();
    DataDocument.TemplateField = TemplateField;
    var TemplateDataSet = (function () {
        function TemplateDataSet(config, documentId) {
            var self = this;
            self.config = config;
            self.documentId = ko.observable(documentId);
            self.isOpenAddTemplateFieldDialog = ko.observable(false);
            self.editTemplateField = ko.observable(new TemplateField());
            self.items = ko.observableArray();
            self.openAddTemplateFieldDialog = function (item) {
                self.isOpenAddTemplateFieldDialog(item);
            };
            self.updateTemplateFieldName = function (item) {
                if (self.editTemplateField && self.editTemplateField()) {
                    if (self.editTemplateField().Description().length > 0 && self.editTemplateField().Name().length == 0) {
                        var name = self.editTemplateField().Description();
                        name = name.replace(/^\s+|$\s/gi, "").replace(/\s+/gi, "-");
                        if (name && name.length > 0) {
                            self.editTemplateField().Name(name.toLowerCase());
                        }
                    }
                }
            };
            self.addTemplateField = function () {
                self.openAddTemplateFieldDialog(false);
                self.config.message('adding template field to document ' + self.documentId() + '/' + self.Name() + '/' + self.editTemplateField().Name);
                var templateField = {
                    Id: self.Id(),
                    DocumentId: self.documentId(),
                    GroupId: self.Id(),
                    Name: self.editTemplateField().Name,
                    Description: self.editTemplateField().Description,
                    SortOrder: self.editTemplateField().SortOrder,
                    RV: ''
                };
                return $.ajax({
                    contentType: 'application/json; charset=utf-8',
                    url: self.config.baseUrl + '/DocumentDataField/',
                    type: 'POST',
                    data: ko.mapping.toJSON(templateField)
                }).done(function (data) {
                    self.config.message('added template field to document ' + self.documentId() + '/' + self.Name() + '/' + self.editTemplateField().Name);
                    var item = new TemplateDataItem();
                    ko.mapping.fromJS(data, {}, item);
                    self.items.push(item);
                    self.editTemplateField(new TemplateField());
                    User.message('Template field added');
                }).fail(function (jqXHR, textStatus) {
                    self.config.message('adding template field failed');
                    User.errorMessage(jqXHR);
                });
            };
            self.load = function () {
                self.config.message('dataSet is loading');
                return $.ajax({
                    url: self.config.baseUrl + '/DocumentData/' + self.Id() + '/DataSet',
                    contentType: 'application/json; charset=utf-8'
                }).done(function (data) {
                    $.each(data, function (i, e) {
                        var item = new TemplateDataItem();
                        ko.mapping.fromJS(e, {}, item);
                        self.items.push(item);
                    });
                    self.config.message('dataSet has loaded');
                }).fail(function () {
                    self.config.message('dataSet failed to load');
                });
            };
        }
        return TemplateDataSet;
    })();
    DataDocument.TemplateDataSet = TemplateDataSet;
    var TemplateDataItem = (function () {
        function TemplateDataItem() {
        }
        return TemplateDataItem;
    })();
    DataDocument.TemplateDataItem = TemplateDataItem;
    var VM = (function () {
        function VM(config) {
            var self = this;
            self.config = config;
            self.groups = ko.observableArray();
            self.dataDocument = ko.observable();
            self.editableTemplateDataItem = ko.observable();
            self.initialize = function () {
                return $.when($.ajax({
                    url: config.baseUrl + '/DocumentDataFieldGroup',
                    contentType: 'application/json; charset=utf-8'
                }).done(function (data) {
                    ko.mapping.fromJS(data, {}, self.groups);
                    self.config.message('groups have loaded');
                }).fail(function () {
                    self.config.message('groups failed to load');
                }));
            };
            self.load = function (id) {
                var dfd = $.Deferred();
                if (id) {
                    dfd.promise($.ajax({
                        url: config.baseUrl + '/DocumentData/' + id,
                        contentType: 'application/json; charset=utf-8'
                    }).done(function (data) {
                        self.dataDocument(ko.mapping.fromJS(data, {}, new TemplateDataDocument(self.config)));
                        self.config.message('dataDocument has loaded');
                    }).fail(function () {
                        self.config.message('dataDocument failed to load');
                    }).pipe(function () {
                        self.dataDocument().load(id);
                    }));
                } else {
                    dfd.resolve();
                }
                return dfd;
            };
            self.selectTemplateDataItem = function (item) {
                self.editableTemplateDataItem(item);
            };
            self.updateTemplateDataItem = function (update) {
                self.config.message('item is updating');
                return $.ajax({
                    url: config.baseUrl + '/DocumentData/' + update.Id() + '/Update',
                    contentType: 'application/json; charset=utf-8',
                    type: 'POST',
                    data: ko.mapping.toJSON(update)
                }).done(function (data) {
                    ko.mapping.fromJS(data, {}, update);
                    self.editableTemplateDataItem(null);
                    self.config.message('item updated');
                    User.message(update.Description() + ' updated');
                }).fail(function () {
                    self.config.message('item failed to update');
                });
            };
        }
        return VM;
    })();
    DataDocument.VM = VM;
})(DataDocument || (DataDocument = {}));
//# sourceMappingURL=edit.js.map
