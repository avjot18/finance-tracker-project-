package com.finance.finance_tracker_backend.util;

import com.finance.finance_tracker_backend.entity.Transaction;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;

public final class CsvGenerator {

    private CsvGenerator() {
        // Restrict instantiation
    }

    public static ByteArrayInputStream transactionsToCsv(List<Transaction> transactions) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {
            // Write CSV header
            writer.println("ID,Title,Description,Amount,Type,Category,Date,CreatedAt");

            if (transactions != null) {
                for (Transaction t : transactions) {
                    String title = t.getTitle() != null ? t.getTitle().replace("\"", "\"\"") : "";
                    String description = t.getDescription() != null ? t.getDescription().replace("\"", "\"\"") : "";
                    String amount = t.getAmount() != null ? t.getAmount().toString() : "0.00";
                    String type = t.getTransactionType() != null ? t.getTransactionType().name() : "";
                    String category = t.getCategory() != null ? t.getCategory().name() : "";
                    String date = t.getTransactionDate() != null ? t.getTransactionDate().toString() : "";
                    String createdAt = t.getCreatedAt() != null ? t.getCreatedAt().toString() : "";

                    writer.println(String.format("%d,\"%s\",\"%s\",%s,%s,%s,%s,%s",
                            t.getId(),
                            title,
                            description,
                            amount,
                            type,
                            category,
                            date,
                            createdAt
                    ));
                }
            }
            writer.flush();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }
}
