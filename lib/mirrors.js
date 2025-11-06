/**
 * Mirrors.js - Utility for creating real Google accounts via Google Skills Boost
 * This module provides functions to create actual Google accounts through Quiklabs
 */

let puppeteer;
let chromium;

try {
  puppeteer = require('puppeteer-core');
} catch (e) {
  try {
    puppeteer = require('puppeteer');
  } catch (e2) {
    throw new Error(`Puppeteer is required but not available: ${e2.message}`);
  }
}

// Always try to load chromium for serverless environments
// Try the min version first (smaller, faster), then fall back to full version
try {
  chromium = require('@sparticuz/chromium-min');
  console.log('Loaded @sparticuz/chromium-min');
} catch (e) {
  try {
    chromium = require('@sparticuz/chromium');
    console.log('Loaded @sparticuz/chromium');
  } catch (e2) {
    // Only warn in local dev, but this is required for Vercel
    if (process.env.VERCEL === '1') {
      console.warn('Chromium not available on Vercel - this may cause issues:', e2.message);
    } else {
      console.warn('Chromium not available (this is OK for local development):', e2.message);
    }
  }
}

/**
 * Generates a Quiklabs student email address
 * Format: student-XX-{random}@qwiklabs.net
 * @param {number} studentNumber - Student number (default: random 01-99)
 * @returns {string} Generated Quiklabs email address
 */
function generateQuiklabsEmail(studentNumber = null) {
  if (studentNumber === null) {
    studentNumber = Math.floor(Math.random() * 99) + 1;
  }
  const randomString = Math.random().toString(36).substring(2, 15);
  const studentNum = studentNumber.toString().padStart(2, '0');
  return `student-${studentNum}-${randomString}@qwiklabs.net`;
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

// Removed name and date generation - not needed for Quiklabs accounts

/**
 * Creates a real Quiklabs account by starting a lab
 * This calls the Quiklabs API to start a lab, which creates the student account
 * @param {Object} accountData - Account data (email and password)
 * @returns {Promise<Object>} Created account information
 */
async function createQuiklabsAccount(accountData) {
  // Always use Puppeteer - fail if not available
  if (!puppeteer) {
    throw new Error('Puppeteer is required but not available. Please install puppeteer-core or puppeteer.');
  }

  let browser;
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} to create Quiklabs account...`);
      
      const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
      
      let executablePath;
      let launchArgs;
      
      if (isVercel) {
        if (!chromium) {
          throw new Error('@sparticuz/chromium is required for Vercel deployment but is not available. Please install it: npm install @sparticuz/chromium');
        }
        
        try {
          // Set up Chromium for Vercel/serverless
          if (chromium.setGraphicsMode) {
            chromium.setGraphicsMode(false);
          }
          
          // Get executable path - @sparticuz/chromium handles library paths automatically
          // This should return a path to a self-contained Chromium binary
          executablePath = await chromium.executablePath();
          
          console.log('Chromium executable path:', executablePath);
          
          // Verify the executable exists and is accessible
          const fs = require('fs');
          if (!fs.existsSync(executablePath)) {
            throw new Error(`Chromium executable not found at: ${executablePath}. Make sure @sparticuz/chromium is properly installed.`);
          }
          
          // Check file permissions
          const stats = fs.statSync(executablePath);
          console.log('Chromium executable stats:', {
            size: stats.size,
            mode: stats.mode.toString(8),
            isFile: stats.isFile()
          });
          
          // Make sure it's executable (if not already)
          try {
            if ((stats.mode & parseInt('111', 8)) === 0) {
              fs.chmodSync(executablePath, '755');
              console.log('Set executable permissions on Chromium');
            }
          } catch (e) {
            console.warn('Could not set executable permissions:', e.message);
          }
          
          // Use Chromium's built-in args - these are optimized for serverless
          // chromium.args should already include all necessary flags
          launchArgs = chromium.args;
          
          if (!launchArgs || launchArgs.length === 0) {
            // Fallback if args are not available
            launchArgs = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-default-apps',
            '--disable-features=TranslateUI',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--disable-sync',
            '--disable-translate',
            '--metrics-recording-only',
            '--no-first-run',
            '--safebrowsing-disable-auto-update',
            '--enable-automation',
            '--password-store=basic',
            '--use-mock-keychain',
            '--single-process'
          ];
          }
          
          console.log('Using Chromium executable path for Vercel:', executablePath);
          console.log('Chromium args count:', launchArgs.length);
          console.log('First few args:', launchArgs.slice(0, 5));
        } catch (e) {
          console.error('Chromium setup error:', e.message);
          console.error('Error stack:', e.stack);
          throw new Error(`Chromium setup failed: ${e.message}. Make sure @sparticuz/chromium is properly installed and compatible with Vercel.`);
        }
      } else {
        // Local development
        launchArgs = [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions'
        ];
      }
      
      browser = await puppeteer.launch({
        headless: true,
        args: launchArgs,
        executablePath: executablePath,
        timeout: 60000,
        ignoreHTTPSErrors: true,
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Navigate to Quiklabs/Skills Boost catalog
      console.log('Navigating to Quiklabs...');
      await page.goto('https://www.cloudskillsboost.google/catalog', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
      });
      
      // Wait for page to load
      await page.waitForTimeout(3000);
      
      // Look for free labs - try multiple selectors
      console.log('Looking for free labs...');
      const labSelectors = [
        'ql-activity-card[data-cost="0"]',
        'ql-activity-card:has-text("No cost")',
        '.activity-card[data-cost="0"]',
        '[data-lab-id]',
        'a[href*="/focuses/"]',
        'ql-activity-card'
      ];
      
      let labFound = false;
      for (const selector of labSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          console.log(`Found lab with selector: ${selector}`);
          await page.click(selector);
          labFound = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!labFound) {
        throw new Error('Could not find a free lab to start');
      }
      
      await page.waitForTimeout(3000);
      
      // Wait for lab page to load
      await page.waitForSelector('ql-lab-control-panel, ql-lab-control-button, [data-lab-instance-id]', { 
        timeout: 15000 
      });
      
      // Look for Start Lab button - try multiple selectors
      console.log('Looking for Start Lab button...');
      const startButtonSelectors = [
        'ql-lab-control-button[data-action="start"]',
        'ql-lab-control-button:has-text("Start")',
        'button[data-start-lab]',
        'button:has-text("Start Lab")',
        '#start-lab',
        'ql-button[label*="Start"]'
      ];
      
      let buttonFound = false;
      for (const selector of startButtonSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          console.log(`Found start button with selector: ${selector}`);
          await page.click(selector);
          buttonFound = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!buttonFound) {
        // Check if lab is already running
        const isRunning = await page.evaluate(() => {
          return document.querySelector('[data-lab-instance-id]') !== null ||
                 document.querySelector('[data-username]') !== null;
        });
        
        if (isRunning) {
          console.log('Lab appears to already be running');
        } else {
          throw new Error('Could not find Start Lab button');
        }
      } else {
        // Wait for lab to start
        console.log('Waiting for lab to start...');
        await page.waitForTimeout(5000);
      }
      
      // Wait for credentials to appear - try multiple selectors
      console.log('Waiting for credentials...');
      const credentialSelectors = [
        '[data-username]',
        '[data-property="username"]',
        '.username',
        'input[value*="@qwiklabs.net"]',
        '[label="Username"]',
        'ql-code-block:has-text("@qwiklabs.net")'
      ];
      
      let credentialsFound = false;
      for (const selector of credentialSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 10000 });
          credentialsFound = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!credentialsFound) {
        // Try waiting a bit more
        await page.waitForTimeout(5000);
      }
      
      // Extract credentials from the page - try multiple methods
      console.log('Extracting credentials...');
      const credentials = await page.evaluate(() => {
        // Method 1: Look for data attributes
        const usernameEl = document.querySelector('[data-username], [data-property="username"]');
        const passwordEl = document.querySelector('[data-password], [data-property="password"]');
        
        if (usernameEl && passwordEl) {
          return {
            username: usernameEl.textContent || usernameEl.value || usernameEl.getAttribute('data-username'),
            password: passwordEl.textContent || passwordEl.value || passwordEl.getAttribute('data-password')
          };
        }
        
        // Method 2: Look for lab control panel (most reliable based on test.html)
        const controlPanel = document.querySelector('ql-lab-control-panel');
        if (controlPanel) {
          // Try labDetails attribute (JSON string)
          const labDetails = controlPanel.getAttribute('labDetails');
          if (labDetails) {
            try {
              const details = JSON.parse(labDetails);
              const userDetail = details.find(d => 
                (d.property === 'username' || d.label === 'Username' || d.property === 'user_0') &&
                d.value && d.value.includes('@qwiklabs.net')
              );
              const passDetail = details.find(d => 
                (d.property === 'password' || d.label === 'Password' || d.property === 'user_0') &&
                d.value && d.value.length >= 8
              );
              if (userDetail && passDetail) {
                return {
                  username: userDetail.value,
                  password: passDetail.value
                };
              }
            } catch (e) {
              console.error('Failed to parse labDetails:', e);
            }
          }
          
          // Also check for credential elements inside the panel
          const usernameInput = controlPanel.querySelector('input[value*="@qwiklabs.net"]');
          const passwordInput = controlPanel.querySelector('input[type="password"], input[value*=""]');
          if (usernameInput && passwordInput) {
            return {
              username: usernameInput.value,
              password: passwordInput.value
            };
          }
        }
        
        // Method 3: Look for code blocks with credentials
        const codeBlocks = Array.from(document.querySelectorAll('ql-code-block, code, pre'));
        for (const block of codeBlocks) {
          const text = block.textContent || '';
          if (text.includes('@qwiklabs.net')) {
            const lines = text.split('\n');
            let username = null;
            let password = null;
            for (const line of lines) {
              if (line.includes('@qwiklabs.net')) {
                username = line.trim();
              } else if (line.length > 8 && !line.includes('@')) {
                password = line.trim();
              }
            }
            if (username && password) {
              return { username, password };
            }
          }
        }
        
        // Method 4: Look for any text containing qwiklabs.net
        const allText = document.body.innerText;
        const emailMatch = allText.match(/(student-\d+-\w+@qwiklabs\.net)/);
        if (emailMatch) {
          // Try to find password nearby
          const lines = allText.split('\n');
          const emailIndex = lines.findIndex(l => l.includes(emailMatch[1]));
          if (emailIndex >= 0) {
            // Look for password in nearby lines
            for (let i = Math.max(0, emailIndex - 5); i < Math.min(lines.length, emailIndex + 5); i++) {
              const line = lines[i].trim();
              if (line.length >= 8 && line.length <= 20 && !line.includes('@') && !line.includes(' ')) {
                return {
                  username: emailMatch[1],
                  password: line
                };
              }
            }
          }
        }
        
        return null;
      });
      
      if (credentials && credentials.username && credentials.password) {
        console.log('Successfully extracted credentials:', {
          email: credentials.username,
          passwordLength: credentials.password.length
        });
        await browser.close();
        return {
          email: credentials.username,
          password: credentials.password,
          created: true,
          createdAt: new Date().toISOString(),
          id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
        };
      } else {
        // Debug: Log page content for troubleshooting
        const pageContent = await page.evaluate(() => {
          return {
            url: window.location.href,
            hasControlPanel: !!document.querySelector('ql-lab-control-panel'),
            hasLabDetails: !!document.querySelector('ql-lab-control-panel')?.getAttribute('labDetails'),
            bodyText: document.body.innerText.substring(0, 500)
          };
        });
        console.error('Could not extract credentials. Page state:', pageContent);
        
        // Take a screenshot for debugging (save to logs)
        try {
          const screenshot = await page.screenshot({ encoding: 'base64', fullPage: false });
          console.error('Screenshot taken (base64 length:', screenshot.length, ')');
        } catch (e) {
          console.warn('Could not take screenshot:', e.message);
        }
        
        throw new Error(`Could not extract credentials from lab page. URL: ${pageContent.url}. Has control panel: ${pageContent.hasControlPanel}`);
      }
      
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          console.warn('Error closing browser:', e);
        }
        browser = null;
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(`Failed to create account after ${maxRetries} attempts. Last error: ${error.message}`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
  
  // Should never reach here, but just in case
  throw lastError || new Error('Failed to create account');
}

/**
 * Generates account data and creates a real Quiklabs account
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Created account object
 */
async function generateGoogleAccount(options = {}) {
  const {
    passwordLength = 12,
    studentNumber = null
  } = options;

  // Generate Quiklabs email in correct format
  const email = generateQuiklabsEmail(studentNumber);
  const password = generatePassword(passwordLength);

  const accountData = {
    email,
    password
  };

  // Create the actual account via Quiklabs
  return await createQuiklabsAccount(accountData);
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
  generateQuiklabsEmail,
  generatePassword,
  generateGoogleAccount,
  generateMultipleAccounts,
  createQuiklabsAccount
};
