import React, { useMemo, useState } from 'react';
import { FiAlertCircle, FiCreditCard, FiRefreshCw, FiSearch, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useWallet } from '../../context/WalletContext';
import {
  createWalletTopupOrderApi,
  failWalletTopupApi,
  fetchWalletTransactionsApi,
  verifyWalletTopupApi
} from '../../services/walletService';

const loadRazorpayScript = () => {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const runMockGatewayFlow = async () => {
  const approved = window.confirm(
    'Fake Razorpay Wallet Topup\n\nPress OK to simulate successful payment.\nPress Cancel to simulate failed/cancelled payment.'
  );

  if (!approved) {
    throw new Error('Mock payment cancelled by user');
  }

  return {
    razorpay_payment_id: `pay_mock_${Date.now()}`,
    razorpay_signature: 'mock_signature'
  };
};

function Wallet() {
  const { wallet, walletLoading, walletError, refreshWallet } = useWallet();
  const [amount, setAmount] = useState('500');
  const [isTopupLoading, setIsTopupLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [passbook, setPassbook] = useState([]);
  const [passbookLoading, setPassbookLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilterPreset, setDateFilterPreset] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [amountSort, setAmountSort] = useState('amount-desc');

  const formattedBalance = useMemo(() => `₹ ${Number(wallet?.balance || 0).toFixed(2)}`, [wallet]);

  const historyStats = useMemo(() => {
    return (passbook || []).reduce(
      (acc, entry) => {
        const amount = Number(entry.amount || 0);
        if (entry.type === 'Credit' && entry.status === 'Success') {
          acc.credit += amount;
        }
        if (entry.type === 'Debit' && entry.status === 'Success') {
          acc.debit += amount;
        }
        if (entry.status === 'Failed') {
          acc.failed += 1;
        }
        return acc;
      },
      { credit: 0, debit: 0, failed: 0 }
    );
  }, [passbook]);

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const now = new Date();

    const presetCutoffDate = (() => {
      if (dateFilterPreset === 'last-1-month') {
        const date = new Date(now);
        date.setMonth(date.getMonth() - 1);
        return date;
      }

      if (dateFilterPreset === 'last-3-months') {
        const date = new Date(now);
        date.setMonth(date.getMonth() - 3);
        return date;
      }

      if (dateFilterPreset === 'last-6-months') {
        const date = new Date(now);
        date.setMonth(date.getMonth() - 6);
        return date;
      }

      return null;
    })();

    const startDateTime = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const endDateTime = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null;

    const filtered = (passbook || []).filter((entry) => {
      if (activeTab === 'credit' && (entry.type !== 'Credit' || entry.status === 'Failed')) {
        return false;
      }

      if (activeTab === 'debit' && (entry.type !== 'Debit' || entry.status === 'Failed')) {
        return false;
      }

      if (activeTab === 'failed' && entry.status !== 'Failed') {
        return false;
      }

      const entryDateTime = new Date(entry.createdAt || 0).getTime();

      if (dateFilterPreset !== 'custom' && presetCutoffDate && entryDateTime < presetCutoffDate.getTime()) {
        return false;
      }

      if (dateFilterPreset === 'custom') {
        if (startDateTime && entryDateTime < startDateTime) {
          return false;
        }

        if (endDateTime && entryDateTime > endDateTime) {
          return false;
        }
      }

      if (!normalizedSearch) {
        return true;
      }

      const amountText = Number(entry.amount || 0).toFixed(2);
      const searchable = [
        entry.transactionId,
        entry.source,
        entry.type,
        entry.status,
        amountText
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedSearch);
    });

    filtered.sort((a, b) => {
      const aAmount = Number(a.amount || 0);
      const bAmount = Number(b.amount || 0);
      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();

      if (amountSort === 'amount-asc') {
        return aAmount - bAmount || bDate - aDate;
      }

      return bAmount - aAmount || bDate - aDate;
    });

    return filtered;
  }, [passbook, activeTab, searchTerm, dateFilterPreset, startDate, endDate, amountSort]);

  const loadPassbook = async () => {
    try {
      setPassbookLoading(true);
      const response = await fetchWalletTransactionsApi({ page: 1, limit: 30 });
      setPassbook(response.transactions || []);
    } catch (error) {
      setActionError(error?.response?.data?.message || 'Failed to fetch wallet transactions');
    } finally {
      setPassbookLoading(false);
    }
  };

  React.useEffect(() => {
    loadPassbook();
  }, []);

  const handleTopup = async () => {
    const numericAmount = Number(amount);
    let currentRazorpayOrderId = '';

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setActionError('Please enter a valid amount.');
      return;
    }

    try {
      setIsTopupLoading(true);
      setActionError('');
      setActionMessage('Creating topup order...');

      const topupResponse = await createWalletTopupOrderApi({ amount: numericAmount });
      currentRazorpayOrderId = topupResponse?.order?.id || '';

      if (topupResponse.mockMode) {
        const mockPayload = await runMockGatewayFlow();
        await verifyWalletTopupApi({
          razorpay_order_id: topupResponse.order.id,
          ...mockPayload
        });
      } else {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || !window.Razorpay) {
          throw new Error('Unable to load Razorpay checkout. Please try again.');
        }

        const paymentResult = await new Promise((resolve, reject) => {
          const rzp = new window.Razorpay({
            key: topupResponse.keyId,
            amount: topupResponse.order.amount,
            currency: topupResponse.order.currency,
            name: 'EasyCart Wallet',
            description: 'Add money to wallet',
            order_id: topupResponse.order.id,
            handler: (response) => resolve(response),
            theme: { color: '#0f172a' },
            modal: {
              ondismiss: () => reject(new Error('Razorpay checkout closed by user'))
            }
          });

          rzp.on('payment.failed', () => reject(new Error('Payment failed. Please retry.')));
          rzp.open();
        });

        await verifyWalletTopupApi(paymentResult);
      }

      await refreshWallet();
      await loadPassbook();
      setActionMessage('Wallet topup successful.');
    } catch (error) {
      if (error?.message?.toLowerCase().includes('closed') || error?.message?.toLowerCase().includes('cancelled')) {
        try {
          if (currentRazorpayOrderId) {
            await failWalletTopupApi({
              razorpay_order_id: currentRazorpayOrderId,
              reason: error.message
            });
          }
        } catch (_ignore) {
          // Ignore best-effort failure marking.
        }
      }

      setActionError(error?.response?.data?.message || error?.message || 'Failed to add money to wallet');
      setActionMessage('');
    } finally {
      setIsTopupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-indigo-50 to-emerald-100">
      <Navbar />

      <section className="container mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <div className="rounded-3xl border border-cyan-200/70 bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-600 p-7 text-white shadow-2xl shadow-indigo-200/70">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/90">Wallet Balance</p>
                <h1 className="text-5xl font-black mt-3 drop-shadow-sm">{formattedBalance}</h1>
                <p className="text-cyan-100 mt-3 text-sm">Your wallet is ready for payments and instant refunds.</p>
              </div>
              <button
                onClick={refreshWallet}
                className="inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                <FiRefreshCw /> Refresh
              </button>
            </div>
            {walletError && <p className="mt-3 rounded-lg bg-rose-100/90 px-3 py-2 text-sm font-semibold text-rose-700">{walletError}</p>}
          </div>

          <div id="add-money" className="rounded-3xl border border-emerald-300/70 bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 p-7 shadow-2xl shadow-emerald-100 scroll-mt-24">
            <h2 className="text-3xl font-black text-emerald-900">Add Amount</h2>
            <p className="mt-1 text-sm font-medium text-emerald-700">Top up your wallet instantly via Razorpay.</p>

            <div className="mt-5 flex flex-wrap items-end gap-3">
              <label className="flex-1 min-w-[220px]">
                <span className="block text-sm font-semibold text-slate-700 mb-1">Amount (₹)</span>
                <input
                  type="number"
                  min="10"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-xl border border-emerald-300 bg-white px-4 py-3 text-lg font-semibold text-slate-900"
                />
              </label>
              <button
                onClick={handleTopup}
                disabled={isTopupLoading || walletLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-60"
              >
                <FiCreditCard />
                {isTopupLoading ? 'Processing...' : 'Add Money'}
              </button>
            </div>

            {actionMessage && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{actionMessage}</p>}
            {actionError && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{actionError}</p>}
          </div>
        </div>

        <div id="history" className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-white via-indigo-50/40 to-cyan-50/50 p-6 shadow-2xl shadow-indigo-100 scroll-mt-24">
          <h2 className="text-3xl font-black text-indigo-900">Transaction History</h2>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-100 to-teal-100 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-800">Credit</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-2xl font-black text-emerald-800">₹ {historyStats.credit.toFixed(2)}</p>
                <FiTrendingUp className="text-emerald-700" size={22} />
              </div>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-100 to-orange-100 p-4">
              <p className="text-xs uppercase tracking-wide text-rose-800">Debit</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-2xl font-black text-rose-800">₹ {historyStats.debit.toFixed(2)}</p>
                <FiTrendingDown className="text-rose-700" size={22} />
              </div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-100 to-yellow-100 p-4">
              <p className="text-xs uppercase tracking-wide text-amber-800">Failed</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-2xl font-black text-amber-800">{historyStats.failed}</p>
                <FiAlertCircle className="text-amber-700" size={22} />
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 relative">
              <FiSearch className="absolute left-3 top-3.5 text-indigo-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search payment by Txn ID, source, type, status, amount"
                className="w-full rounded-xl border border-indigo-200 bg-white px-10 py-3 text-sm font-medium text-slate-700"
              />
            </div>

            <select
              value={dateFilterPreset}
              onChange={(event) => setDateFilterPreset(event.target.value)}
              className="rounded-xl border border-indigo-200 bg-white px-3 py-3 text-sm font-semibold text-indigo-800"
            >
              <option value="all">All Dates</option>
              <option value="last-1-month">Last 1 Month</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="custom">Custom Date Range</option>
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Start Date
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => {
                    setStartDate(event.target.value);
                    if (dateFilterPreset !== 'custom') {
                      setDateFilterPreset('custom');
                    }
                  }}
                  className="mt-1 w-full rounded-xl border border-indigo-200 bg-white px-3 py-3 text-sm font-medium text-slate-700"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                End Date
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => {
                    setEndDate(event.target.value);
                    if (dateFilterPreset !== 'custom') {
                      setDateFilterPreset('custom');
                    }
                  }}
                  className="mt-1 w-full rounded-xl border border-indigo-200 bg-white px-3 py-3 text-sm font-medium text-slate-700"
                />
              </label>
            </div>

            <select
              value={amountSort}
              onChange={(event) => setAmountSort(event.target.value)}
              className="rounded-xl border border-indigo-200 bg-white px-3 py-3 text-sm font-semibold text-indigo-800"
            >
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>

          <div className="mt-5 border-b border-indigo-200">
            <div className="flex flex-wrap gap-5">
              {[
                { key: 'all', label: 'All' },
                { key: 'credit', label: 'Credit' },
                { key: 'debit', label: 'Debit' },
                { key: 'failed', label: 'Failed' }
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`pb-2 text-sm transition border-b-2 ${
                      isActive
                        ? 'border-indigo-600 text-indigo-700 font-bold'
                        : 'border-transparent text-slate-600 font-medium hover:text-indigo-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {passbookLoading ? (
            <p className="mt-4 text-sm text-slate-600">Loading transactions...</p>
          ) : filteredTransactions.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No wallet transactions yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {filteredTransactions.map((entry) => (
                (() => {
                  const isFailed = entry.status === 'Failed';
                  const isCredit = entry.type === 'Credit';
                  const amountPrefix = isFailed ? '' : isCredit ? '+' : '-';
                  const amountColor = isFailed ? 'text-amber-700' : isCredit ? 'text-emerald-700' : 'text-rose-700';

                  return (
                    <div key={entry.id} className="rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold text-indigo-900">
                          {entry.type} - {entry.source}
                        </p>
                        <p className={`text-lg font-black ${amountColor}`}>
                          {amountPrefix}₹ {Number(entry.amount || 0).toFixed(2)}
                        </p>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">Txn ID: {entry.transactionId}</p>
                      <p className="text-xs text-slate-600 mt-1">Status: {entry.status}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  );
                })()
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Wallet;
