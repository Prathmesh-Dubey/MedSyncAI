package com.example.springcrud.controller;

import com.example.springcrud.model.ChatRequest;
import com.example.springcrud.model.ChatResponse;
import com.example.springcrud.service.DeepSeekService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")   // allows frontend (HTML) to call this
public class ChatController {

    @Autowired
    private DeepSeekService deepSeekService;

    /**
     * POST /api/chat
     * Body  : { "message": "Hello!" }
     * Returns: { "reply": "...", "success": true }
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            String reply = deepSeekService.sendMessage(request.getMessage());
            return ResponseEntity.ok(new ChatResponse(reply));
        } catch (Exception e) {
            return ResponseEntity
                .status(500)
                .body(new ChatResponse(false, e.getMessage()));
        }
    }

    /**
     * GET /api/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("✅ Pratham AI is running!");
    }
}