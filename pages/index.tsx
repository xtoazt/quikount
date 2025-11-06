import { useState } from 'react';
import Head from 'next/head';

interface Account {
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
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  const generateAccount = async (accountCount: number = 1) => {
    setLoading(true);
    setError(null);
    setAccount(null);
    setAccounts([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count: accountCount }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate account');
      }

      if (data.account) {
        setAccount(data.account);
      } else if (data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const displayAccounts = accounts.length > 0 ? accounts : (account ? [account] : []);

  return (
    <>
      <Head>
        <title>Quikount - Free Google Account Generator</title>
        <meta name="description" content="Generate temporary Google accounts using Quiklabs" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Quikount
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Free Google Account Generator
            </p>
            <p className="text-sm text-gray-500">
              Powered by Quiklabs • Create real Google accounts via Skills Boost
            </p>
          </div>

          {/* Generator Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Accounts
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={count}
                  onChange={(e) => setCount(Math.min(Math.max(parseInt(e.target.value) || 1, 1), 10))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="1"
                />
              </div>
              <button
                onClick={() => generateAccount(count)}
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  'Generate Account' + (count > 1 ? 's' : '')
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
              <p className="font-medium">Error: {error}</p>
            </div>
          )}

          {/* Account Display */}
          {displayAccounts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Generated Account{displayAccounts.length > 1 ? 's' : ''}
              </h2>
              {displayAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        Email
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={acc.email}
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(acc.email, `email-${acc.id}`)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Copy email"
                        >
                          {copied === `email-${acc.id}` ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        Password
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={acc.password}
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(acc.password, `password-${acc.id}`)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Copy password"
                        >
                          {copied === `password-${acc.id}` ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        Full Name
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                        {acc.fullName}
                      </div>
                    </div>

                    {/* Birth Date */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        Birth Date
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                        {acc.birthDate.month}/{acc.birthDate.day}/{acc.birthDate.year}
                      </div>
                    </div>
                  </div>

                  {/* Copy All Button */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        const accountText = `Email: ${acc.email}\nPassword: ${acc.password}\nName: ${acc.fullName}\nBirth Date: ${acc.birthDate.month}/${acc.birthDate.day}/${acc.birthDate.year}`;
                        copyToClipboard(accountText, `all-${acc.id}`);
                      }}
                      className="w-full px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      {copied === `all-${acc.id}` ? '✓ Copied!' : 'Copy All Details'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              ℹ️ Account Information
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span>Accounts are created in real-time via Google Skills Boost.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span>Each account is a fully functional Google account that you can use immediately.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span>Accounts are created through Quiklabs integration with Google Skills Boost.</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}

