(function(){
    // var $ = require('jquery');
    // var loadTouchEvents = require('jquery-touch-events');
    // loadTouchEvents($);

    var eraseSignature = $("#erase-signature")
    var canvas =  $("#canvas");
    var hiddenSig = $("#hidden");

    if(canvas.length){
        var signature = canvas[0].getContext('2d');
        signature.strokeStyle = '#111';
        doTheCanvasThing();
        if(eraseSignature.length){
            doTheEraseSignatureThing();
        }
    }



    function doTheCanvasThing(){
        var oldX;
        var oldY;

        canvas.on("hold", function(e){
            console.log("it's hold !");
            oldX = e.offsetX;
            oldY = e.offsetY
            canvas.on("swipe", function(e){
                console.log("it's swipe !!!");
                let x = e.offsetX;
                let y = e.offsetY;
                canvasSignature(x, y);
            })
        });


        canvas.on("mousedown", function(e){
            oldX = e.offsetX;
            oldY = e.offsetY
            canvas.on("mousemove", function(e){
                let x = e.offsetX;
                let y = e.offsetY;
                canvasSignature(x, y);
            })
        });




        function canvasSignature(x, y){
            signature.moveTo(oldX, oldY)
            signature.lineTo(x ,y);
            signature.stroke();
            oldX = x;
            oldY = y;

        }


        canvas.on("mouseup", function(e){
            canvas.off("mousemove");
            dataUrl = canvas[0].toDataURL();
            $("#hidden").val(dataUrl)
        })

    }

    function doTheEraseSignatureThing(){
        eraseSignature.on("click", function(e){
            console.log(signature);
            $("#hidden").val("");
            signature.clearRect(0, 0, document.getElementById("canvas").width, document.getElementById("canvas").height);
            signature.closePath();
            signature.beginPath();
        })
    }


var interval =  setInterval(callback, 500);
function callback(){
    if ($(document).scrollTop() > 10) {
        $("#menu-overlay").addClass("showmenu")

    }else{
        $("#menu-overlay").removeClass("showmenu")
    }
}

})();
