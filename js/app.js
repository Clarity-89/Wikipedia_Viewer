/**
 * Created by Alex on 07/11/2015.
 */

var app = {};

app.Result = Backbone.Model.extend({});

app.Results = Backbone.PageableCollection.extend({
    model: app.Result,

    mode: "client",

    //Override default sync method to allow jsonp data
    sync: function (method, model, options) {
        options.timeout = 10000;
        options.dataType = "jsonp";
        return Backbone.sync(method, model, options);
    },

    // Override default pagination states
    state: {
        pageSize: 7 //Show 7 results per page
    },

    data: {
        "appId": "13957b27",
        "appKey": "634647fd3fadbe686dbaacdbea287beb",
        "fields": "item_name,nf_calories,nf_serving_weight_grams,nf_serving_size_unit,nf_serving_size_qty",
        results: '0:50'
    },

    //Create a url for AJAX request with a dynamic query from the search form
    url: function () {
        return "https://en.wikipedia.org/w/api.php?action=query&titles=India&prop=revisions&rvprop=content&format=json"; //+ this.query + '?' + $.param(this.data);
    },

    parse: function (res) {
        console.log('result', res)
        return res;
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

    search: function (event) {
        event.preventDefault();
        console.log('search clicked');
        app.results.fetch();
    }


});


$(function () {

    new app.ResultsView();

});

