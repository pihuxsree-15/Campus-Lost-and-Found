
package com.campus.lostfound.repository;

import com.campus.lostfound.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByClaimantIdOrderByCreatedAtDesc(Long claimantId);

    List<Claim> findByStatusOrderByCreatedAtDesc(String status);

    List<Claim> findByItemIdOrderByCreatedAtDesc(Long itemId);

    boolean existsByItemIdAndClaimantIdAndStatus(
            Long itemId, Long claimantId, String status);
}
