// 1. Get all checkbox elements on the page.
const items = document.querySelectorAll('.menu-item input[type="checkbox"]');

// 2. Define the tax rate as a constant.
const TAX_RATE = 0.10; // 10%

// 3. Define the main function that performs the calculation.
function calculateOrder() {
    let subtotal = 0; // Initialize subtotal to zero.

    // 4. Loop through each checkbox.
    items.forEach(item => {
        // 5. Check if the current item is checked (selected).
        if (item.checked) {
            // 6. Get the parent div of the checkbox.
            const parentDiv = item.closest('.menu-item');
            
            // 7. Get the price from the 'data-price' HTML attribute, 
            //    and convert it from a string to a number (float).
            const price = parseFloat(parentDiv.getAttribute('data-price'));
            
            // 8. Add the item's price to the running subtotal.
            subtotal += price;
        }
    });

    // 9. Calculate the tax amount.
    const taxAmount = subtotal * TAX_RATE;

    // 10. Calculate the grand total.
    const grandTotal = subtotal + taxAmount;

    // 11. Helper function to format a number into currency ($X.XX).
    function formatCurrency(number) {
        return '$' + number.toFixed(2);
    }

    // 12. Update the HTML display elements with the calculated values.
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('tax').textContent = formatCurrency(taxAmount);
    document.getElementById('grand-total').textContent = formatCurrency(grandTotal);
}

// 13. Add an event listener to EVERY checkbox. 
//     When its state changes (is checked/unchecked), run the calculation.
items.forEach(item => {
    item.addEventListener('change', calculateOrder);
});

// 14. Run the calculation once on page load to ensure initial display is correct.
calculateOrder();