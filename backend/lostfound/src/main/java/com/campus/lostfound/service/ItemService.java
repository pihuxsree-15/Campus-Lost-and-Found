package com.campus.lostfound.service;

import com.campus.lostfound.model.Item;
import com.campus.lostfound.repository.ItemRepository;
import com.campus.lostfound.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class ItemService {
    private final ItemRepository itemRepository;
    private final NotificationRepository notificationRepository;
    public ItemService(ItemRepository itemRepository, NotificationRepository notificationRepository) {
    this.itemRepository = itemRepository;
    this.notificationRepository = notificationRepository;
}

    public Item createItem(Item item) {
    if (item.getStatus() == null) {
        item.setStatus("PENDING");
    }

    Item savedItem = itemRepository.save(item);

    List<Item> allItems = itemRepository.findAll();

    for (Item existingItem : allItems) {
        if (existingItem.getId().equals(savedItem.getId())) {
            continue;
        }

        boolean oppositeType = existingItem.getType() != null
                && savedItem.getType() != null
                && !existingItem.getType().equalsIgnoreCase(savedItem.getType());

        boolean sameCategory = existingItem.getCategory() != null
                && savedItem.getCategory() != null
                && existingItem.getCategory().equalsIgnoreCase(savedItem.getCategory());

        boolean sameLocation = existingItem.getLocation() != null
                && savedItem.getLocation() != null
                && existingItem.getLocation().equalsIgnoreCase(savedItem.getLocation());

        if (oppositeType && sameCategory && sameLocation
                && existingItem.getUserId() != null
                && !existingItem.getUserId().equals(savedItem.getUserId())) {

            notificationRepository.save(
                    new com.campus.lostfound.model.Notification(
                            existingItem.getUserId(),
                            "A possible match was found for your report: "
                                    + existingItem.getItemName()
                    )
            );

            if (savedItem.getUserId() != null) {
                notificationRepository.save(
                        new com.campus.lostfound.model.Notification(
                                savedItem.getUserId(),
                                "A possible match was found for your report: "
                                        + savedItem.getItemName()
                        )
                );
            }
        }
    }

    return savedItem;
}

    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    public Item getItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
    }

    public Item updateItem(Long id, Item updatedItem) {
        Item item = getItemById(id);

        item.setItemName(updatedItem.getItemName());
        item.setCategory(updatedItem.getCategory());
        item.setDescription(updatedItem.getDescription());
        item.setDate(updatedItem.getDate());
        item.setLocation(updatedItem.getLocation());
        item.setType(updatedItem.getType());
        String oldStatus = item.getStatus();
String newStatus = updatedItem.getStatus();

item.setStatus(newStatus);

if (item.getUserId() != null && newStatus != null
        && !newStatus.equalsIgnoreCase(oldStatus == null ? "" : oldStatus)) {
    if (newStatus.equalsIgnoreCase("APPROVED")) {
        notificationRepository.save(
                new com.campus.lostfound.model.Notification(
                        item.getUserId(),
                        "Your report '" + item.getItemName() + "' has been approved."
                )
        );
    } else if (newStatus.equalsIgnoreCase("RESOLVED")) {
        notificationRepository.save(
                new com.campus.lostfound.model.Notification(
                        item.getUserId(),
                        "Your report '" + item.getItemName() + "' has been marked as resolved."
                )
        );
    }
}
        item.setContactName(updatedItem.getContactName());
        item.setContactEmail(updatedItem.getContactEmail());

        return itemRepository.save(item);
    }

    public void deleteItem(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new RuntimeException("Item not found");
        }

        itemRepository.deleteById(id);
    }

    public List<Item> search(String category, String location) {

        List<Item> allItems = itemRepository.findAll();
        List<Item> results = new ArrayList<>();

        String normalizedCategory = normalize(category);
        String normalizedLocation = normalize(location);

        for (Item item : allItems) {

            boolean categoryMatch =
                    normalizedCategory.isEmpty()
                    || matchesNearest(normalizedCategory, item.getCategory());

            boolean locationMatch =
                    normalizedLocation.isEmpty()
                    || matchesNearest(normalizedLocation, item.getLocation());

            if (categoryMatch && locationMatch) {
                results.add(item);
            }
        }

        return results;
    }

    private boolean matchesNearest(String searchText, String itemText) {

        if (itemText == null || itemText.isBlank()) {
            return false;
        }

        String normalizedItem = normalize(itemText);

        // Normal contains search
        if (normalizedItem.contains(searchText)) {
            return true;
        }

        // Check individual words
        String[] searchWords = searchText.split(" ");

        for (String word : searchWords) {
            if (!word.isBlank() && normalizedItem.contains(word)) {
                return true;
            }
        }

        // Check reversed word order
        String reversedSearch = reverseWords(searchText);

        return normalizedItem.contains(reversedSearch);
    }

    private String normalize(String text) {

        if (text == null) {
            return "";
        }

        return text
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    private String reverseWords(String text) {

        String[] words = text.split(" ");
        StringBuilder reversed = new StringBuilder();

        for (int i = words.length - 1; i >= 0; i--) {

            if (!words[i].isBlank()) {

                if (reversed.length() > 0) {
                    reversed.append(" ");
                }

                reversed.append(words[i]);
            }
        }

        return reversed.toString();
    }

    public List<Item> getUserItems(Long userId) {
        return itemRepository.findByUserId(userId);
    }
}