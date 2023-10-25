package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class STOMPMessagesHandler {

    private Map<String, ArrayList<Point>> conex = new ConcurrentHashMap<>();

    @Autowired
    SimpMessagingTemplate msgt;

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:"+pt);
        msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
        if (conex.get(numdibujo) != null){
            conex.get(numdibujo).add(pt);
            if (conex.get(numdibujo).size() % 4 == 0){
                msgt.convertAndSend("/topic/newpolygon." + numdibujo, conex.get(numdibujo));
            }
        } else {
            ArrayList<Point> n = new ArrayList<>();
            n.add(pt);
            conex.put(numdibujo, n);
        }
    }
}