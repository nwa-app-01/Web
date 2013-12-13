/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../typings/knockout/knockout.amd.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
// Module
var Index;
(function (Index) {
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
    Index.VMConfig = VMConfig;

    var Document = (function () {
        function Document() {
            ko.mapping.fromJS({ Id: 0, Name: '' }, {}, this);
        }
        return Document;
    })();
    Index.Document = Document;
    var DocumentTemplate = (function () {
        function DocumentTemplate() {
            ko.mapping.fromJS({ Id: 0, TemplateName: '' }, {}, this);
        }
        return DocumentTemplate;
    })();
    Index.DocumentTemplate = DocumentTemplate;

    var CreateDialog = (function () {
        function CreateDialog() {
            var self = this;
            ko.mapping.fromJS({ isOpen: false, name: '' }, {}, self);
        }
        return CreateDialog;
    })();
    Index.CreateDialog = CreateDialog;

    var VM = (function () {
        function VM(config) {
            var self = this;
            self.config = config;
            self.messageUser = function (s) {
                self.userMessages.push(moment().format('DD-MMM-YYYY HH:MM:SS') + ' ' + s);
            };
            self.userMessages = ko.observableArray([]);
            self.createDocumentDialog = ko.observable();
            self.createTemplateDialog = ko.observable();

            self.documentTemplates = ko.observableArray();
            self.documents = ko.observableArray();
            self.initialize = function () {
                self.config.message('loading data');
                return $.when($.ajax({
                    url: config.baseUrl + '/Template',
                    contentType: 'application/json; charset=utf-8'
                }).done(function (data) {
                    ko.mapping.fromJS(data, {}, self.documentTemplates);
                    self.config.message('document templates have loaded');
                }).fail(function () {
                    self.config.message('document templates failed to load');
                }), $.ajax({
                    url: config.baseUrl + '/DocumentData',
                    contentType: 'application/json; charset=utf-8'
                }).done(function (data) {
                    ko.mapping.fromJS(data, {}, self.documents);
                    self.config.message('documents have loaded');
                }).fail(function () {
                    self.config.message('documents failed to load');
                }));
            };
            self.createDocument = function (item) {
                self.config.message('creating new document');
                return $.when($.ajax({
                    url: config.baseUrl + '/DocumentData',
                    contentType: 'application/json; charset=utf-8',
                    type: 'POST',
                    data: ko.mapping.toJSON({ Id: self.createDocumentDialog().item.Id(), TemplateName: self.createDocumentDialog().name })
                }).done(function (data) {
                    self.config.message('document created');
                    var document = new Document();
                    document.Id(data.Id);
                    document.Name(data.Name);
                    self.documents.push(document);
                    self.messageUser('Document ' + document.Name() + ' created');
                }).fail(function () {
                    self.config.message('document failed to create');
                }).always(function () {
                    self.createDocumentDialog().isOpen(false);
                }));
            };
            self.createTemplateDocument = function () {
                self.config.message('creating new template');
                return $.when($.ajax({
                    url: config.baseUrl + '/Template',
                    contentType: 'application/json; charset=utf-8',
                    type: 'POST',
                    data: ko.mapping.toJSON({ Id: 0, TemplateName: self.createTemplateDialog().name })
                }).done(function (data) {
                    self.config.message('template created');
                    var template = new DocumentTemplate();
                    template.Id(data.Id);
                    template.TemplateName(data.TemplateName);
                    self.documentTemplates.push(template);
                    self.messageUser('Template ' + template.TemplateName() + ' created');
                }).fail(function () {
                    self.config.message('template failed to create');
                }).always(function () {
                    self.createTemplateDialog().isOpen(false);
                }));
            };
            self.openCreateDocumentDialog = function (item) {
                var dialog = new CreateDialog();
                dialog.item = item;
                dialog.isOpen(true);
                self.createDocumentDialog(dialog);
            };
            self.openCreateTemplateDialog = function () {
                var dialog = new CreateDialog();
                dialog.isOpen(true);
                self.createTemplateDialog(dialog);
            };
        }
        return VM;
    })();
    Index.VM = VM;
})(Index || (Index = {}));
//# sourceMappingURL=index.js.map
