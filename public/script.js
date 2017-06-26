(function(){
    // var $ = require('jquery');
    // var loadTouchEvents = require('jquery-touch-events');
    // loadTouchEvents($);

    var eraseSignature = $("#erase-signature")
    var canvas =  $("#canvas");
    var hiddenSig = $("#hidden");
    var hamburger = $("#hamburger")
    //
    //     //determine which events to use
    var startEventType = 'mousedown',
    endEventType   = 'mouseup';
    moveEventType = 'mousemove'

    // if (Modernizr.touch === true) {
    //     console.log("here");
    //     startEventType = 'touchstart';
    //     endEventType   = 'touchend';
    //     moveEventType = 'touchmove'
    //     }


    if(canvas.length){
        var signature = canvas[0].getContext('2d');
        signature.strokeStyle = '#111';
        doTheCanvasThing();
        doTheCanvasThingOnMobile();
        if(eraseSignature.length){
            doTheEraseSignatureThing();
        }
    }

    if (hamburger.length) {
        doTheHamburgerThing()
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


        canvas.on(startEventType, function(e){
            oldX = e.offsetX;
            oldY = e.offsetY
            canvas.on(moveEventType, function(e){
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

        canvas.on(endEventType, function(e){
            canvas.off(moveEventType);
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

    // Set up touch events for mobile, etc
    function doTheCanvasThingOnMobile(){
        var touchCanvas = document.getElementById("canvas")
        var positionTop;
        touchCanvas.addEventListener("touchstart", function (e) {
            positionTop = document.body.scrollTop;
            e.preventDefault();
            mousePos = getTouchPos(touchCanvas, e);
            var touch = e.touches[0];
            var mouseEvent = new MouseEvent("mousedown", {
                clientX: touch.clientX,
                clientY: touch.clientY + positionTop
            });
            touchCanvas.dispatchEvent(mouseEvent);
        }, false);
        touchCanvas.addEventListener("touchend", function (e) {
            var mouseEvent = new MouseEvent("mouseup", {});
            touchCanvas.dispatchEvent(mouseEvent);
        }, false);
        touchCanvas.addEventListener("touchmove", function (e) {
            e.preventDefault();
            var touch = e.touches[0];
            console.log(touch);
            var mouseEvent = new MouseEvent("mousemove", {
                clientX: touch.clientX,
                clientY: touch.clientY + positionTop
            });
            touchCanvas.dispatchEvent(mouseEvent);
        }, false);

        // Get the position of a touch relative to the canvas
        function getTouchPos(canvasDom, touchEvent) {
            console.log(canvasDom);
            console.log("here");
            var rect = canvasDom.getBoundingClientRect();
            return {
                x: touchEvent.touches[0].clientX - rect.left,
                y: touchEvent.touches[0].clientY - rect.top - positionTop
            };
        }
    }


    function doTheHamburgerThing(){
        $(hamburger).on("click", function(e){
            console.log($("#menu-container"));
            var menuContainer = $("#menu-container")
            var hamburgerContainer = $("#hamburger-container")
            menuContainer.addClass("show");
            $("#hamburger-container").addClass("hide");
        })
        $("#cross").on("click", function(e){
            console.log("here?");
            var menuContainer = $("#menu-container")
            menuContainer.removeClass("show");
            $("#hamburger-container").removeClass("hide");
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
