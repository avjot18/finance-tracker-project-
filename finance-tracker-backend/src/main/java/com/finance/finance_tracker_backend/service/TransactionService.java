package com.finance.finance_tracker_backend.service;

import com.finance.finance_tracker_backend.common.response.PageResponse;
import com.finance.finance_tracker_backend.dto.transaction.TransactionRequest;
import com.finance.finance_tracker_backend.dto.transaction.TransactionResponse;
import com.finance.finance_tracker_backend.dto.transaction.TransactionSummaryDTO;

public interface TransactionService {

    TransactionResponse createTransaction(TransactionRequest request, String email);

    TransactionResponse updateTransaction(Long id, TransactionRequest request, String email);

    void deleteTransaction(Long id, String email);

    TransactionResponse getTransactionById(Long id, String email);

    PageResponse<TransactionResponse> getAllTransactions(
            String email, int pageNo, int pageSize, String sortBy, String sortDir,
            String search, String category, String type, String startDate, String endDate
    );

    TransactionSummaryDTO getTransactionSummary(String email);
}
