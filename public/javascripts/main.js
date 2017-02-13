$(function () {
    console.log('init');
    $('input[type=radio]').change(function () {
        var value = $(this).val();
        var elemId = parseInt($(this).parent().attr('id')); 

        console.log(value);
        console.log(parseInt($(this).parent().attr('id')));


        $.post(
            '/table/voting',
            { evaluation: value, id: elemId },
            function (data) {
                if (data) {
                    console.log(data);
                }
            }
        );


    });
});
