package com.example.demo.service;

import com.example.demo.dto.ReportResponse;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final VolunteerRepository volunteerRepository;
    private final ShelterRepository shelterRepository;
    private final InventoryRepository inventoryRepository;
    private final DonationRepository donationRepository;
    private final DistributionRepository distributionRepository;
    private final MissingPersonRepository missingPersonRepository;

    @Override
    @Transactional(readOnly = true)
    public ReportResponse getSummaryReport() {
        // 1. Volunteer Stats
        List<Volunteer> volunteers = volunteerRepository.findAll();
        long totalVol = volunteers.size();
        long availableVol = volunteers.stream().filter(v -> "AVAILABLE".equalsIgnoreCase(v.getStatus())).count();
        long busyVol = volunteers.stream().filter(v -> "BUSY".equalsIgnoreCase(v.getStatus())).count();
        long unavailableVol = volunteers.stream().filter(v -> "UNAVAILABLE".equalsIgnoreCase(v.getStatus())).count();

        // 2. Shelter Stats
        List<Shelter> shelters = shelterRepository.findAll();
        long totalShel = shelters.size();
        long totalCap = shelters.stream().mapToLong(Shelter::getCapacity).sum();
        long totalOcc = shelters.stream().mapToLong(Shelter::getOccupied).sum();
        long availBeds = Math.max(0, totalCap - totalOcc);
        long activeShel = shelters.stream().filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus())).count();
        long fullShel = shelters.stream().filter(s -> "FULL".equalsIgnoreCase(s.getStatus())).count();
        long inactiveShel = shelters.stream().filter(s -> "INACTIVE".equalsIgnoreCase(s.getStatus())).count();

        // 3. Inventory Stats
        List<Inventory> inventoryList = inventoryRepository.findAll();
        long totalInvItems = inventoryList.size();
        long totalInvQty = inventoryList.stream().mapToLong(Inventory::getQuantity).sum();
        long inStockInv = inventoryList.stream().filter(i -> "healthy".equalsIgnoreCase(i.getStatus())).count();
        long lowStockInv = inventoryList.stream().filter(i -> "low".equalsIgnoreCase(i.getStatus())).count();
        long outOfStockInv = inventoryList.stream().filter(i -> "critical".equalsIgnoreCase(i.getStatus())).count();

        // 4. Donation Stats
        List<Donation> donations = donationRepository.findAll();
        long totalDon = donations.size();
        double totalAmt = donations.stream()
                .filter(d -> "MONEY".equalsIgnoreCase(d.getDonationType()) && d.getAmount() != null)
                .mapToDouble(Donation::getAmount)
                .sum();
        long totalDonQty = donations.stream()
                .filter(d -> "ITEMS".equalsIgnoreCase(d.getDonationType()) && d.getQuantity() != null)
                .mapToLong(Donation::getQuantity)
                .sum();

        // 5. Distribution Stats
        List<Distribution> distributions = distributionRepository.findAll();
        long totalDist = distributions.size();
        long completedDist = distributions.stream().filter(d -> "COMPLETED".equalsIgnoreCase(d.getStatus())).count();
        long pendingDist = distributions.stream().filter(d -> "PENDING".equalsIgnoreCase(d.getStatus())).count();
        long cancelledDist = distributions.stream().filter(d -> "CANCELLED".equalsIgnoreCase(d.getStatus())).count();

        // 6. Missing Person Stats
        List<MissingPerson> missingList = missingPersonRepository.findAll();
        long totalMissing = missingList.size();
        long missingCount = missingList.stream().filter(m -> "MISSING".equalsIgnoreCase(m.getStatus())).count();
        long foundCount = missingList.stream().filter(m -> "FOUND".equalsIgnoreCase(m.getStatus())).count();
        long reunitedCount = missingList.stream().filter(m -> "REUNITED".equalsIgnoreCase(m.getStatus())).count();

        return ReportResponse.builder()
                .totalVolunteers(totalVol)
                .availableVolunteers(availableVol)
                .busyVolunteers(busyVol)
                .unavailableVolunteers(unavailableVol)
                .totalShelters(totalShel)
                .shelterTotalCapacity(totalCap)
                .shelterTotalOccupied(totalOcc)
                .shelterAvailableBeds(availBeds)
                .activeShelters(activeShel)
                .fullShelters(fullShel)
                .inactiveShelters(inactiveShel)
                .totalInventoryItems(totalInvItems)
                .totalInventoryQuantity(totalInvQty)
                .inStockInventoryItems(inStockInv)
                .lowStockInventoryItems(lowStockInv)
                .outOfStockInventoryItems(outOfStockInv)
                .totalDonations(totalDon)
                .totalDonatedAmount(totalAmt)
                .totalDonatedItemsQuantity(totalDonQty)
                .totalDistributions(totalDist)
                .completedDistributions(completedDist)
                .pendingDistributions(pendingDist)
                .cancelledDistributions(cancelledDist)
                .totalMissingReports(totalMissing)
                .missingPersons(missingCount)
                .foundPersons(foundCount)
                .reunitedPersons(reunitedCount)
                .build();
    }
}
