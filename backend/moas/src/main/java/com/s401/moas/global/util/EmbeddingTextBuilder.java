package com.s401.moas.global.util;

import java.util.List;

public final class EmbeddingTextBuilder {
    private EmbeddingTextBuilder() {}

    public static String build(String title, String summary, List<String> positions, String location) {
        String pos = (positions == null || positions.isEmpty()) ? "" : String.join(", ", positions);
        String loc = (location == null || location.isBlank()) ? "online" : location;
        return "title: " + ns(title) + "\n"
             + "summary: " + ns(summary) + "\n"
             + "positions: " + pos + "\n"
             + "location: " + loc;
    }

    private static String ns(String s) {
        return s == null ? "" : s;
    }
}
