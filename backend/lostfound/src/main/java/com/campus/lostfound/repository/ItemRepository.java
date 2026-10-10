package com.campus.lostfound.repository;

import com.campus.lostfound.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByCategoryContainingIgnoreCase(String category);
    List<Item> findByLocationContainingIgnoreCase(String location);
    List<Item> findByCategoryContainingIgnoreCaseAndLocationContainingIgnoreCase(
            String category, String location);
    List<Item> findByUserId(Long userId);
}
