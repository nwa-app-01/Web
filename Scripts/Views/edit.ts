/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />


// Module
module DataDocument {
    export class User {
        static messages = ko.observableArray<string>();
        static message(s: string, clear?: boolean) {
            if (typeof clear === 'undefined') {
                clear = true;
            }
            if (clear || clear == true) {
                User.clear();
            };
            this.messages.push(moment().format('DD-MMM-YYYY HH:MM:SS') + ' ' + s);
        }
        static errorMessage(jqXHR: JQueryXHR, clear?: boolean) {
            if (typeof clear === 'undefined') {
                clear = true;
            }
            if (jqXHR) {
                if (jqXHR.responseText)
                {
                    if (jqXHR.responseText)
                    {
                        var e = jQuery.parseJSON(jqXHR.responseText);
                        if (clear || clear == true) {
                            User.clear();
                        };
                        this.messages.push(moment().format('DD-MMM-YYYY HH:MM:SS') + ' ' + e.Message);
                    }
                }
            }
        }
        static clear() {
            this.messages.removeAll();
        }
    }

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
    

    export class TemplateDataDocument {
        private config: VMConfig;
        public Id: KnockoutObservable<number>;
        public Name: KnockoutObservable<string>;
        public RV: KnockoutObservable<string>;

        public dataSets: KnockoutObservableArray<TemplateDataSet>;
        public editTemplateDataSet: KnockoutObservable<TemplateDataSet>;

        public load: (id: number) => void;
        public addDataSet: (group: any, name: string) => void;
        public updateDataSet: (TemplateDataSet: any) => void;
        public selectTemplateDataSet: (item: TemplateDataSet) => void;

        constructor(config: VMConfig) {
            var self = this;
            self.Id = ko.observable<number>(0);
            self.Name = ko.observable<string>('');
            self.RV = ko.observable<string>('');
            self.config = config;
            self.dataSets = ko.observableArray<TemplateDataSet>();
            self.editTemplateDataSet = ko.observable<TemplateDataSet>(new TemplateDataSet(config, 0));
            self.load = function (id: number) {
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
            self.selectTemplateDataSet = function (item: TemplateDataSet) {
                self.editTemplateDataSet(item);
            };

            self.updateDataSet = function (dataSet: TemplateDataSet) {
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
                        })
                }
            };
            self.addDataSet = function (group: any) {
                var name = $('#addDataSetName').val();
                if(name){
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
                    })
                }
            };
        }
    }

    export class TemplateField {
        public Id: KnockoutObservable<number>;
        public GroupId: KnockoutObservable<number>;
        public Name: KnockoutObservable<string>;
        public Description: KnockoutObservable<string>;
        public Value: KnockoutObservable<string>;
        public RV: KnockoutObservable<string>;
        public SortOrder: KnockoutObservable<string>;
        public isOpenAddTemplateFieldDialog: KnockoutObservable<boolean>;
        constructor() {
            ko.mapping.fromJS({ Id: 0, GroupId: 0, Name: '', Description: '', RV: '', SortOrder: '', isOpenAddTemplateFieldDialog: false }, {}, this);
        }
    }
    export class TemplateDataSet {
        private config: VMConfig;
        private documentId: KnockoutObservable<number>;
        public Id: KnockoutObservable<number>;
        public Name: KnockoutObservable<string>;
        public RV: KnockoutObservable<string>;
        public items: KnockoutObservableArray<TemplateDataItem>;
        public load: () => void;
        public addTemplateField: (item: any) => void;
        public updateTemplateFieldName: (TemplateField: any) => void;
        public editTemplateField: KnockoutObservable<TemplateField>;
        public isOpenAddTemplateFieldDialog: KnockoutObservable<boolean>;
        public openAddTemplateFieldDialog: (item: boolean) => void;
        constructor(config: VMConfig, documentId: number) {
            var self = this;
            self.config = config;
            self.documentId = ko.observable<number>(documentId);
            self.isOpenAddTemplateFieldDialog = ko.observable<any>(false);
            self.editTemplateField = ko.observable<TemplateField>(new TemplateField());
            self.items = ko.observableArray<TemplateDataItem>();
            self.openAddTemplateFieldDialog = function (item: boolean) {
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
    }
    export class TemplateDataItem {
        public Id: KnockoutObservable<number>;
        public Name: KnockoutObservable<string>;
        public Description: KnockoutObservable<string>;
        public Value: KnockoutObservable<string>;
        public RV: KnockoutObservable<string>; 
        public SortOrder: KnockoutObservable<string>;
    }
    export class VM {
        private config: VMConfig;
        public dataDocument: KnockoutObservable<TemplateDataDocument>;
        public groups: KnockoutObservableArray<any>;
        public initialize: () => void;
        public load: (id: number) => void;
        public selectTemplateDataItem: (item: TemplateDataItem) => void;
        public updateTemplateDataItem: (update: TemplateDataItem) => void;
        
        public editableTemplateDataItem: KnockoutObservable<TemplateDataItem>;
        constructor(config: VMConfig) {
            var self = this;
            self.config = config;
            self.groups = ko.observableArray<any>();
            self.dataDocument = ko.observable<TemplateDataDocument>(); //null;//new TemplateDataDocument(config);
            self.editableTemplateDataItem = ko.observable<TemplateDataItem>();
            self.initialize = function () {
                return $.when(
                    $.ajax({
                        url: config.baseUrl + '/DocumentDataFieldGroup',
                        contentType: 'application/json; charset=utf-8'
                    }).done(function (data) {
                        ko.mapping.fromJS(data, {}, self.groups);
                        self.config.message('groups have loaded');
                    }).fail(function () {
                        self.config.message('groups failed to load');
                    })
                );
            };
            self.load = function (id: number) {
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
            self.selectTemplateDataItem = function (item: TemplateDataItem) {
                self.editableTemplateDataItem(item);
            };
            self.updateTemplateDataItem = function (update: TemplateDataItem) {
                self.config.message('item is updating');
                return $.ajax({
                    url: config.baseUrl + '/DocumentData/' + update.Id() +'/Update',
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
    }
}

