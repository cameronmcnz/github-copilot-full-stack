package com.example.calculator;

import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.QueryValue;

import java.util.Map;

@Controller
public class CalculatorController {

    @Get("/sum{?augend,addend}")
    public Double sum(@QueryValue Double augend, @QueryValue Double addend) {
        System.out.println("[calculator-micronaut] /sum called with augend=" + augend + ", addend=" + addend);
        return augend + addend;
    }

    @Get("/difference{?minuend,subtrahend}")
    public Double difference(@QueryValue Double minuend, @QueryValue Double subtrahend) {
        System.out.println("[calculator-micronaut] /difference called with minuend=" + minuend + ", subtrahend=" + subtrahend);
        return minuend - subtrahend;
    }

    @Get("/product{?multiplicand,multiplier}")
    public Double product(@QueryValue Double multiplicand, @QueryValue Double multiplier) {
        System.out.println("[calculator-micronaut] /product called with multiplicand=" + multiplicand + ", multiplier=" + multiplier);
        return multiplicand * multiplier;
    }

    @Get("/quotient{?dividend,divisor}")
    public HttpResponse<?> quotient(@QueryValue Double dividend, @QueryValue Double divisor) {
        System.out.println("[calculator-micronaut] /quotient called with dividend=" + dividend + ", divisor=" + divisor);
        if (divisor == 0) {
            return HttpResponse.unprocessableEntity()
                .body(Map.of("code", "invalid_calculation", "message", "Divisor must not be zero."));
        }
        return HttpResponse.ok(dividend / divisor);
    }

    @Get("/remainder{?dividend,divisor}")
    public HttpResponse<?> remainder(@QueryValue Double dividend, @QueryValue Double divisor) {
        System.out.println("[calculator-micronaut] /remainder called with dividend=" + dividend + ", divisor=" + divisor);
        if (divisor == 0) {
            return HttpResponse.unprocessableEntity()
                .body(Map.of("code", "invalid_calculation", "message", "Divisor must not be zero."));
        }
        return HttpResponse.ok(dividend % divisor);
    }
}
