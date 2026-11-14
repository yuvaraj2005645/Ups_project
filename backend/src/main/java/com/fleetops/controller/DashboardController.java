package com.fleetops.controller;

import com.fleetops.dto.ApiResponse;
import com.fleetops.dto.DashboardOverviewResponse;
import com.fleetops.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<DashboardOverviewResponse>> getOverview() {
        DashboardOverviewResponse response = dashboardService.getOverview();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
