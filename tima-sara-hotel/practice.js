// Hotel Variables Practice

// Things that dont change (const)
const hotelName = "Tima Sara Hotel";
const hotelAddress = "Tamale, Ghana";
const maxRooms = 20

// Things that change (let)
let currentGuests = 5
let availableRooms = maxRooms - currentGuests;

console.log(`${hotelName} is located in ${hotelAddress}`);
console.log(`We have ${availableRooms} rooms available out of ${maxRooms} total.`);

// Simulate a booking
currentGuests = currentGuests + 1;
availableRooms = maxRooms - currentGuests;
console.log(`After booking: ${availableRooms} rooms available`);


// Hotel Management System - Practice

// Room data
const rooms = [
    { id: 1, type: "Standard", price: 100, isAvailable: true },
    { id: 2, type: "Standard", price: 100, isAvailable: false },
    { id: 3, type: "Deluxe", price: 150, isAvailable: true },
    { id: 4, type: "Suite", price: 250, isAvailable: true }
];

// Function: Get available rooms
const getAvailableRooms = (rooms) => {
    return rooms.filter(room => room.isAvailable);
};

// Function: Calculate booking total
const calculateBooking = (roomPrice, nights, includeBreakfast = false) => {
    let total = roomPrice * nights;
    
    if (includeBreakfast) {
        total += nights * 15; // $15 per night for breakfast
    }
    
    const tax = total * 0.15;
    return total + tax;
};

// Function: Find cheapest available room
const findCheapestRoom = (rooms) => {
    const available = getAvailableRooms(rooms);
    if (available.length === 0) return null;
    
    return available.reduce((cheapest, room) => {
        return room.price < cheapest.price ? room : cheapest;
    });
};

// Test the functions
console.log("=== AVAILABLE ROOMS ===");
const available = getAvailableRooms(rooms);
available.forEach(room => {
    console.log(`Room ${room.id}: ${room.type} - $${room.price}/night`);
});

console.log("\n=== BOOKING CALCULATION ===");
const booking1 = calculateBooking(150, 3, false);
console.log(`3 nights, no breakfast: $${booking1.toFixed(2)}`);

const booking2 = calculateBooking(150, 3, true);
console.log(`3 nights, with breakfast: $${booking2.toFixed(2)}`);

console.log("\n=== CHEAPEST ROOM ===");
const cheapest = findCheapestRoom(rooms);
if (cheapest) {
    console.log(`${cheapest.type} - $${cheapest.price}/night`);
}