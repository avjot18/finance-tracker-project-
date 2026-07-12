package com.finance.finance_tracker_backend.controller.report;

import com.finance.finance_tracker_backend.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports Module", description = "Endpoints for downloading financial activity data in PDF and CSV format.")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/csv")
    @Operation(summary = "Download CSV Report", description = "Streams a spreadsheet-compatible comma-separated value file containing the user's transaction history.")
    public ResponseEntity<InputStreamResource> downloadCsv(Authentication authentication) {
        ByteArrayInputStream csvStream = reportService.generateTransactionsCsvReport(authentication.getName());
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=transactions.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(csvStream));
    }

    @GetMapping("/pdf")
    @Operation(summary = "Download PDF Report", description = "Streams a professionally styled PDF document containing transaction lists and summary aggregates.")
    public ResponseEntity<InputStreamResource> downloadPdf(Authentication authentication) {
        ByteArrayInputStream pdfStream = reportService.generateTransactionsPdfReport(authentication.getName());

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=finance_report.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdfStream));
    }
}
