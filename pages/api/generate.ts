import type { NextApiRequest, NextApiResponse } from 'next';

// Functions will be loaded in the handler

type AccountData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: {
    day: string;
    month: string;
    year: string;
  };
  createdAt: string;
  id: string;
};

type ResponseData = {
  success: boolean;
  account?: AccountData;
  accounts?: AccountData[];
  count?: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Log the incoming request for debugging
  console.log('API Request:', {
    method: req.method,
    url: req.url,
    body: req.body
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      error: `Method not allowed. Received ${req.method}, expected POST.`
    });
  }

  try {
    // Load mirrors.js functions (do this in handler for serverless compatibility)
    let generateGoogleAccount: any;
    let generateMultipleAccounts: any;
    
    try {
      const mirrors = require('../../lib/mirrors');
      generateGoogleAccount = mirrors.generateGoogleAccount;
      generateMultipleAccounts = mirrors.generateMultipleAccounts;
      
      if (!generateGoogleAccount || !generateMultipleAccounts) {
        console.error('Functions not found. Available exports:', Object.keys(mirrors));
        return res.status(500).json({
          success: false,
          error: 'Account generation functions not found in mirrors module.'
        });
      }
    } catch (loadError: any) {
      console.error('Failed to load mirrors.js:', loadError.message);
      return res.status(500).json({
        success: false,
        error: `Failed to load account generation module: ${loadError.message}`
      });
    }

    // Parse body if it's a string (can happen in some cases)
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error('Failed to parse body:', e);
      }
    }
    
    const { count = 1, emailDomain, passwordLength } = body || {};

    // Validate count
    const accountCount = Math.min(Math.max(parseInt(count) || 1, 1), 10); // Max 10 accounts at once

    const options: any = {};
    if (emailDomain) options.emailDomain = emailDomain;
    if (passwordLength) options.passwordLength = parseInt(passwordLength);

    if (accountCount === 1) {
      const account = await generateGoogleAccount(options) as AccountData;
      return res.status(200).json({
        success: true,
        account
      });
    } else {
      const accounts = await generateMultipleAccounts(accountCount, options) as AccountData[];
      return res.status(200).json({
        success: true,
        accounts,
        count: accounts.length
      });
    }
  } catch (error: any) {
    console.error('Error generating account:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate account'
    });
  }
}

// Next.js API route configuration
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
  },
}

