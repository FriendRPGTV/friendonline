
document.addEventListener('DOMContentLoaded', function() {
$(window).scroll(function(e) {
    if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
      document.getElementsByClassName('scrolltop')[0].style.display = 'block';
	} else {
	  document.getElementsByClassName('scrolltop')[0].style.display = 'none';
	}
});
  var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

  if ($navbarBurgers.length > 0) {

    $navbarBurgers.forEach(function($el) {
      $el.addEventListener('click', function() {

        var target = $el.dataset.target;
        var $target = document.getElementById(target);

        $el.classList.toggle('is-active');
        $target.classList.toggle('is-active');

      });
    });
  }
$('.scroll').on('click', function(e) {
e.preventDefault();
$('html, body').animate({scrollTop: $('#section').offset().top}, 600, 'linear');
});
$('.scrolltop').on('click', function(e) {
e.preventDefault();
$('html, body').animate({scrollTop: 0}, 600, 'linear');
});

});