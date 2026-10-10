
package com.campus.lostfound.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String itemName;
    private String category;

    @Column(length = 1000)
    private String description;

    private LocalDate date;
    private String location;
    private String type;
    private String status;
    private String contactName;
    private String contactEmail;
    private Long userId;
    @Column(length = 1000000)
private String mediaUrl;

private String mediaType;

    public Item() {
    }

    public Long getId() {
        return id;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
    public String getMediaUrl() {
    return mediaUrl;
}

public void setMediaUrl(String mediaUrl) {
    this.mediaUrl = mediaUrl;
}

public String getMediaType() {
    return mediaType;
}

public void setMediaType(String mediaType) {
    this.mediaType = mediaType;
}
}
