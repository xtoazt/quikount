/**
 * Mirrors.js - Utility for creating real Google accounts via Google Skills Boost
 * This module provides functions to create actual Google accounts through Quiklabs
 */

const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

// Set up chromium for Vercel
chromium.setGraphicsMode(false);

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
 * Creates a real Google account via Google Skills Boost
 * @param {Object} accountData - Account data to use for creation
 * @returns {Promise<Object>} Created account information
 */
async function createGoogleAccountViaSkillsBoost(accountData) {
  let browser;
  try {
    const isVercel = process.env.VERCEL === '1';
    
    browser = await puppeteer.launch({
      headless: true,
      args: isVercel 
        ? chromium.args 
        : ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: isVercel 
        ? await chromium.executablePath() 
        : undefined,
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Navigate to Google Skills Boost account creation
    await page.goto('https://www.cloudskillsboost.google/', { waitUntil: 'networkidle2' });
    
    // Click on sign up/create account
    await page.waitForSelector('a[href*="accounts.google.com"], button[data-signup]', { timeout: 10000 }).catch(() => {});
    
    // Navigate to Google account creation
    await page.goto('https://accounts.google.com/signup/v2/webcreateaccount?flowName=GlifWebSignIn&flowEntry=SignUp', { waitUntil: 'networkidle2' });
    
    // Fill in first name
    await page.waitForSelector('input[name="firstName"]', { timeout: 10000 });
    await page.type('input[name="firstName"]', accountData.firstName);
    
    // Fill in last name
    await page.type('input[name="lastName"]', accountData.lastName);
    
    // Fill in username (email)
    await page.type('input[name="Username"]', accountData.email.split('@')[0]);
    
    // Fill in password
    await page.type('input[name="Passwd"]', accountData.password);
    await page.type('input[name="ConfirmPasswd"]', accountData.password);
    
    // Click next
    await page.click('button[type="button"]:has-text("Next"), #next');
    await page.waitForTimeout(2000);
    
    // Fill in phone number (if required)
    try {
      await page.waitForSelector('input[type="tel"]', { timeout: 5000 });
      // Skip phone verification for now or use a service
      await page.click('button:has-text("Skip"), a:has-text("Skip")');
    } catch (e) {
      // Phone verification not required
    }
    
    // Fill in birth date
    await page.waitForSelector('select[name="month"]', { timeout: 10000 });
    await page.select('select[name="month"]', accountData.birthDate.month);
    await page.select('select[name="day"]', accountData.birthDate.day);
    await page.type('select[name="year"]', accountData.birthDate.year);
    
    // Select gender (optional)
    try {
      await page.select('select[name="gender"]', '1'); // Prefer not to say
    } catch (e) {
      // Gender field not present
    }
    
    // Click next to complete
    await page.click('button[type="button"]:has-text("Next"), #next');
    await page.waitForTimeout(3000);
    
    // Check if account was created successfully
    const success = await page.url().includes('accounts.google.com') && 
                   !page.url().includes('signup');
    
    if (success) {
      return {
        ...accountData,
        created: true,
        createdAt: new Date().toISOString(),
        id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
      };
    } else {
      throw new Error('Account creation may have failed');
    }
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generates account data and creates a real Google account
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Created account object
 */
async function generateGoogleAccount(options = {}) {
  const {
    emailDomain = 'gmail.com',
    passwordLength = 12
  } = options;

  const firstName = generateFirstName();
  const lastName = generateLastName();
  const email = generateTempEmail(emailDomain);
  const password = generatePassword(passwordLength);
  const birthDate = generateBirthDate();

  const accountData = {
    email,
    password,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    birthDate
  };

  // Create the actual account via Skills Boost
  return await createGoogleAccountViaSkillsBoost(accountData);
}

/**
 * Generates multiple accounts and creates them
 * @param {number} count - Number of accounts to generate
 * @param {Object} options - Generation options
 * @returns {Promise<Array>} Array of created accounts
 */
async function generateMultipleAccounts(count = 1, options = {}) {
  const accounts = [];
  for (let i = 0; i < count; i++) {
    try {
      const account = await generateGoogleAccount(options);
      accounts.push(account);
      // Add delay between account creations
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error(`Failed to create account ${i + 1}:`, error);
    }
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
  generateMultipleAccounts,
  createGoogleAccountViaSkillsBoost
};
