package com.pubg.ethiopia.scanner;

public class ScanResult {
    public String status = "UNKNOWN"; // SUCCESS, ALREADY_CHECKED_IN, INVALID, VIP_UNAPPROVED, ERROR
    public String message = "";
    public String fullName = "";
    public String inGameName = "";
    public String pubgUid = "";
    public String ticketTier = "STANDARD"; // VIP or STANDARD
    public String referenceId = "";
    public String category = "";
    public String checkedInAt = "";
    public String checkedInBy = "";

    public boolean isSuccess() {
        return "SUCCESS".equalsIgnoreCase(status);
    }

    public boolean isVip() {
        return "VIP".equalsIgnoreCase(ticketTier);
    }

    public boolean isAlreadyCheckedIn() {
        return "ALREADY_CHECKED_IN".equalsIgnoreCase(status);
    }

    public boolean isInvalid() {
        return "INVALID".equalsIgnoreCase(status);
    }
}
