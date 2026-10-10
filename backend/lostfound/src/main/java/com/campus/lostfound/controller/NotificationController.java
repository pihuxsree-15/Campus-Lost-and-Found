
package com.campus.lostfound.controller;

import com.campus.lostfound.model.Notification;
import com.campus.lostfound.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotifications(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                notificationService.getUserNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                Map.of("count",
                        notificationService.getUnreadCount(userId)));
    }

    @PutMapping("/{notificationId}/read/user/{userId}")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long notificationId,
            @PathVariable Long userId) {

        boolean updated = notificationService.markAsRead(
                notificationId, userId);

        if (!updated) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                Map.of("message", "Notification marked as read"));
    }
}
