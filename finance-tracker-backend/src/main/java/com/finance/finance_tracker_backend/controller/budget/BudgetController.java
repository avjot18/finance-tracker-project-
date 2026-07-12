package com.finance.finance_tracker_backend.controller.budget;

import com.finance.finance_tracker_backend.common.response.ApiResponse;
import com.finance.finance_tracker_backend.dto.budget.BudgetRequest;
import com.finance.finance_tracker_backend.dto.budget.BudgetResponse;
import com.finance.finance_tracker_backend.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@Tag(name = "Budget Module", description = "Endpoints for defining and monitoring monthly, category-specific expense limits.")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    @Operation(summary = "Create Budget Limit", description = "Defines a new monthly expense limit for a specific category. Validates that no duplicate category budget is registered for that month.")
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(
            @Valid @RequestBody BudgetRequest request,
            Authentication authentication) {
        BudgetResponse data = budgetService.createBudget(request, authentication.getName());
        ApiResponse<BudgetResponse> response = ApiResponse.<BudgetResponse>builder()
                .success(true)
                .message("Budget created successfully.")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Budget Limit", description = "Modifies the limit amount or time period. Recalculates spent metrics.")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request,
            Authentication authentication) {
        BudgetResponse data = budgetService.updateBudget(id, request, authentication.getName());
        ApiResponse<BudgetResponse> response = ApiResponse.<BudgetResponse>builder()
                .success(true)
                .message("Budget updated successfully.")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Budget Limit", description = "Deletes a budget limit configuration.")
    public ResponseEntity<ApiResponse<String>> deleteBudget(
            @PathVariable Long id,
            Authentication authentication) {
        budgetService.deleteBudget(id, authentication.getName());
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("Budget deleted successfully.")
                .data("Budget ID: " + id)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Budget Details", description = "Retrieves details and progress for a single budget category.")
    public ResponseEntity<ApiResponse<BudgetResponse>> getBudgetById(
            @PathVariable Long id,
            Authentication authentication) {
        BudgetResponse data = budgetService.getBudgetById(id, authentication.getName());
        ApiResponse<BudgetResponse> response = ApiResponse.<BudgetResponse>builder()
                .success(true)
                .message("Budget retrieved successfully.")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Query Budgets List", description = "Fetches a user's budgets. Optionally filters by 'month' and 'year'.")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgets(
            @RequestParam(value = "month", required = false) Integer month,
            @RequestParam(value = "year", required = false) Integer year,
            Authentication authentication) {
        
        List<BudgetResponse> data;
        if (month != null && year != null) {
            data = budgetService.getBudgetsByMonthAndYear(month, year, authentication.getName());
        } else {
            data = budgetService.getAllBudgets(authentication.getName());
        }

        ApiResponse<List<BudgetResponse>> response = ApiResponse.<List<BudgetResponse>>builder()
                .success(true)
                .message("Budgets retrieved successfully.")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }
}
