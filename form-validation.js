// Form Validation for Contact Form
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    // Form elements
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const subjectSelect = document.getElementById('contactSubject');
    const messageTextarea = document.getElementById('contactMessage');
    const agreeCheckbox = document.getElementById('agreeTerms');
    
    // Error message elements
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const subjectError = document.getElementById('subjectError');
    const messageError = document.getElementById('messageError');
    const agreeError = document.getElementById('agreeError');
    const formSuccess = document.getElementById('formSuccess');
    
    // Validation patterns
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const namePattern = /^[a-zA-Z\s]{2,50}$/;
    
    // Real-time validation
    nameInput.addEventListener('blur', () => validateName());
    emailInput.addEventListener('blur', () => validateEmail());
    subjectSelect.addEventListener('change', () => validateSubject());
    messageTextarea.addEventListener('blur', () => validateMessage());
    agreeCheckbox.addEventListener('change', () => validateAgree());
    
    // Input event for immediate feedback on typing
    nameInput.addEventListener('input', () => {
        if (nameInput.value.length >= 2) {
            clearError(nameError);
        }
    });
    
    emailInput.addEventListener('input', () => {
        if (emailPattern.test(emailInput.value)) {
            clearError(emailError);
        }
    });
    
    messageTextarea.addEventListener('input', () => {
        if (messageTextarea.value.length >= 10) {
            clearError(messageError);
        }
    });
    
    // Form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous messages
        formSuccess.classList.add('hidden');
        
        // Validate all fields
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isSubjectValid = validateSubject();
        const isMessageValid = validateMessage();
        const isAgreeValid = validateAgree();
        
        // Check if all validations passed
        if (isNameValid && isEmailValid && isSubjectValid && isMessageValid && isAgreeValid) {
            await submitForm();
        } else {
            showError(nameError, 'Please fix all errors before submitting.');
        }
    });
    
    // Validation functions
    function validateName() {
        const value = nameInput.value.trim();
        
        if (value === '') {
            showError(nameError, 'Name is required.');
            return false;
        }
        
        if (value.length < 2) {
            showError(nameError, 'Name must be at least 2 characters long.');
            return false;
        }
        
        if (!namePattern.test(value)) {
            showError(nameError, 'Name can only contain letters and spaces.');
            return false;
        }
        
        clearError(nameError);
        return true;
    }
    
    function validateEmail() {
        const value = emailInput.value.trim();
        
        if (value === '') {
            showError(emailError, 'Email is required.');
            return false;
        }
        
        if (!emailPattern.test(value)) {
            showError(emailError, 'Please enter a valid email address (e.g., user@example.com).');
            return false;
        }
        
        clearError(emailError);
        return true;
    }
    
    function validateSubject() {
        if (subjectSelect.value === '') {
            showError(subjectError, 'Please select a subject.');
            return false;
        }
        
        clearError(subjectError);
        return true;
    }
    
    function validateMessage() {
        const value = messageTextarea.value.trim();
        
        if (value === '') {
            showError(messageError, 'Message is required.');
            return false;
        }
        
        if (value.length < 10) {
            showError(messageError, 'Message must be at least 10 characters long.');
            return false;
        }
        
        if (value.length > 1000) {
            showError(messageError, 'Message must not exceed 1000 characters.');
            return false;
        }
        
        clearError(messageError);
        return true;
    }
    
    function validateAgree() {
        if (!agreeCheckbox.checked) {
            showError(agreeError, 'You must agree to the terms and conditions.');
            return false;
        }
        
        clearError(agreeError);
        return true;
    }
    
    // Helper functions
    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
        element.parentElement.querySelector('input, select, textarea')?.classList.add('error');
    }
    
    function clearError(element) {
        element.textContent = '';
        element.style.display = 'none';
        element.parentElement.querySelector('input, select, textarea')?.classList.remove('error');
    }
    
    // Form submission (simulated)
    async function submitForm() {
        try {
            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Get form data
            const formData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                subject: subjectSelect.value,
                message: messageTextarea.value.trim(),
                timestamp: new Date().toISOString()
            };
            
            // In a real application, you would send this data to a server
            console.log('Form submitted successfully:', formData);
            
            // Save to localStorage as demonstration
            const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
            submissions.push(formData);
            localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
            
            // Show success message
            formSuccess.textContent = `Thank you, ${formData.name}! Your message has been received. We'll get back to you soon at ${formData.email}.`;
            formSuccess.classList.remove('hidden');
            
            // Reset form
            contactForm.reset();
            
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
            // Scroll to success message
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showError(nameError, 'An error occurred. Please try again later.');
            
            // Reset button
            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Send Message';
            submitButton.disabled = false;
        }
    }
});
