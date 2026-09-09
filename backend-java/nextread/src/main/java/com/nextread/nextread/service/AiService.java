package com.nextread.nextread.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private final String apiKey;
    private final String model;
    private final RestClient restClient;

    public AiService(
            @Value("${google.ai.api-key:}") String apiKey,
            @Value("${google.ai.model:gemini-2.5-flash}") String model
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    public String generateBookSummary(String title, String author) {
        if (apiKey == null || apiKey.isBlank()) {
            return "AI model is not available due to a configuration error.";
        }

        String prompt = "Provide a concise, engaging, one-paragraph summary for the book "
                + "'" + title + "' by '" + author + "'. "
                + "Focus on the main plot or key ideas. "
                + "Do not include any introductory phrases like 'This book is about...'.";

        Map<String, Object> request = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                )
        );

        try {
            Map<?, ?> response = restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1beta/models/{model}:generateContent")
                            .queryParam("key", apiKey)
                            .build(model))
                    .body(request)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                return "Could not generate a summary at this time.";
            }

            Object candidatesObject = response.get("candidates");
            if (!(candidatesObject instanceof List<?> candidates) || candidates.isEmpty()) {
                return "Could not generate a summary at this time.";
            }

            Object firstCandidate = candidates.get(0);
            if (!(firstCandidate instanceof Map<?, ?> candidate)) {
                return "Could not generate a summary at this time.";
            }

            Object contentObject = candidate.get("content");
            if (!(contentObject instanceof Map<?, ?> content)) {
                return "Could not generate a summary at this time.";
            }

            Object partsObject = content.get("parts");
            if (!(partsObject instanceof List<?> parts) || parts.isEmpty()) {
                return "Could not generate a summary at this time.";
            }

            Object firstPart = parts.get(0);
            if (!(firstPart instanceof Map<?, ?> part)) {
                return "Could not generate a summary at this time.";
            }

            Object text = part.get("text");
            if (!(text instanceof String summary) || summary.isBlank()) {
                return "Could not generate a summary at this time.";
            }

            return summary.trim().replace("\n", " ");

        } catch (Exception e) {
            System.out.println("--- DETAILED AI ERROR ---");
            System.out.println("An error occurred while generating the book summary: " + e.getMessage());
            System.out.println("-------------------------");
            return "Could not generate a summary at this time.";
        }
    }
}
