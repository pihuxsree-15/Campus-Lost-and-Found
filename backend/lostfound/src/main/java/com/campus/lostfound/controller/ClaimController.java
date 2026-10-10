
package com.campus.lostfound.controller;

import com.campus.lostfound.model.Claim;
import com.campus.lostfound.model.Item;
import com.campus.lostfound.service.ClaimService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/claims")
@CrossOrigin(origins = "http://localhost:5173")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping
    public ResponseEntity<?> submitClaim(@RequestBody Claim claim) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(claimService.submitClaim(claim));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my/{claimantId}")
    public List<Claim> getMyClaims(@PathVariable Long claimantId) {
        return claimService.getMyClaims(claimantId);
    }

    @GetMapping("/reporter/{reporterId}")
    public List<Claim> getClaimsForReporter(@PathVariable Long reporterId) {
        return claimService.getClaimsForReporter(reporterId);
    }

    @GetMapping("/admin")
    public List<Claim> getAllClaims() {
        return claimService.getAllClaims();
    }

    @PutMapping("/{claimId}/review")
    public ResponseEntity<?> reviewClaim(
            @PathVariable Long claimId,
            @RequestParam Long reporterId,
            @RequestBody Map<String, String> request) {
        try {
            return ResponseEntity.ok(
                    claimService.reviewClaim(
                            claimId, reporterId, request.get("decision")
                    )
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/item/{itemId}/returned")
    public ResponseEntity<?> markReturned(
            @PathVariable Long itemId,
            @RequestParam Long reporterId) {
        try {
            Item item = claimService.markReturned(itemId, reporterId);
            return ResponseEntity.ok(item);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
