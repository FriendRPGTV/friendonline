/*$('#rss_form').submit(function(e) {
  var value = $('#select_channel').find(":selected").text();
  if (value === "Select Channel") {
    e.preventDefault();
    $('#messages').removeClass('is-hidden');
    $('#message-body').html('Please select the RSS Channel.');
  } else setTimeout(function() {
    window.location.reload();
  }, 1000)
});

$(".delete").click(function() {
   $("#messages").addClass("is-hidden");
});

function getSelectedChannel(element, target) {
  var value = element.options[element.selectedIndex].value;
  var elem = document.getElementById(target);
  if (value === "Select Channel") return elem.value = ''
  elem.value = value
}

function getSelectedRole(element, target) {
  var value = element.options[element.selectedIndex].value;
  var elem = document.getElementById(target);
  if (value === "Select Role") return elem.value = ''
  elem.value = value
}

function getAutoRole(element, target) {
  var value = element.options[element.selectedIndex].value;
  var elem = document.getElementById(target);
  if (value === "Select Role") value = ''
  elem.value = value
  element.form.submit()
  setTimeout(function() {
    window.location.reload();
  }, 1000)
}

function getSelectedValue(element, target) {
  var value = element.options[element.selectedIndex].value;
  var elem = document.getElementById(target);
  elem.value = value
  element.form.submit()
  setTimeout(function() {
    window.location.reload();
  }, 1000)
}

function toggle(source) {
  checkboxes = document.getElementsByClassName('log_key');
  for (var i = 0, n = checkboxes.length; i < n; i++) {
    checkboxes[i].checked = source.checked;
  }
}

function getChecked(element) {
  element.form.submit()
  setTimeout(function() {
    window.location.reload();
  }, 1000)
}

function switchCatTab(type) {
  removeActive();
  hideAllCat();
  $(`#${type}-tab`).addClass("is-active");
  $(`#${type}-content`).removeClass("is-hidden");
}

function switchTab(type) {
  removeActive();
  $("#list-content").addClass("is-hidden");
  $("#add-content").addClass("is-hidden");
  $(`#${type}-tab`).addClass("is-active");
  $(`#${type}-content`).removeClass("is-hidden");
}

function removeActive() {
  $("li").each(function() {
    $(this).removeClass("is-active");
  });
}

function hideAllCat() {
  $("#Administration-content").addClass("is-hidden");
  $("#Fun-content").addClass("is-hidden");
  $("#Image-content").addClass("is-hidden");
  $("#Info-content").addClass("is-hidden");
  $("#Moderation-content").addClass("is-hidden");
  $("#Music-content").addClass("is-hidden");
  $("#NSFW-content").addClass("is-hidden");
  $("#Social-content").addClass("is-hidden");
  $("#Utility-content").addClass("is-hidden");
}
/*