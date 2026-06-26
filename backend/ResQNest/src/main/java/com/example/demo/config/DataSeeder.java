package com.example.demo.config;

import com.example.demo.entity.Inventory;
import com.example.demo.entity.Shelter;
import com.example.demo.entity.Volunteer;
import com.example.demo.repository.InventoryRepository;
import com.example.demo.repository.ShelterRepository;
import com.example.demo.repository.VolunteerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final ShelterRepository shelterRepository;
    private final VolunteerRepository volunteerRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    public void run(String... args) throws Exception {
        seedShelters();
        seedVolunteers();
        seedInventory();
    }

    private void seedShelters() {
        if (shelterRepository.count() == 0) {
            log.info("Database empty. Seeding sample shelters...");
            Shelter s1 = Shelter.builder()
                    .name("Shelter Alpha (City Gymnasium)")
                    .address("12 Civic Plaza, Metro City")
                    .latitude(12.9716)
                    .longitude(77.5946)
                    .capacity(100)
                    .occupied(40)
                    .status("ACTIVE")
                    .contactPhone("+1 555 1010")
                    .amenities("Water, Power Generators, Cots, Food Station")
                    .build();

            Shelter s2 = Shelter.builder()
                    .name("Shelter Beta (Community Health Clinic)")
                    .address("44 Hope Ave, Metro City")
                    .latitude(12.9720)
                    .longitude(77.5950)
                    .capacity(50)
                    .occupied(50) // Full
                    .status("FULL")
                    .contactPhone("+1 555 2020")
                    .amenities("Medical supplies, Quarantine rooms, Doctor on site")
                    .build();

            Shelter s3 = Shelter.builder()
                    .name("Shelter Gamma (North Ridge High School)")
                    .address("800 School Road, North Suburbs")
                    .latitude(12.9750)
                    .longitude(77.5990)
                    .capacity(80)
                    .occupied(0)
                    .status("ACTIVE")
                    .contactPhone("+1 555 3030")
                    .amenities("Kitchen, Parking, Large sleeping mats")
                    .build();

            shelterRepository.saveAll(List.of(s1, s2, s3));
            log.info("Shelter seeding complete.");
        }
    }

    private void seedVolunteers() {
        if (volunteerRepository.count() == 0) {
            log.info("Database empty. Seeding sample volunteers...");
            Volunteer v1 = Volunteer.builder()
                    .name("Alice Smith")
                    .email("alice@volunteer.com")
                    .phone("+1 555 0101")
                    .status("AVAILABLE")
                    .skills("First Aid, CPR, Navigation, Logistics")
                    .latitude(12.9710)
                    .longitude(77.5930)
                    .availabilityDetails("Available evenings and weekends")
                    .build();

            Volunteer v2 = Volunteer.builder()
                    .name("Bob Johnson")
                    .email("bob@volunteer.com")
                    .phone("+1 555 0102")
                    .status("BUSY")
                    .skills("Heavy Machinery, Heavy Lifting, Search & Rescue")
                    .latitude(12.9730)
                    .longitude(77.5960)
                    .availabilityDetails("Currently on active mission")
                    .build();

            Volunteer v3 = Volunteer.builder()
                    .name("Charlie Brown")
                    .email("charlie@volunteer.com")
                    .phone("+1 555 0103")
                    .status("UNAVAILABLE")
                    .skills("Cooking, Translation, Child Care")
                    .latitude(12.9780)
                    .longitude(77.5980)
                    .availabilityDetails("Unavailable until Monday")
                    .build();

            volunteerRepository.saveAll(List.of(v1, v2, v3));
            log.info("Volunteer seeding complete.");
        }
    }

    private void seedInventory() {
        if (inventoryRepository.count() == 0) {
            log.info("Database empty. Seeding sample inventory items...");
            
            // 2 items below threshold (will trigger alerts)
            Inventory i1 = Inventory.builder()
                    .itemName("Water Bottle Packs (24-pack)")
                    .quantity(30)
                    .threshold(100) // Alert!
                    .category("Water")
                    .unit("Packs")
                    .build();

            Inventory i2 = Inventory.builder()
                    .itemName("Trauma First Aid Kits")
                    .quantity(8)
                    .threshold(20) // Alert!
                    .category("Medical")
                    .unit("Kits")
                    .build();

            // 2 items above threshold (healthy stock)
            Inventory i3 = Inventory.builder()
                    .itemName("Heavy Woolen Blankets")
                    .quantity(150)
                    .threshold(50)
                    .category("Bedding")
                    .unit("Blankets")
                    .build();

            Inventory i4 = Inventory.builder()
                    .itemName("High-Calorie Canned Food (24-pack)")
                    .quantity(200)
                    .threshold(80)
                    .category("Food")
                    .unit("Boxes")
                    .build();

            inventoryRepository.saveAll(List.of(i1, i2, i3, i4));
            log.info("Inventory seeding complete.");
        }
    }
}
