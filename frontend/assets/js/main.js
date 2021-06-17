$(function () {
    // input form counter 
    $(document).on('click', '.increment-btn', function (e) {
        e.preventDefault();
        var num = $('#nOTasks').val();
        ++num;
        $('#nOTasks').val(num)

    });
    $(document).on('click', '.decrement-btn', function (e) {
        e.preventDefault();

        if ($('#nOTasks').val() > 0) {
            var num = $('#nOTasks').val();
            --num;
            $('#nOTasks').val(num)
        }
    });

    // ******************* profile page selected cards count 
    $('.icon-btn').click(function(e) {
        e.stopPropagation()
    })

    //check account card
    $(document).on('click', '.account-card', function() {
        $(this).find('.checked-card').toggleClass('opc-1');
        var selectedCards = $('.opc-1').length
        $('.selected-number').text(selectedCards);

    })
    // ****************  profile page Edit pop up ********* 
    $(document).on('dblclick', '.account-card', function() {
         $('#editModal').modal('show');
         $('#editModal').show();
    })
    // swap between modal form 

    $(document).on('click', '.swap-im > span', function() {
            $(this).addClass('active').siblings().removeClass('active');
            selectedForm = $(this).attr('id')
            $('.' + selectedForm).addClass('active').siblings().removeClass('active');
    });

    $(document).on('click', '.next-form', function () {
        console.log('next form')
        var nextItem = $('.swap-im span.active').nextAll().length
        if (nextItem >= 1) {
            $('.swap-im span.active').removeClass('active').next().addClass('active')
            $('.main-dia-box.active').removeClass('active').next().addClass('active')
            $(this).removeClass('disabled-color');
            $('.prev-form').removeClass('disabled-color');
        } else {
            $(this).addClass('disabled-color');
        }
    })


    $(document).on('click', '.prev-form', function () {
        console.log('prev form')
        var nextItem = $('.swap-im span.active').prevAll().length;
        if (nextItem >= 1) {
            $('.swap-im span.active').removeClass('active').prev().addClass('active')
            $('.main-dia-box.active').removeClass('active').prev().addClass('active')
            $(this).removeClass('disabled-color');
            $('.next-form').removeClass('disabled-color');
        } else {
            $(this).addClass('disabled-color');
        }
    })

    $(document).on('click', '.submit', function (e) {
        e.preventDefault()
    })
    // Change Color of Good & Bad status in table
    $('.health').each(
        function () {
            if ($.trim($(this).text()).toLowerCase() == 'good') {
                $(this).siblings('i').addClass('green').removeClass('orange  lite-red')
            }
            if ($.trim($(this).text()).toLowerCase() == 'bad') {
                $(this).siblings('i').addClass('lite-red').removeClass('orange  green ')
            }
        }
    )
    $('.status').each(
        function () {
            if ($.trim($(this).text()).toLowerCase() == 'taking a break') {
                $(this).addClass('lite-red').removeClass('orange green default')
            }
            if ($.trim($(this).text()).toLowerCase() == 'idling') {
                $(this).addClass('orange').removeClass('default  green lite-red')
            }
            if ($.trim($(this).text()).toLowerCase() == 'waiting') {
                $(this).addClass(' default').removeClass('orange green lite-red')
            }
            if ($.trim($(this).text()).toLowerCase() == 'farming') {
                $(this).addClass('green').removeClass('orange  lite-red default')
            }
        }
    )



    // show password 
    $(document).on('click', '.eye-btn', function (e) {
        e.preventDefault();
        if ($(this).find('i').hasClass('fa-eye')) {
            $(this).find('i').addClass('fa-eye-slash').removeClass('fa-eye')
            $('.pass-input').attr('type', 'text');
        } else {
            $(this).find('i').addClass('fa-eye').removeClass('fa-eye-slash')
            $('.pass-input').attr('type', 'password');
        }
    })
    $(".question").click(function (event) {
        event.preventDefault();
    });
});