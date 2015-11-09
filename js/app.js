/**
 * Created by Alex on 07/11/2015.
 */

var app = {};

app.Result = Backbone.Model.extend({

    parse: function (res) {
        if (res) {

            return {
                title: res.title.replace(/<\/?[^>]+>/gi, ''),
                snippet: res.snippet
            };
        }
    }
});

app.Results = Backbone.PageableCollection.extend({
    model: app.Result,

    mode: "client",

    //Override default sync method to allow jsonp data
    sync: function (method, model, options) {
        //options.timeout = 10000;
        options.dataType = "jsonp";
        return Backbone.sync(method, model, options);
    },

    // Override default pagination states
    state: {
        pageSize: 7 //Show 7 results per page
    },

    data: {
        "list": "search",
        "format": "json",
        "srsearch": null,
        "srwhat": "text",
        "srinfo": "totalhits",
        "srprop": "snippet",
        "srlimit": "50"
    },

    //Create a url for AJAX request with a dynamic query from the search form
    url: function () {
        return "https://en.wikipedia.org/w/api.php?action=query&" + $.param(this.data);
    },

    parse: function (res) {
        console.log('result', res.query.search);
        return res.query.search;
    }

});

app.results = new app.Results();

var paginator = new Backgrid.Extension.Paginator({
    collection: app.results
});

app.ResultsView = Backbone.View.extend({
    collection: app.results,

    el: 'body',
    template: Handlebars.compile($('#searchResults').html()),

    events: {
        'click #searchButton': 'search',
        'keypress #search': 'searchOnEnter'
    },

    initialize: function () {
        console.log('initialized');

        this.$input = this.$('#search');
        this.$hits = this.$('#hits');
        this.listenTo(this.collection, 'all', this.render);
    },

    render: function () {
        this.$hits.html(this.template(this.collection.toJSON()));
        if (this.collection.length > 0) {
            $("#paginator").append(paginator.render().$el);
        }
        return this;
    },

    search: function (event) {
        if (this.$input.val()) {
            event.preventDefault();
            console.log('search clicked');
            app.results.data.srsearch = this.$input.val().trim();
            app.results.fetch();
            $.()
        }
    }
});


$(function () {

    new app.ResultsView();

});

