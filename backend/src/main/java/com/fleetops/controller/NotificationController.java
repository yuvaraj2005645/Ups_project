package com.fleetops.controller;

import com.fleetops.dto.ApiResponse;
import com.fleetops.model.Notification;
import com.fleetops.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String userId
    ) {
        String effectiveUserId = userId != null ? userId : (userDetails != null ? userDetails.getUsername() : null);
        List<Notification> list = notificationService.getAll(effectiveUserId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markRead(@PathVariable String id) {
        Notification updated = notificationService.markRead(id);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", updated));
    }

    @PatchMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String userId
    ) {
        String effectiveUserId = userId != null ? userId : (userDetails != null ? userDetails.getUsername() : null);
        notificationService.markAllRead(effectiveUserId);
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }
}
