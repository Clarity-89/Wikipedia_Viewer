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
        options.dataType = "jsonp";
        return Backbone.sync(method, model, options);
    },

    // Override default pagination states
    state: {
        pageSize: 6 //Show 6 results per page
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

        return 'https://en.wikipedia.org/w/api.php?action=query&&exintro&explaintext&' + $.param(this.data);
    },

    parse: function (res) {

        if (res.query) {
            var obj = res.query.pages;
            var parsed = [];
            for (var prop in obj) {
                parsed.push({title: obj[prop].title, extract: obj[prop].extract});
            }
            return parsed;
        }
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
        this.$spinner = $("#spinner");
        this.listenTo(this.collection, 'reset', this.render);
    },

    render: function () {
        this.$hits.hide();
        this.$spinner.show();

        if (this.collection.models[0].get('title')) {
            this.$hits.html(this.template(this.collection.toJSON()));
            $("#paginator").append(paginator.render().$el);
            this.$spinner.hide();
            this.$hits.show();
        } else {
            this.$spinner.hide();
            $('#no-results').css('display', 'block');
        }
        TweenLite.fromTo(this.$hits, 1, {opacity: '0'}, {opacity: '1'});

        return this;
    },

    search: function (event) {
        if (this.$input.val()) {
            event.preventDefault();
            app.results.data.gsrsearch = this.$input.val().trim();
            $('#spinner').css('display', 'block');
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

