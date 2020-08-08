$.fn.serializeObject = function()
{
  let o = {};
  let a = this.serializeArray();
  $.each(a, function() {
    if (o[this.name]) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function validatePhonenumber(phonenumber) {
  const re = /^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?\-\s?)?[0-9])((\s|\s?-\s?)?[0-9])((\s|\s?-\s?)?[0-9])\s?[0-9]\s?[0-9]\s?[0-9]\s?[0-9]\s?[0-9]$/;
  return re.test(String(phonenumber));
}

function validateForm(form) {
  let valid = true
  let data = form.serializeObject()

  // Clear original fields
  $('#naam-disclaimer').text("")
  $('#email-disclaimer').text("")
  $('#telefoonnummer-disclaimer').text("")
  $('#onderwijsinstelling-disclaimer').text("")
  $('#studie-disclaimer').text("")
  $('#toestemming-disclaimer').text("")


  if(data.naam === "") {
    $('#naam-disclaimer').text("Geen naam ingevuld")
    valid = false
  }

  if(data.email === "" || !validateEmail(data.email)) {
    $('#email-disclaimer').text("Geen of een incorrect emailadres ingevuld")
    valid = false
  }

  if(data.telefoonnummer === "" || !validatePhonenumber(data.telefoonnummer)) {
    $('#telefoonnummer-disclaimer').text("Geen of incorrect telefoonnummer")
    valid = false
  }

  if(data.onderwijsinstelling === "") {
    $('#onderwijsinstelling-disclaimer').text("Geen onderwijsinstelling aangegeven")
    valid = false
  }

  if(data.studie === "") {
    $('#studie-disclaimer').text("Geen studie aangegeven")
    valid = false
  }

  if(data.toestemming !== 'on') {
    $('#toestemming-disclaimer').text("Geen toestemming gegeven")
    valid = false
  }

  return valid
}

function closeCookieModal() {
  $(".cookie-modal-container").hide()

  var filterVal = 'blur(0px)';
  $('.masthead')
    .css('filter',filterVal)
    .css('webkitFilter',filterVal)
    .css('mozFilter',filterVal)
    .css('oFilter',filterVal)
    .css('msFilter',filterVal);

}


(function($) {
  "use strict"; // Start of use strict
   let toestemmingChecked = false

  $('.algemene-voorwaarden-button').on('click', function(e) {
      $('#exampleModal').modal('show')
  })

  // Get data from json file
  let data = {};
  $.getJSON('../data/universities.json', function(json) {
    data = json
    let universities = [...new Set(data.map(data => data.onderwijsinstelling))]

    // Populate options lists
    for (var i = 0; i <= universities.length; i++) {
      $('#university-list').append('<option value="' + universities[i] + '">' + universities[i] + '</option>');
    }
  });


  let universityChoice = "";
  let studyChoice = "";
  let verified = false;
  $('#university-input').on('input', function (e) {
    universityChoice = e.target.value;
    verified = false
    $('#studie-input').prop('disabled', false)
    $('#study-list').empty()
    for (let i = 0; i <= data.length; i++) {
      if(universityChoice === data[i].onderwijsinstelling) {
        $('#study-list').append('<option value="' + data[i].studie + '">' + data[i].studie + '</option>');
      }
    }
  })

  $('#studie-input').on('input', function (e) {
    studyChoice = e.target.value;
    verified = false
    $('#studie-type').prop('disabled', false)
    for (let i = 0; i <= data.length; i++) {
      if(universityChoice === data[i].onderwijsinstelling && studyChoice === data[i].studie) {
        verified = true
        $('#studie-type').val(data[i].type.toLowerCase())
      }
    }
  })


  // Cookie accept or deny
  $("#deny-cookies").on('click', function(e) {
    closeCookieModal()
  })

  $("#accept-cookies").on('click', function(e) {

      // Add Google TM scripts
      $("head").append("  <script>(function (w, d, s, l, i) {\n" +
        "    w[l] = w[l] || [];\n" +
        "    w[l].push({\n" +
        "      'gtm.start':\n" +
        "        new Date().getTime(), event: 'gtm.js'\n" +
        "    });\n" +
        "    var f = d.getElementsByTagName(s)[0],\n" +
        "      j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';\n" +
        "    j.async = true;\n" +
        "    j.src =\n" +
        "      'https://www.googletagmanager.com/gtm.js?id=' + i + dl;\n" +
        "    f.parentNode.insertBefore(j, f);\n" +
        "  })(window, document, 'script', 'dataLayer', 'GTM-MKNM8MW');</script>")

      $("body").append("<noscript>\n" +
        "  <iframe src=\"https://www.googletagmanager.com/ns.html?id=GTM-MKNM8MW\"\n" +
        "          height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\"></iframe>\n" +
        "</noscript>")

      closeCookieModal()
  })


  let $form = $('#inschrijf-formulier'),
    url = 'https://script.google.com/macros/s/AKfycbzrx-tp1IULPbQTutAUjf0yRmJHw2iwuGcDsvEjxBSIj4NZ7WY/exec'

  $('#submit-form').on('click', function(e) {
    e.preventDefault();

    if(validateForm($form)) {
      let jqxhr = $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        data: {...$form.serializeObject(), verified: verified}
      }).success(
        $('#inschrijf-formulier').fadeOut(100, function () {
          $('.subscribed-msg').css('display', 'flex');
          $('.subscribed-msg').css('opacity', '1');

        })

      );
    }
  })

  // No JS

})(jQuery); // End of use strict
