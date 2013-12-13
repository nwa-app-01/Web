/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../typings/knockout/knockout.amd.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />


module Generate {

    export class VM {
        private config: VMConfig;
        public autoSelect: () => void;
        public rows: KnockoutObservableArray<any>;
        public selectedRows: KnockoutObservableArray<any>;
        public initialize: () => void;
        public generate: (item: any) => void;
        public load: () => void;
        constructor(config: VMConfig) {
            var self = this;
            self.config = config;
            self.rows = ko.observableArray<any>();
            
            self.selectedRows = ko.observableArray<any>();
            self.initialize = function () {
                var dfd = $.Deferred();
                return dfd.resolve();
            };
            self.load = function () {
                return $.ajax({
                    url: config.baseApiUrl + '/Document',
                    contentType: 'application/json; charset=utf-8'
                }).done(function (data) {
                    ko.mapping.fromJS(data, {}, self.rows);
                    self.autoSelect();
                    self.config.message('documents has loaded');
                }).fail(function () {
                    self.config.message('documents failed to load');
                });
            };

            self.generate = function (index) {
                var item = self.rows()[index];
                var groups = $.map(self.selectedRows(), function (e) {
                    return e.GroupId();
                });
                if (item) {
                    return $.ajax({
                        url: self.config.baseUrl + '/Generate',
                        contentType: 'application/json; charset=utf-8',
                        type: 'POST',
                        dataType: 'json',
                        data: ko.toJSON({ documentId: item.Id(), groupId: groups })
                    }).done(function (data) {
                        User.message('Generation completed [' + item.Id() + ']');
                    }).fail(function () {
                        self.config.message('Generation failed');
                    });                    
                }
            };
            self.autoSelect = function () {
                var genmed = ko.utils.arrayFilter(self.rows(), (r) => r.Name().toLocaleLowerCase() == "genmed");
                if (genmed) {
                    ko.utils.arrayForEach(genmed, (r) => {
                        r["__kg_selected__"] = true;
                        self.selectedRows.push(r);
                    });
                }
                var contract = ko.utils.arrayFilter(self.rows(), (r) => r.Name().toLocaleLowerCase() == "contract");
                if (contract) {
                    ko.utils.arrayForEach(contract, (r) => {
                        r["__kg_selected__"] = true;
                        self.selectedRows.push(r);
                    });
                }

                var customer = ko.utils.arrayFilter(self.rows(), (r) => r.Name().toLocaleLowerCase() == "customer");
                if (customer) {
                    ko.utils.arrayForEach(customer, (r) => {
                        r["__kg_selected__"] = true;
                        self.selectedRows.push(r);
                    });
                }
            }
        }


    }


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
        public baseApiUrl: string;
        public message: (s: string) => void;
        public messageClear: () => void;
        constructor(options: any) {
            this.baseUrl = '';
            this.baseApiUrl = '';
            this.message = function (m) { };
            this.messageClear = function () { };
            $.extend(this, options);
        }
    }
}
