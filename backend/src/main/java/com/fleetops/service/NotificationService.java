package com.fleetops.service;

import com.fleetops.exception.ResourceNotFoundException;
import com.fleetops.model.Notification;
import com.fleetops.model.NotificationType;
import com.fleetops.repository.InMemoryDataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final InMemoryDataStore dataStore;

    public List<Notification> getAll(String userId) {
        return dataStore.findAllNotifications().stream()
                .filter(n -> n.getUserId() == null || n.getUserId().equalsIgnoreCase(userId))
                .sorted(Comparator.comparing(Notification::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public Notification markRead(String notificationId) {
        Notification notification = dataStore.findAllNotifications().stream()
                .filter(n -> n.getId().equals(notificationId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));
        notification.setRead(true);
        return notification;
    }

    public void markAllRead(String userId) {
        dataStore.findAllNotifications().stream()
                .filter(n -> n.getUserId() == null || n.getUserId().equalsIgnoreCase(userId))
                .forEach(n -> n.setRead(true));
    }

    public Notification addNotification(NotificationType type, String title, String message, String relatedId, String userId) {
        Notification notification = Notification.builder()
                .id(dataStore.generateNotificationId())
                .type(type)
                .title(title)
                .message(message)
                .relatedId(relatedId)
                .userId(userId)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        return dataStore.saveNotification(notification);
    }
}
