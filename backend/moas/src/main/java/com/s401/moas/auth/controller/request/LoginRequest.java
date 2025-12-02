package com.s401.moas.auth.controller.request;

public record LoginRequest(
        String idToken,
        String walletAddress
) {}