package com.finance.finance_tracker_backend.controller.dashboard;

import com.finance.finance_tracker_backend.common.response.ApiResponse;
import com.finance.finance_tracker_backend.dto.dashboard.DashboardResponse;
import com.finance.finance_tracker_backend.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard Module", description = "Endpoints for retrieving aggregated balance, income, expense, recent activities, and charting data.")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @Operation(summary = "Get Dashboard Data", description = "Compiles recent transaction lists, total statistics, category summaries, and monthly reports into a single envelope.")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboardData(Authentication authentication) {
        DashboardResponse data = dashboardService.getDashboardData(authentication.getName());
        ApiResponse<DashboardResponse> response = ApiResponse.<DashboardResponse>builder()
                .success(true)
                .message("Dashboard statistics compiled successfully.")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }
}
