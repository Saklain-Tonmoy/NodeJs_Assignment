$(document).onload(function () {
    $('[name="graduate"]').change(function () {
        if ($('[name="graduate"]:checked').is(":checked")) {
            $('.celcius').hide();
            $('.fahrenheit').show();
        } else {
            $('.celcius').show();
            $('.fahrenheit').hide();
        }
    });
});