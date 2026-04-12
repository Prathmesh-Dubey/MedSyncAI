package com.example.springcrud.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;

@Service
public class DeepSeekService {

    @Value("${deepseek.api.key}")
    private String apiKey;

    @Value("${deepseek.api.url}")
    private String apiUrl;

    @Value("${deepseek.model}")
    private String model;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * Send a message to DeepSeek API and return AI reply.
     */
    public String sendMessage(String userMessage) throws Exception {

        String requestBody = buildRequestBody(userMessage);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(apiUrl))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + apiKey)
            .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
            .build();

        System.out.println("📤 Sending to DeepSeek: " + userMessage);

        HttpResponse<String> response = httpClient.send(
            request, HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() != 200) {
            System.err.println("❌ API Error: " + response.body());
            throw new RuntimeException("DeepSeek API error: HTTP " + response.statusCode());
        }

        String reply = parseContent(response.body());
        System.out.println("📥 Pratham AI Reply: " + reply);
        return reply;
    }

    // ── Build JSON request body ────────────────────────────────
    private String buildRequestBody(String userMessage) {
        return "{"
            + "\"model\":\"" + model + "\","
            + "\"messages\":["
            +   "{\"role\":\"system\",\"content\":\"You are Pratham AI, a helpful assistant.\"},"
            +   "{\"role\":\"user\",\"content\":\"" + escapeJson(userMessage) + "\"}"
            + "],"
            + "\"max_tokens\":1024,"
            + "\"temperature\":0.7"
            + "}";
    }

    // ── Extract content from JSON response ─────────────────────
    private String parseContent(String json) {
        String marker = "\"content\":\"";
        int start = json.lastIndexOf(marker) + marker.length();
        StringBuilder sb = new StringBuilder();
        boolean escape = false;
        for (int i = start; i < json.length(); i++) {
            char c = json.charAt(i);
            if (escape) {
                switch (c) {
                    case 'n'  -> sb.append('\n');
                    case 't'  -> sb.append('\t');
                    case '"'  -> sb.append('"');
                    case '\\' -> sb.append('\\');
                    default   -> sb.append(c);
                }
                escape = false;
            } else if (c == '\\') {
                escape = true;
            } else if (c == '"') {
                break;
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }

    // ── Escape special chars for JSON ──────────────────────────
    private String escapeJson(String text) {
        return text
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }
}