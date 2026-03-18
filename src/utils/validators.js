// Email validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Password validation
export const validatePassword = (password) => {
  return password.length >= 6;
};

// Form field validation
export const validateField = (name, value) => {
  let error = '';

  switch (name) {
    case 'email':
      if (!value) {
        error = 'Email is required';
      } else if (!validateEmail(value)) {
        error = 'Please enter a valid email';
      }
      break;

    case 'password':
      if (!value) {
        error = 'Password is required';
      } else if (!validatePassword(value)) {
        error = 'Password must be at least 6 characters';
      }
      break;

    case 'confirmPassword':
      if (!value) {
        error = 'Please confirm your password';
      }
      break;

    case 'name':
      if (!value) {
        error = 'Name is required';
      } else if (value.length < 2) {
        error = 'Name must be at least 2 characters';
      }
      break;

    case 'phone':
      if (!value) {
        error = 'Phone number is required';
      } else if (!/^[0-9]{10}$/.test(value.replace(/\D/g, ''))) {
        error = 'Please enter a valid phone number';
      }
      break;

    case 'address':
      if (!value) {
        error = 'Address is required';
      } else if (value.length < 5) {
        error = 'Please enter a complete address';
      }
      break;

    case 'city':
      if (!value) {
        error = 'City is required';
      }
      break;

    case 'state':
      if (!value) {
        error = 'State is required';
      }
      break;

    case 'zipcode':
      if (!value) {
        error = 'Zip code is required';
      } else if (!/^[0-9]{5,6}$/.test(value)) {
        error = 'Please enter a valid zip code';
      }
      break;

    case 'cardNumber':
      if (!value) {
        error = 'Card number is required';
      } else if (!/^[0-9]{16}$/.test(value.replace(/\s/g, ''))) {
        error = 'Please enter a valid card number';
      }
      break;

    case 'cardExpiry':
      if (!value) {
        error = 'Expiry date is required';
      } else if (!/^[0-9]{2}\/[0-9]{2}$/.test(value)) {
        error = 'Format: MM/YY';
      }
      break;

    case 'cardCVV':
      if (!value) {
        error = 'CVV is required';
      } else if (!/^[0-9]{3,4}$/.test(value)) {
        error = 'Please enter a valid CVV';
      }
      break;

    default:
      break;
  }

  return error;
};

// Validate entire form
export const validateForm = (formData, requiredFields) => {
  const errors = {};

  requiredFields.forEach(field => {
    const error = validateField(field, formData[field] || '');
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

// Truncate text
export const truncateText = (text, length) => {
  if (text.length > length) {
    return text.substring(0, length) + '...';
  }
  return text;
};
