/**
 * Created by Alex on 07/11/2015.
 */

Polymer({
    is: 'test-page',
    behaviors: [
        Polymer.NeonAnimatableBehavior
    ],

    listeners: {
        'click': '_onClick'
    },

    _onClick: function () {
        var target = event.target;
        console.log(target);

        this.animationConfig = [{
            name: 'slide-up-animation',
            node: this.$('#searchButton')
        }];
    }
});