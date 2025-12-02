package com.s401.moas.blockchain.domain;

import com.fasterxml.jackson.annotation.JsonInclude;

public record Attribute(
        String trait_type,
        Object value,
        @JsonInclude(JsonInclude.Include.NON_NULL) // display_type이 null이면 JSON에서 제외
        String display_type
) {
    // 숫자 타입이 아닌 경우 display_type 없이 생성할 수 있는 편의 생성자
    public Attribute(String trait_type, Object value) {
        this(trait_type, value, null);
    }
}