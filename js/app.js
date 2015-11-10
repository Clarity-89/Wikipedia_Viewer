/**
 * Created by Alex on 07/11/2015.
 */

var app = {};

app.Result = Backbone.Model.extend({

    parse: function (res) {
        if (res) {

            return {
                title: res.title,
                snippet: res.extract,
                url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(res.title)
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
        "generator": "search",
        "format": "json",
        "gsrsearch": null,
        "gsrnamespace": "0",
        "gsrlimit": "20",
        "prop": "extracts",
        "exsentences": "2",
        "exlimit": "max"
    },

    //Create a url for AJAX request with a dynamic query from the search form
    url: function () {
        //console.log('q', "https://en.wikipedia.org/w/api.php?action=query&" + $.param(this.data));
        return 'https://en.wikipedia.org/w/api.php?action=query&&exintro&explaintext&' + $.param(this.data);
        // "https://en.wikipedia.org/w/api.php?action=query&" + $.param(this.data);
    },

    parse: function (res) {
        var obj = res.query.pages;
        var parsed = [];
        for (var prop in obj) {
            parsed.push({title: obj[prop].title, extract: obj[prop].extract});
        }
        console.log(parsed);
        return parsed;

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
        this.$searchForm = $("#searchForm");
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
            app.results.data.gsrsearch = this.$input.val().trim();
            TweenLite.to($('#wrapper'), 0.7, {
                height: '50px',
                //make sure results are displayed after the transition ended
                onComplete: function () {
                    app.results.fetch();
                }
            });
        }
    }
});

$(function () {

    new app.ResultsView();

});

