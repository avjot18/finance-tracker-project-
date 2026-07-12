package com.finance.finance_tracker_backend.util;

import com.finance.finance_tracker_backend.entity.Transaction;
import com.finance.finance_tracker_backend.enums.TransactionType;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import java.awt.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public final class PdfGenerator {

    private PdfGenerator() {
        // Restrict instantiation
    }

    public static ByteArrayInputStream transactionsToPdf(List<Transaction> transactions, String userEmail) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // 1. Title Page Header
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.BLACK);
            Paragraph title = new Paragraph("Personal Finance Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            // 2. Metadata Info
            Font metaFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
            Paragraph meta = new Paragraph();
            meta.add(new Chunk("Generated for: " + userEmail + "\n"));
            meta.add(new Chunk("Report Date: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + "\n\n"));
            meta.setAlignment(Element.ALIGN_CENTER);
            document.add(meta);

            // 3. Summarize income, expenses and balance
            BigDecimal totalIncome = BigDecimal.ZERO;
            BigDecimal totalExpense = BigDecimal.ZERO;
            if (transactions != null) {
                for (Transaction t : transactions) {
                    if (t.getTransactionType() == TransactionType.INCOME) {
                        totalIncome = totalIncome.add(t.getAmount());
                    } else if (t.getTransactionType() == TransactionType.EXPENSE) {
                        totalExpense = totalExpense.add(t.getAmount());
                    }
                }
            }
            BigDecimal balance = totalIncome.subtract(totalExpense);

            Font summaryLabelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.DARK_GRAY);
            Font summaryValFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.BLACK);

            PdfPTable summaryTable = new PdfPTable(3);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingAfter(20);

            PdfPCell cell1 = new PdfPCell(new Phrase("Total Income: Rs. " + totalIncome, summaryLabelFont));
            cell1.setBackgroundColor(new Color(230, 245, 230)); // light green
            cell1.setPadding(8);
            cell1.setHorizontalAlignment(Element.ALIGN_CENTER);
            summaryTable.addCell(cell1);

            PdfPCell cell2 = new PdfPCell(new Phrase("Total Expense: Rs. " + totalExpense, summaryLabelFont));
            cell2.setBackgroundColor(new Color(255, 230, 230)); // light red
            cell2.setPadding(8);
            cell2.setHorizontalAlignment(Element.ALIGN_CENTER);
            summaryTable.addCell(cell2);

            PdfPCell cell3 = new PdfPCell(new Phrase("Net Balance: Rs. " + balance, summaryLabelFont));
            cell3.setBackgroundColor(new Color(230, 240, 250)); // light blue
            cell3.setPadding(8);
            cell3.setHorizontalAlignment(Element.ALIGN_CENTER);
            summaryTable.addCell(cell3);

            document.add(summaryTable);

            // 4. Details Table Headers
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.0f, 2.5f, 1.8f, 1.8f, 1.5f, 1.8f});

            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            String[] headers = {"ID", "Title", "Type", "Category", "Amount", "Date"};
            for (String header : headers) {
                PdfPCell headerCell = new PdfPCell(new Phrase(header, headFont));
                headerCell.setBackgroundColor(new Color(54, 95, 145)); // primary color blue
                headerCell.setPadding(6);
                headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(headerCell);
            }

            // 5. Populate Rows
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            Font incomeFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(46, 125, 50)); // green
            Font expenseFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(198, 40, 40)); // red

            if (transactions != null) {
                for (Transaction t : transactions) {
                    table.addCell(new PdfPCell(new Phrase(String.valueOf(t.getId()), bodyFont)));
                    table.addCell(new PdfPCell(new Phrase(t.getTitle(), bodyFont)));

                    // Type color
                    PdfPCell typeCell = new PdfPCell();
                    if (t.getTransactionType() == TransactionType.INCOME) {
                        typeCell.addElement(new Phrase(t.getTransactionType().name(), incomeFont));
                    } else {
                        typeCell.addElement(new Phrase(t.getTransactionType().name(), expenseFont));
                    }
                    table.addCell(typeCell);

                    table.addCell(new PdfPCell(new Phrase(t.getCategory().name(), bodyFont)));
                    
                    // Amount
                    table.addCell(new PdfPCell(new Phrase("Rs. " + t.getAmount().toString(), bodyFont)));
                    
                    // Date
                    table.addCell(new PdfPCell(new Phrase(t.getTransactionDate().toString(), bodyFont)));
                }
            }

            document.add(table);
            document.close();

        } catch (DocumentException e) {
            throw new RuntimeException("Error occurred while generating PDF report", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
