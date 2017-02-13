$(function () {
    console.log('init');
    $('input[type=radio]').change(function () {
        var value = $(this).val();
        console.log(value);


        $.post(
            '/object/updateRating.php',
            { value: cur, objectid: objectid },
            function (data) {
                if (data) {
                    // Если данные добавились в БД возвращаем общий рейтинг
                    $(".object .param.rating .value").html(data);
                    // Убираем из виду звезды рейтинга
                    $(".object_params").remove();
                    // Выдаем сообщение пользователю
                    $("#alert p").html('Ваш голос учтён, спасибо за голосование.');
                    $("#alert")
                        .dialog('option', 'title', 'Голос учтён')
                        .dialog('open');
                }
            }
        );


    });
});
