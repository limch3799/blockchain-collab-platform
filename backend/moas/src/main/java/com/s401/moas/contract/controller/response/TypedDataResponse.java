package com.s401.moas.contract.controller.response;

import lombok.Builder;
import lombok.Getter;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class TypedDataResponse {
    private final Domain domain;
    private final Map<String, List<Type>> types;
    private final String primaryType;
    private final Message message;

    @Getter
    @Builder
    public static class Domain {
        private String name;
        private String version;
        private Long chainId;
        private String verifyingContract;
    }

    @Getter
    @Builder
    public static class Type {
        private String name;
        private String type;
    }

    @Getter
    @Builder
    public static class Message {
        private String tokenId;
        private String title;
        private String descriptionHash;
        private String leader;
        private String artist;
        private String totalAmount;
        private String startsAt;
        private String endsAt;
    }
}