
package com.campus.lostfound.service;

import com.campus.lostfound.model.Claim;
import com.campus.lostfound.model.Item;
import com.campus.lostfound.model.Notification;
import com.campus.lostfound.repository.ClaimRepository;
import com.campus.lostfound.repository.ItemRepository;
import com.campus.lostfound.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ItemRepository itemRepository;
    private final NotificationRepository notificationRepository;

    public ClaimService(
            ClaimRepository claimRepository,
            ItemRepository itemRepository,
            NotificationRepository notificationRepository) {
        this.claimRepository = claimRepository;
        this.itemRepository = itemRepository;
        this.notificationRepository = notificationRepository;
    }

    public Claim submitClaim(Claim claim) {
        Item item = itemRepository.findById(claim.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        if (claim.getClaimantId() == null) {
            throw new IllegalArgumentException("Please log in to submit a claim");
        }

        if (item.getUserId() != null
                && item.getUserId().equals(claim.getClaimantId())) {
            throw new IllegalArgumentException("You cannot claim your own report");
        }

        if (!"FOUND".equalsIgnoreCase(item.getType())) {
            throw new IllegalArgumentException("Only found items can be claimed");
        }

        if (item.getStatus() != null &&
                (item.getStatus().equalsIgnoreCase("CLAIMED")
                || item.getStatus().equalsIgnoreCase("RETURNED")
                || item.getStatus().equalsIgnoreCase("RESOLVED"))) {
            throw new IllegalArgumentException("This item is no longer available to claim");
        }

        if (claimRepository.existsByItemIdAndClaimantIdAndStatus(
                claim.getItemId(), claim.getClaimantId(), "PENDING")) {
            throw new IllegalArgumentException("You already have a pending claim for this item");
        }

        if (claim.getDescription() == null || claim.getDescription().isBlank()) {
            throw new IllegalArgumentException("Please describe why this item belongs to you");
        }

        claim.setStatus("PENDING");
        claim.setCreatedAt(LocalDateTime.now());
        claim.setUpdatedAt(LocalDateTime.now());

        Claim savedClaim = claimRepository.save(claim);

        if (item.getUserId() != null) {
            notificationRepository.save(new Notification(
                    item.getUserId(),
                    "Someone has submitted a claim for your found item '" + item.getItemName() + "'."
            ));
        }

        return savedClaim;
    }

    public List<Claim> getMyClaims(Long claimantId) {
        return claimRepository.findByClaimantIdOrderByCreatedAtDesc(claimantId);
    }

    public List<Claim> getClaimsForReporter(Long reporterId) {
        return claimRepository.findAll().stream()
                .filter(claim -> {
                    Item item = itemRepository.findById(claim.getItemId()).orElse(null);
                    return item != null
                            && reporterId.equals(item.getUserId())
                            && "FOUND".equalsIgnoreCase(item.getType());
                })
                .toList();
    }

    public List<Claim> getAllClaims() {
        return claimRepository.findAll();
    }

    public List<Claim> getPendingClaims() {
        return claimRepository.findByStatusOrderByCreatedAtDesc("PENDING");
    }

    @Transactional
    public Claim reviewClaim(Long claimId, Long reporterId, String decision) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found"));

        if (!"APPROVED".equalsIgnoreCase(decision)
                && !"REJECTED".equalsIgnoreCase(decision)) {
            throw new IllegalArgumentException("Decision must be APPROVED or REJECTED");
        }

        if (!"PENDING".equalsIgnoreCase(claim.getStatus())) {
            throw new IllegalArgumentException("This claim has already been reviewed");
        }

        Item item = itemRepository.findById(claim.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        if (item.getUserId() == null || !item.getUserId().equals(reporterId)) {
            throw new IllegalArgumentException("Only the person who reported this item can review its claims");
        }

        if (!"FOUND".equalsIgnoreCase(item.getType())) {
            throw new IllegalArgumentException("Only found-item reports can be reviewed");
        }

        if ("APPROVED".equalsIgnoreCase(decision)) {
            item.setStatus("CLAIMED");
            itemRepository.save(item);
            claim.setStatus("APPROVED");

            for (Claim other : claimRepository.findByItemIdOrderByCreatedAtDesc(item.getId())) {
                if (!other.getId().equals(claim.getId())
                        && "PENDING".equalsIgnoreCase(other.getStatus())) {
                    other.setStatus("REJECTED");
                    other.setUpdatedAt(LocalDateTime.now());
                    claimRepository.save(other);

                    notificationRepository.save(new Notification(
                            other.getClaimantId(),
                            "Your claim for '" + item.getItemName()
                                    + "' was closed because another claim was approved."
                    ));
                }
            }
        } else {
            claim.setStatus("REJECTED");
        }

        claim.setUpdatedAt(LocalDateTime.now());
        Claim savedClaim = claimRepository.save(claim);

        notificationRepository.save(new Notification(
                claim.getClaimantId(),
                "Your claim for '" + item.getItemName() + "' was "
                        + claim.getStatus().toLowerCase() + "."
        ));

        return savedClaim;
    }

    @Transactional
    public Item markReturned(Long itemId, Long reporterId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        if (item.getUserId() == null || !item.getUserId().equals(reporterId)) {
            throw new IllegalArgumentException("Only the original reporter can confirm the return");
        }

        if (!"CLAIMED".equalsIgnoreCase(item.getStatus())) {
            throw new IllegalArgumentException("Only claimed items can be marked as returned");
        }

        item.setStatus("RETURNED");
        Item savedItem = itemRepository.save(item);

        claimRepository.findByItemIdOrderByCreatedAtDesc(itemId).stream()
                .filter(claim -> "APPROVED".equalsIgnoreCase(claim.getStatus()))
                .findFirst()
                .ifPresent(claim -> notificationRepository.save(new Notification(
                        claim.getClaimantId(),
                        "The return of '" + item.getItemName() + "' has been confirmed."
                )));

        return savedItem;
    }
}
