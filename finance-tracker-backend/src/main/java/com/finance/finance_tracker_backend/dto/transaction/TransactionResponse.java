package com.finance.finance_tracker_backend.dto.transaction;

import com.finance.finance_tracker_backend.enums.Category;
import com.finance.finance_tracker_backend.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal amount;
    private TransactionType transactionType;
    private Category category;
    private LocalDate transactionDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
