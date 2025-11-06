import type { NextApiRequest, NextApiResponse } from 'next';
import {
  generateGoogleAccount,
  generateMultipleAccounts
} from '../../lib/mirrors';

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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    const { count = 1, emailDomain, passwordLength } = req.body;

    // Validate count
    const accountCount = Math.min(Math.max(parseInt(count) || 1, 1), 10); // Max 10 accounts at once

    const options: any = {};
    if (emailDomain) options.emailDomain = emailDomain;
    if (passwordLength) options.passwordLength = parseInt(passwordLength);

    if (accountCount === 1) {
      const account = generateGoogleAccount(options) as AccountData;
      return res.status(200).json({
        success: true,
        account
      });
    } else {
      const accounts = generateMultipleAccounts(accountCount, options) as AccountData[];
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

