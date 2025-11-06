/**
 * Mirrors.js - Utility for generating temporary Google accounts
 * This module provides functions to create temporary email addresses
 * and generate account credentials for Google account creation
 */

/**
 * Generates a random temporary email address
 * @param {string} domain - Email domain (default: 'tempmail.com')
 * @returns {string} Generated email address
 */
function generateTempEmail(domain = 'tempmail.com') {
  const randomString = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  return `${randomString}${timestamp}@${domain}`;
}

/**
 * Generates a random password
 * @param {number} length - Password length (default: 12)
 * @returns {string} Generated password
 */
function generatePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Generates a random first name
 * @returns {string} Random first name
 */
function generateFirstName() {
  const firstNames = [
    'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
    'Blake', 'Cameron', 'Dakota', 'Emery', 'Finley', 'Harper', 'Hayden',
    'Jamie', 'Kai', 'Logan', 'Parker', 'Reese', 'River', 'Rowan', 'Sage',
    'Skyler', 'Spencer', 'Tatum', 'Willow', 'Zion', 'Aiden', 'Emma',
    'Olivia', 'Noah', 'Sophia', 'Liam', 'Isabella', 'Mason', 'Mia',
    'Ethan', 'Charlotte', 'James', 'Amelia', 'Benjamin', 'Harper'
  ];
  return firstNames[Math.floor(Math.random() * firstNames.length)];
}

/**
 * Generates a random last name
 * @returns {string} Random last name
 */
function generateLastName() {
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson',
    'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee',
    'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis',
    'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott',
    'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson'
  ];
  return lastNames[Math.floor(Math.random() * lastNames.length)];
}

/**
 * Generates a random birth date (18-65 years old)
 * @returns {Object} Birth date object with day, month, year
 */
function generateBirthDate() {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 65;
  const maxYear = currentYear - 18;
  const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
  const month = Math.floor(Math.random() * 12) + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  
  return {
    day: day.toString().padStart(2, '0'),
    month: month.toString().padStart(2, '0'),
    year: year.toString()
  };
}

/**
 * Generates a complete temporary Google account
 * @param {Object} options - Generation options
 * @param {string} options.emailDomain - Email domain to use
 * @param {number} options.passwordLength - Password length
 * @returns {Object} Generated account object
 */
function generateGoogleAccount(options = {}) {
  const {
    emailDomain = 'tempmail.com',
    passwordLength = 12
  } = options;

  const firstName = generateFirstName();
  const lastName = generateLastName();
  const email = generateTempEmail(emailDomain);
  const password = generatePassword(passwordLength);
  const birthDate = generateBirthDate();

  return {
    email,
    password,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    birthDate,
    createdAt: new Date().toISOString(),
    id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
  };
}

/**
 * Generates multiple accounts at once
 * @param {number} count - Number of accounts to generate
 * @param {Object} options - Generation options
 * @returns {Array} Array of generated accounts
 */
function generateMultipleAccounts(count = 1, options = {}) {
  const accounts = [];
  for (let i = 0; i < count; i++) {
    accounts.push(generateGoogleAccount(options));
  }
  return accounts;
}

module.exports = {
  generateTempEmail,
  generatePassword,
  generateFirstName,
  generateLastName,
  generateBirthDate,
  generateGoogleAccount,
  generateMultipleAccounts
};

