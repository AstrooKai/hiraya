// We use $(document).ready so our code only runs after the page is fully loaded
$(document).ready(function () {

    // 1. Get the cart from the browser's local storage.
    // If it's empty or doesn't exist, we start with an empty array []
    let cartString = localStorage.getItem("cart");
    let cart = [];
    if (cartString !== null) {
        cart = JSON.parse(cartString);
    }

    // 2. Get the reviews from local storage.
    let reviewString = localStorage.getItem("reviews");
    let reviews = [];
    if (reviewString !== null) {
        reviews = JSON.parse(reviewString);
    } else {
        // If there are no reviews yet, provide some dummy data
        reviews = [
            { name: "Anna R.", rating: 5, comment: "The Mutya Dress 38 looks far more expensive than it is. Arrived in 3 days.", date: "12 Sep 2026" },
            { name: "Miguel T.", rating: 4, comment: "The Alon Diver 42 is solid. The strap was stiff at first but softened up.", date: "20 Sep 2026" }
        ];
    }

    // A simple function to show a message to the user
    function showMessage(message, type) {
        // Remove old colors, add the new color, set the text
        $("#message").removeClass("d-none alert-success alert-danger").addClass("alert-" + type).text(message);
    }

    // A simple function to format numbers as Philippine Peso
    function formatPeso(amount) {
        return "\u20B1" + amount.toFixed(2); // .toFixed(2) ensures it has 2 decimal places
    }

    // A function to count how many items are in the cart
    function updateCartCount() {
        let count = 0;
        // Loop through everything in the cart
        for (let i = 0; i < cart.length; i++) {
            count = count + cart[i].qty;
        }
        // Update the number in the navbar
        $("#cartCount").text(count);
    }

    // A function to save the cart so it doesn't disappear when you refresh
    function saveCart() {
        let stringToSave = JSON.stringify(cart);
        localStorage.setItem("cart", stringToSave);
        updateCartCount(); // Update the navbar number whenever we save
    }

    // This happens when the user clicks the "Add to cart" button on a product
    $(".add-to-cart").click(function () {
        // Get information from the button that was clicked
        let id = Number($(this).data("id"));
        let name = $(this).data("name");
        let price = Number($(this).data("price"));

        // Check if the item is already in our cart
        let found = false;
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id === id) {
                // If it is, just add 1 to the quantity
                cart[i].qty = cart[i].qty + 1;
                found = true;
                break; // Stop looking because we found it
            }
        }

        // If we looked through the whole cart and didn't find it, add it as a new item
        if (found === false) {
            let newItem = { id: id, name: name, price: price, qty: 1 };
            cart.push(newItem);
        }

        // Save the updated cart and tell the user it was successful
        saveCart();
        showMessage(name + " was added to your cart.", "success");
    });

    // This function builds the table inside the Cart page
    function displayCart() {
        let rowsHtml = "";
        let totalAmount = 0;

        // Loop through all items in the cart
        for (let i = 0; i < cart.length; i++) {
            let item = cart[i];
            let subtotal = item.price * item.qty;
            totalAmount = totalAmount + subtotal;

            // Build the HTML row using a template literal
            rowsHtml += `
                <tr>
                    <td>${item.name}</td>
                    <td>${formatPeso(item.price)}</td>
                    <td>
                        <button type='button' class='btn btn-outline-dark btn-sm decrease' data-index='${i}'>-</button>
                        <span class='mx-2'>${item.qty}</span>
                        <button type='button' class='btn btn-outline-dark btn-sm increase' data-index='${i}'>+</button>
                    </td>
                    <td>${formatPeso(subtotal)}</td>
                    <td><button type='button' class='btn btn-danger btn-sm remove' data-index='${i}'>Remove</button></td>
                </tr>
            `;
        }

        // If the cart is empty, show a message instead of an empty table
        if (cart.length === 0) {
            rowsHtml = `
                <tr>
                    <td colspan='5' class='text-center text-secondary'>Your cart is empty.</td>
                </tr>
            `;
        }

        // Put our HTML inside the table
        $("#cart-items").html(rowsHtml);
        // Show the total price
        $("#total").text(formatPeso(totalAmount));
    }

    // Only run this code if we are on the Cart page (where #cart-items exists)
    if ($("#cart-items").length > 0) {

        // When the user clicks the '+' button
        $("#cart-items").on("click", ".increase", function () {
            let index = Number($(this).attr("data-index"));
            cart[index].qty = cart[index].qty + 1;
            saveCart();
            displayCart(); // Redraw the table
        });

        // When the user clicks the '-' button
        $("#cart-items").on("click", ".decrease", function () {
            let index = Number($(this).attr("data-index"));
            cart[index].qty = cart[index].qty - 1;
            
            // If the quantity drops to zero, remove the item completely
            if (cart[index].qty === 0) {
                cart.splice(index, 1); // splice removes an item from the array
            }
            saveCart();
            displayCart(); // Redraw the table
        });

        // When the user clicks the 'Remove' button
        $("#cart-items").on("click", ".remove", function () {
            let index = Number($(this).attr("data-index"));
            cart.splice(index, 1);
            saveCart();
            displayCart(); // Redraw the table
        });

        // When the user clicks 'Clear Cart'
        $("#clear-cart").click(function () {
            if (cart.length === 0) {
                showMessage("Your cart is already empty.", "danger");
                return;
            }
            cart = []; // empty the array
            saveCart();
            displayCart();
            showMessage("Your cart was cleared.", "success");
        });

        // When the user clicks 'Place Order'
        $("#place-order").click(function () {
            if (cart.length === 0) {
                showMessage("Your cart is empty. Add a watch first.", "danger");
                return;
            }
            cart = []; // empty the array
            saveCart();
            displayCart();
            showMessage("Thank you! Your order was placed successfully.", "success");
        });

        // Actually display the cart when the page first loads
        displayCart();
    }

    // This function builds the reviews on the Reviews page
    function displayReviews() {
        let reviewsHtml = "";

        // If there are no reviews, show a nice message
        if (reviews.length === 0) {
            reviewsHtml = `
                <div class='text-center py-4'>
                    <h5 class='text-secondary'>No Reviews Yet</h5>
                    <p class='text-secondary mb-0'>Be the first to share your experience!</p>
                </div>
            `;
            $("#reviewsList").html(reviewsHtml);
            $("#averageRating").text("0.0");
            $("#reviewCount").text("0");
            return; // Stop the function early
        }

        let totalRating = 0;

        // Loop through all reviews
        for (let i = 0; i < reviews.length; i++) {
            let review = reviews[i];
            totalRating = totalRating + review.rating;

            // Generate the stars manually (e.g. 4 solid stars, 1 empty star)
            let stars = "";
            for (let j = 0; j < 5; j++) {
                if (j < review.rating) {
                    stars += "\u2605"; // Solid star symbol
                } else {
                    stars += "\u2606"; // Empty star symbol
                }
            }

            // Build the HTML for the review card using a template literal (backticks)
            reviewsHtml += `
                <div class='card border mb-3'>
                    <div class='card-body'>
                        <div class='d-flex justify-content-between align-items-center mb-2'>
                            <h5 class='card-title fw-bold'>${review.name}</h5>
                            <button class='btn btn-outline-danger btn-sm delete-review' data-index='${i}'>Delete</button>
                        </div>
                        <h5 class='text-warning'>${stars}</h5>
                        <p class='card-text'>${review.comment}</p>
                        <small class='text-secondary'>Posted on: ${review.date}</small>
                    </div>
                </div>
            `;
        }

        // Put the HTML on the page
        $("#reviewsList").html(reviewsHtml);

        // Calculate the average rating and display it
        let average = totalRating / reviews.length;
        $("#averageRating").text(average.toFixed(1));
        $("#reviewCount").text(reviews.length);
    }

    // Only run this code if we are on the Reviews page
    if ($("#reviewForm").length > 0) {

        // When the user clicks 'Submit Review'
        $("#reviewForm").submit(function (event) {
            event.preventDefault(); // Stop the page from reloading

            let name = $("#reviewerName").val().trim();
            let rating = Number($("#rating").val());
            let reviewText = $("#reviewText").val().trim();

            // Check for errors
            if (name === "" || rating < 1 || rating > 5 || reviewText === "") {
                showMessage("Please complete all fields correctly.", "danger");
                return;
            }

            // Get the current date formatted as '12 Sep 2026'
            let dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
            let today = new Date().toLocaleDateString('en-GB', dateOptions);

            // Add the new review to the array
            let newReview = {
                name: name,
                rating: rating,
                comment: reviewText,
                date: today
            };
            reviews.push(newReview);
            
            // Save to local storage
            localStorage.setItem("reviews", JSON.stringify(reviews));

            displayReviews(); // Redraw the reviews
            $("#reviewForm")[0].reset(); // Clear the form
            showMessage("Thank you! Your review was submitted successfully.", "success");
        });

        // When the user clicks the 'Delete' button on a review
        $("#reviewsList").on("click", ".delete-review", function () {
            let index = Number($(this).attr("data-index"));
            reviews.splice(index, 1); // Remove the review from the array
            localStorage.setItem("reviews", JSON.stringify(reviews)); // Save

            displayReviews(); // Redraw the reviews
            showMessage("Review deleted successfully.", "success");
        });

        // Actually display the reviews when the page first loads
        displayReviews();
    }

    // Only run this code if we are on the Contact page
    if ($("#contactForm").length > 0) {
        
        // When the user clicks 'Send message'
        $("#contactForm").submit(function (event) {
            event.preventDefault(); // Stop the page from reloading

            let name = $("#contactName").val().trim();
            let email = $("#contactEmail").val().trim();
            let message = $("#contactMessage").val().trim();

            // Simple check: make sure they aren't empty and email has an @
            if (name === "" || email === "" || message === "" || email.indexOf("@") === -1) {
                showMessage("Please fill in every box with a valid email.", "danger");
                return;
            }

            $("#contactForm")[0].reset(); // Clear the form
            showMessage("Thanks, " + name + "! We got your message and will reply soon.", "success");
        });
    }

    // Make sure the cart count in the navbar is correct on every page
    updateCartCount();
});