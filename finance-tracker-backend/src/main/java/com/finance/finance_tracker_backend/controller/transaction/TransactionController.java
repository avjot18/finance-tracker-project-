package com.finance.finance_tracker_backend.controller.transaction;

import com.finance.finance_tracker_backend.common.constants.AppConstants;
import com.finance.finance_tracker_backend.common.response.ApiResponse;
import com.finance.finance_tracker_backend.common.response.PageResponse;
import com.finance.finance_tracker_backend.dto.transaction.TransactionRequest;
import com.finance.finance_tracker_backend.dto.transaction.TransactionResponse;
import com.finance.finance_tracker_backend.dto.transaction.TransactionSummaryDTO;
import com.finance.finance_tracker_backend.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/transactions")
@Tag(name = "Transaction Module", description = "Endpoints for creating, viewing, updating, and deleting financial transactions, with dynamic search and paging.")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    @Operation(summary = "Create Transaction", description = "Creates a new income or expense transaction. Adjusts the corresponding monthly budget spentAmount if it exists.")
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication) {
        TransactionResponse data = transactionService.createTransaction(request, authentication.getName());
        ApiResponse<TransactionResponse> response = ApiResponse.<TransactionResponse>builder()
                .success(true)
                .message("Transaction created successfully.")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Transaction", description = "Modifies an existing transaction. Recalculates category budgets if dates or amounts change.")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication) {
        TransactionResponse data = transactionService.updateTransaction(id, request, authentication.getName());
        ApiResponse<TransactionResponse> response = ApiResponse.<TransactionResponse>builder()
                .success(true)
                .message("Transaction updated successfully.")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Transaction", description = "Permanently deletes a transaction and updates the associated budget totals.")
    public ResponseEntity<ApiResponse<String>> deleteTransaction(
            @PathVariable Long id,
            Authentication authentication) {
        transactionService.deleteTransaction(id, authentication.getName());
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("Transaction deleted successfully.")
                .data("Transaction ID: " + id)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Transaction Details", description = "Retrieves structural data for a single transaction.")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransactionById(
            @PathVariable Long id,
            Authentication authentication) {
        TransactionResponse data = transactionService.getTransactionById(id, authentication.getName());
        ApiResponse<TransactionResponse> response = ApiResponse.<TransactionResponse>builder()
                .success(true)
                .message("Transaction retrieved successfully.")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Query Transactions", description = "Provides paginated, sorted, and filtered lists of transactions (searching title/description, category, type, and date bounds).")
    public ResponseEntity<ApiResponse<PageResponse<TransactionResponse>>> getAllTransactions(
            @RequestParam(value = "pageNo", defaultValue = AppConstants.DEFAULT_PAGE_NUMBER, required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = AppConstants.DEFAULT_PAGE_SIZE, required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = AppConstants.DEFAULT_SORT_BY, required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = AppConstants.DEFAULT_SORT_DIRECTION, required = false) String sortDir,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            Authentication authentication) {

        PageResponse<TransactionResponse> data = transactionService.getAllTransactions(
                authentication.getName(), pageNo, pageSize, sortBy, sortDir,
                search, category, type, startDate, endDate
        );

        ApiResponse<PageResponse<TransactionResponse>> response = ApiResponse.<PageResponse<TransactionResponse>>builder()
                .success(true)
                .message("Transactions list fetched successfully.")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    @Operation(summary = "Get Summary Metrics", description = "Returns total income, total expense, and net balance for the user.")
    public ResponseEntity<ApiResponse<TransactionSummaryDTO>> getTransactionSummary(Authentication authentication) {
        TransactionSummaryDTO data = transactionService.getTransactionSummary(authentication.getName());
        ApiResponse<TransactionSummaryDTO> response = ApiResponse.<TransactionSummaryDTO>builder()
                .success(true)
                .message("Transaction summary compiled successfully.")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }
}
