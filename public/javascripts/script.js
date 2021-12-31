$(document).ready(function () {
$('[name="graduate"]').change(function () {
if ($('[name="graduate"]:checked').is(":checked")) {
$('.celcius').addClass('d-none');
$('.fahrenheit').removeClass('d-none');
} else {
$('.celcius').removeClass('d-none');
$('.fahrenheit').addClass('d-none');
}
});
});