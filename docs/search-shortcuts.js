(function () {
  document.addEventListener('keydown', function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      var input = document.querySelector('.search-input');
      if (input) { event.preventDefault(); input.focus(); input.select(); }
    }
  });
})();

