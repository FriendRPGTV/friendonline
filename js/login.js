
(function ($) {
    "use strict";


    /*==================================================================
    [ Focus input ]*/
    $('.inputline').each(function(){
        $(this).on('blur', function(){
            if($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        })    
    })
  
  
    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .inputline');

    $('.validate-form').on('submit',function(){
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }

        return check;
    });


    $('.validate-form .inputline').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    

})(jQuery);
/*
function chk_form(){
    var j_keep_login=document.validate-form.keep_login;
    var i_username=document.validate-form.username.value;
    var i_password=document.validate-form.password.value;
    if(j_keep_login.checked==true){
        var days=10; // กำหนดจำนวนวันที่ต้องการให้จำค่า
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
        document.cookie = "CK_username=" +i_username+ "; expires=" + expires + "; path=/";
        document.cookie = "CK_password=" +i_password+ "; expires=" + expires + "; path=/";
    }else{
        var expires="";
        document.cookie = "CK_username="+expires+";-1;path=/";
        document.cookie = "CK_password="+expires+";-1;path=/";      
    }
}
*/