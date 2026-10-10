package com.campus.lostfound.controller;

import com.campus.lostfound.model.Item;
import com.campus.lostfound.service.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:5173")
public class ItemController {
    private final Cloudinary cloudinary;
    private final ItemService itemService;

    public ItemController(ItemService itemService, Cloudinary cloudinary) {
    this.itemService = itemService;
    this.cloudinary = cloudinary;
}

    @PostMapping
    public ResponseEntity<Item> createItem(@RequestBody Item item) {
        return ResponseEntity.ok(itemService.createItem(item));
    }

    @GetMapping
    public ResponseEntity<List<Item>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item item) {
        return ResponseEntity.ok(itemService.updateItem(id, item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.ok("Item deleted successfully");
    }

    @GetMapping("/search")
    public ResponseEntity<List<Item>> searchItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(itemService.search(category, location));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Item>> getUserItems(@PathVariable Long userId) {
        return ResponseEntity.ok(itemService.getUserItems(userId));
    }

@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> uploadMedia(@RequestParam("file") MultipartFile file) {
    try {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file");
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !(contentType.startsWith("image/") ||
                  contentType.startsWith("video/"))) {
            return ResponseEntity.badRequest()
                    .body("Only image and video files are allowed");
        }

        if (file.getSize() > 20 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body("File size must not exceed 20 MB");
        }

        String resourceType = contentType.startsWith("video/")
                ? "video" : "image";

        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", resourceType,
                        "folder", "campus-lost-found"
                )
        );

        return ResponseEntity.ok(Map.of(
                "mediaUrl", result.get("secure_url"),
                "mediaType", resourceType
        ));

   } catch (Exception e) {
    e.printStackTrace();
    return ResponseEntity.internalServerError()
            .body("Media upload failed: " + e.getMessage());
}
}
}
