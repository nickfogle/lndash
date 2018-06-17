$(function() {

  $.get('/bitcoin/status', function(result) {
    console.log('RESULTS\n', result)
    // Object.keys(result).forEach(function (key) {
    //   $('<li></li>').text(key + ": " + result[key]).appendTo('ul#bitcoin-status');
    // });
  });

  $('#enable-bitcoin').click(function(event) {
    $.get('/bitcoin/enable', function(result) {
      location.reload(true)
    });
  })

  $('#disable-bitcoin').click(function(event) {
    $.get('/bitcoin/disable', function(result) {
      location.reload(true)
    });
  })

  $('#clean-bitcoin').click(function(event) {
    $.get('/bitcoin/clean', function(result) {
      location.reload(true)
    });
  })

});
