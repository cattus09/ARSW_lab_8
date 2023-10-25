var app = (function () {

    var topic = "0";

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }

    class Polygon{
        constructor(points){
            this.points = points;
        }
    }
    
    var stompClient = null;
    var canvas

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function (topic) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/'+topic, function (eventbody) {
                // para manejar eventos recibidos desde el servidor
                var newPoint = JSON.parse(eventbody.body);
                var x = newPoint.x;
                var y = newPoint.y;
                //alert('Nuevo punto recibido - X: ' + x + ', Y: ' + y);
                var newPoint = new Point(x, y);
                if(topic.includes("newpoint")){
                    addPointToCanvas(pt);
                } else {
                    var polygon = new Polygon(pt);
                    drawNewPolygon(polygon);
                }

                
            });
        });

    };
    
    var drawNewPolygon = function(polygon){
        var ctx = canvas.getContext('2d');
        var canvas = document.getElementById('canvas');
        ctx.beginPath();;
        ctx.fillStyle = '#8A2BE2';
        console.log("Longitud" +  polygon.points.length);
        for(var i = 1; i <=  4; i++){
            if (i == 1 )ctx.moveTo(polygon.points[polygon.points.length - i].x, polygon.points[polygon.points.length - i].y);
            ctx.lineTo(polygon.points[polygon.points.length - i].x, polygon.points[polygon.points.length - i].y);
        }
        ctx.closePath();
        ctx.fill();
    }

    return {
        // evento de clic en el canvas para agregar puntos y 
        //establecer la conexión WebSocket para recibir puntos de otros usuarios
        init: function () {
            canvas = document.getElementById("canvas");
            canvas.addEventListener("click", function (event) {
                var mousePosition = getMousePosition(event);
                app.publishPoint(mousePosition.x, mousePosition.y);
            });
            connectAndSubscribe();
        },

        connect: function (){
            var canvas = document.getElementById("canvas");
            var option = document.getElementById("connectionType");
            var drawId = $("#drawId").val();
            topic = option.value+drawId;
            alert("Se a conectado a: "+ drawId);
            connectAndSubscribe(topic);
            if(window.PointerEvent){
                canvas.addEventListener("pointerdown", function (event){
                    var point = getMousePosition(event);
                    //addPointToCanvas(point);
                    stompClient.send("/topic"+topic, {}, JSON.stringify(point));
                });
            }
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            // console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            stompClient.send("/topic/"+topic, {}, JSON.stringify(pt));
            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }


        
    };

})();