package net.example;

import org.apache.camel.builder.RouteBuilder;

public class PaymentProcessor extends RouteBuilder {
    @Override
    public void configure() throws Exception {
        rest("/api/pay")
            .get()
            .produces("text/plain")
            .route()
            .to("braintree://clientToken/generate")
            .endRest();
    }
}
