window.onload = function() {
    var checkbox = document.getElementById('same_billing_delivery_address');
    var deliveryAddress = document.getElementById('delivery_address');

    checkbox.addEventListener('change', function() {
        if(this.checked) {
            deliveryAddress.style.display = 'none';
        } else {
            deliveryAddress.style.display = 'block';
        }
    });
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm_password');

    confirmPassword.oninput = function() {
        if (password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity('Passwords do not match.');
        } else {
            confirmPassword.setCustomValidity('');
        }
    };
}