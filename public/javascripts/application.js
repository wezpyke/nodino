/**
 * @jsx React.DOM
 */

var Shortener = React.createClass({displayName: 'Shortener',
  getInitialState: function() {
    return {data: {url: null, id: null, host: null}};
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var url = this.refs.url.getDOMNode().value.trim();

    $.ajax({
      type: 'POST',
      data: {url: url},

      success: function(data) {
        if (!data.error) {
          var that = this;

          $(that.getDOMNode()).flip({
            speed: 250,
            dontChangeColor: true,

            onBefore: function() {
              that.setState({data: data.data});
              var url = that.state.data.host + '/' + that.state.data.id;
              that.refs.url.getDOMNode().value = url;
            },
            onEnd: function() {
              $(that.refs.url.getDOMNode()).focus();
              $(that.refs.url.getDOMNode()).select();
            }
          });
        } else {
          $(this.refs.notification.getDOMNode()).text(data.error);
        }
      }.bind(this)
    });
  },

  handleRevert: function(e) {
    e.preventDefault();
    var that = this;

    $(this.getDOMNode()).flip({
      speed: 250,
      dontChangeColor: true,
      onBefore: function() {
        that.setState(that.getInitialState());
        that.refs.url.getDOMNode().value = '';
      }
    });
  },

  render: function() {
    if(this.state.data && this.state.data.id) {
      return (
        React.DOM.form( {action:"/", method:"POST", className:"shortener shortened", onSubmit:this.handleRevert}, 
          React.DOM.input( {ref:"url", className:"shortener__url--output", type:"text", disabled:true} ),
          React.DOM.input( {type:"submit", className:"shortener__button--revert", value:"New"}),
          React.DOM.span( {ref:"notification", className:"shortener__notification"}, "Hit Ctrl/Cmd-C to copy to clipboard.")
        )
      );
    } else {
      return (
        React.DOM.form( {action:"/", method:"POST", className:"shortener", onSubmit:this.handleSubmit}, 
          React.DOM.input( {type:"text", ref:"url", name:"url", placeholder:"Enter a URL to shorten...", className:"shortener__url--input"}),
          React.DOM.input( {type:"submit", className:"shortener__button--submit", value:"Go!"}),
          React.DOM.span( {ref:"notification", className:"shortener__notification error"})
        )
      );
    }

  }
});

React.renderComponent(
  Shortener(null ),
  document.getElementById('app')
);
