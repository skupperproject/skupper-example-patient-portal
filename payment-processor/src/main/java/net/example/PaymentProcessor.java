package net.example;

import org.apache.camel.builder.RouteBuilder;

public class PaymentProcessor extends RouteBuilder {
    @Override
    public void configure() throws Exception {
        rest("/api/")
            .produces("text/plain")
            .get("pay")
            .route()
            .to("braintree://clientToken/generate")
            .endRest();
    }
}
