package net.example;

import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;

public class PaymentProcessor extends RouteBuilder {
    @Override
    public void configure() throws Exception {
        rest("/api/pay")
            .get()
            .produces("text/plain")
            .route()
            // .process(SomeProcessor.class)
            .to("braintree://clientToken/generate")
            .endRest();
    }
}

class SomeProcessor implements Processor {
    public void process(Exchange exchange) {
        System.out.println("XXXXXXXXXXXXXXXXXXXxxxx!");
    }
}
