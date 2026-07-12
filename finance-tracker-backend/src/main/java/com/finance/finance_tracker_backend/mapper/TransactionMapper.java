package com.finance.finance_tracker_backend.mapper;

import com.finance.finance_tracker_backend.dto.transaction.TransactionRequest;
import com.finance.finance_tracker_backend.dto.transaction.TransactionResponse;
import com.finance.finance_tracker_backend.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public Transaction toEntity(TransactionRequest request) {
        if (request == null) {
            return null;
        }

        return Transaction.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .amount(request.getAmount())
                .transactionType(request.getTransactionType())
                .category(request.getCategory())
                .transactionDate(request.getTransactionDate())
                .build();
    }

    public TransactionResponse toResponse(Transaction transaction) {
        if (transaction == null) {
            return null;
        }

        return TransactionResponse.builder()
                .id(transaction.getId())
                .title(transaction.getTitle())
                .description(transaction.getDescription())
                .amount(transaction.getAmount())
                .transactionType(transaction.getTransactionType())
                .category(transaction.getCategory())
                .transactionDate(transaction.getTransactionDate())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }

    public void updateEntityFromRequest(TransactionRequest request, Transaction transaction) {
        if (request == null || transaction == null) {
            return;
        }

        transaction.setTitle(request.getTitle());
        transaction.setDescription(request.getDescription());
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(request.getTransactionType());
        transaction.setCategory(request.getCategory());
        transaction.setTransactionDate(request.getTransactionDate());
    }
}
