package com.finance.finance_tracker_backend.service.impl;

import com.finance.finance_tracker_backend.entity.Transaction;
import com.finance.finance_tracker_backend.entity.User;
import com.finance.finance_tracker_backend.exception.ResourceNotFoundException;
import com.finance.finance_tracker_backend.repository.TransactionRepository;
import com.finance.finance_tracker_backend.repository.UserRepository;
import com.finance.finance_tracker_backend.service.ReportService;
import com.finance.finance_tracker_backend.util.CsvGenerator;
import com.finance.finance_tracker_backend.util.PdfGenerator;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.util.List;

@Service
public class ReportServiceImpl implements ReportService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public ReportServiceImpl(TransactionRepository transactionRepository,
                             UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream generateTransactionsCsvReport(String email) {
        User user = getUser(email);
        
        Specification<Transaction> spec = (root, query, cb) -> cb.equal(root.get("user"), user);
        List<Transaction> transactions = transactionRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "transactionDate"));

        return CsvGenerator.transactionsToCsv(transactions);
    }

    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream generateTransactionsPdfReport(String email) {
        User user = getUser(email);

        Specification<Transaction> spec = (root, query, cb) -> cb.equal(root.get("user"), user);
        List<Transaction> transactions = transactionRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "transactionDate"));

        return PdfGenerator.transactionsToPdf(transactions, user.getEmail());
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
}
