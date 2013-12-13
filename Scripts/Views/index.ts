/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../typings/knockout/knockout.amd.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />

// Module
module Index {
    export class VMConfig {
        public baseUrl: string;
        public message: (s: string) => void;
        public messageClear: () => void;
        constructor(options: any) {
            this.baseUrl = '';
            this.message = function (m) { };
            this.messageClear = function () { };
            $.extend(this, options);
        }
    }

    export class Document {
        public Id: KnockoutObservable<number>;
        public Name: KnockoutObservable<string>;
        constructor() {
            ko.mapping.fromJS({ Id: 0, Name: '' }, {}, this);
        }
    }
    export class DocumentTemplate {
        public Id: KnockoutObservable<number>;
        public TemplateName: KnockoutObservable<string>;
        constructor() {
            ko.mapping.fromJS({ Id: 0, TemplateName: '' }, {}, this);
        }
    }

    export class CreateDialog {
        public isOpen: KnockoutObservable<boolean>;
        public name: KnockoutObservable<string>;
        public item: DocumentTemplate;
        constructor() {
            var self = this;
            ko.mapping.fromJS({ isOpen: false, name: '' }, {}, self);
        }
    }

    export class VM {
        private config: VMConfig;
        public initialize: () => void;
        public messageUser: (s: string) => void;
        public userMessages: KnockoutObservableArray<string>;
        public createDocumentDialog: KnockoutObservable<CreateDialog>;
        public createTemplateDialog: KnockoutObservable<CreateDialog>;
        public openCreateDocumentDialog: (item: DocumentTemplate) => void;
        public openCreateTemplateDialog: () => void;
        public documents: KnockoutObservableArray<Document>;
        public documentTemplates: KnockoutObservableArray<DocumentTemplate>;
        public createDocument: (item: DocumentTemplate) => void;
        public createTemplateDocument: () => void;

        constructor(config: VMConfig) {
            var self = this;
            self.config = config;
            self.messageUser = function (s) { self.userMessages.push(moment().format('DD-MMM-YYYY HH:MM:SS') + ' ' + s); }
            self.userMessages = ko.observableArray<string>([]);
            self.createDocumentDialog = ko.observable<CreateDialog>();
            self.createTemplateDialog = ko.observable<CreateDialog>();
            
            self.documentTemplates = ko.observableArray<DocumentTemplate>();
            self.documents = ko.observableArray<Document>();
            self.initialize = function () {
                self.config.message('loading data');
                return $.when(
                    $.ajax({
                        url: config.baseUrl + '/Template',
                        contentType: 'application/json; charset=utf-8'
                    }).done(function (data) {
                        ko.mapping.fromJS(data, {}, self.documentTemplates);
                        self.config.message('document templates have loaded');
                    }).fail(function () {
                        self.config.message('document templates failed to load');
                    }),
                    $.ajax({
                        url: config.baseUrl + '/DocumentData',
                        contentType: 'application/json; charset=utf-8'
                    }).done(function (data) {
                    ko.mapping.fromJS(data, {}, self.documents);
                        self.config.message('documents have loaded');
                    }).fail(function () {
                        self.config.message('documents failed to load');
                    })
                );
            };
            self.createDocument = function (item: DocumentTemplate) {
                self.config.message('creating new document');
                return $.when(
                    $.ajax({
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
                        self.messageUser('Document ' + document.Name() + ' created')
                    }).fail(function () {
                        self.config.message('document failed to create');
                    }).always(function () {
                        self.createDocumentDialog().isOpen(false);
                    })
                );
            };
            self.createTemplateDocument = function () {
                self.config.message('creating new template');
                return $.when(
                    $.ajax({
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
                        self.messageUser('Template ' + template.TemplateName() + ' created')
                }).fail(function () {
                    self.config.message('template failed to create');
                    }).always(function () {
                        self.createTemplateDialog().isOpen(false);
                    })
                );
            };
            self.openCreateDocumentDialog = function (item: DocumentTemplate) {
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
    }
}
