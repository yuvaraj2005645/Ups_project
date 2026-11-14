package com.fleetops.controller;

import com.fleetops.dto.*;
import com.fleetops.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/shipments")
    public ResponseEntity<ApiResponse<ShipmentReportResponse>> getShipmentReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        ShipmentReportResponse report = reportService.getShipmentReport(from, to);
        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @GetMapping("/vehicles")
    public ResponseEntity<ApiResponse<VehicleReportResponse>> getVehicleReport() {
        VehicleReportResponse report = reportService.getVehicleReport();
        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @GetMapping("/routes")
    public ResponseEntity<ApiResponse<RouteReportResponse>> getRouteReport() {
        RouteReportResponse report = reportService.getRouteReport();
        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @GetMapping("/drivers")
    public ResponseEntity<ApiResponse<DriverReportResponse>> getDriverReport() {
        DriverReportResponse report = reportService.getDriverReport();
        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @GetMapping("/deliveries")
    public ResponseEntity<ApiResponse<DeliveryReportResponse>> getDeliveryReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        DeliveryReportResponse report = reportService.getDeliveryReport(from, to);
        return ResponseEntity.ok(ApiResponse.ok(report));
    }
}
