package com.s401.moas.project.service;

import static io.qdrant.client.PointIdFactory.id;
import static io.qdrant.client.QueryFactory.nearest;
import static io.qdrant.client.VectorsFactory.vectors;

import io.qdrant.client.QdrantClient;
import io.qdrant.client.grpc.JsonWithInt;
import io.qdrant.client.grpc.Points.PointStruct;
import io.qdrant.client.grpc.Points.QueryPoints;
import io.qdrant.client.grpc.Points.ScoredPoint;
import io.qdrant.client.grpc.Points.SearchParams;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
public class SimilarProjectService {
    private final QdrantClient qdrant;
    private static final String COL = "projects"; // alias 권장

    public void upsert(long projectId, float[] vector, Map<String, Object> payload) {
        var p = PointStruct.newBuilder()
            .setId(id(projectId))
            .setVectors(vectors(vector))
            .putAllPayload(toJson(payload))
            .build();

        // ListenableFuture를 .get()으로 동기화
        try {
            qdrant.upsertAsync(COL, List.of(p)).get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Qdrant upsert 실패", e);
        }
    }

    /** 쿼리 벡터로 k-NN 검색 → ID 리스트만 반환 */
    public List<Long> searchIds(float[] queryVector, int limit, Long excludeId) {
        QueryPoints q = QueryPoints.newBuilder()
            .setCollectionName(COL)
            .setLimit(limit)
            .setQuery(nearest(queryVector))
            .setParams(SearchParams.newBuilder().setHnswEf(128).build())
            .build();

        // ListenableFuture를 .get()으로 동기화
        List<ScoredPoint> hits;
        try {
            hits = qdrant.queryAsync(q).get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Qdrant query 실패", e);
        }

        var ids = new ArrayList<Long>(hits.size());
        for (ScoredPoint h : hits) {
            if (h.getId().hasNum()) {
                long idNum = h.getId().getNum();
                if (excludeId == null || idNum != excludeId) {
                    ids.add(idNum);
                }
            }
        }
        return ids;
    }

    private static Map<String, JsonWithInt.Value> toJson(Map<String, Object> src) {
        Map<String, JsonWithInt.Value> out = new HashMap<>();
        src.forEach((k, v) -> out.put(k, toVal(v)));
        return out;
    }

    private static JsonWithInt.Value toVal(Object v) {
        var b = JsonWithInt.Value.newBuilder();
        if (v == null) return b.setNullValue(JsonWithInt.NullValue.NULL_VALUE).build();
        if (v instanceof String s)  return b.setStringValue(s).build();
        if (v instanceof Boolean bl) return b.setBoolValue(bl).build();
        if (v instanceof Integer i) return b.setIntegerValue(i.longValue()).build();
        if (v instanceof Long l)    return b.setIntegerValue(l).build();
        if (v instanceof Float f)   return b.setDoubleValue(f.doubleValue()).build();
        if (v instanceof Double d)  return b.setDoubleValue(d).build();
        return b.setStringValue(v.toString()).build();
    }
}
