package com.s401.moas.blockchain.domain;

import java.util.List;

public record NftMetadata(
        String name,
        String description,
        String image,
        List<Attribute> attributes
) {}