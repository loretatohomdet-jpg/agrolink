'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import { 
  Handshake, Loader2, Calendar, MapPin, Star, AlertCircle, MessageSquare, 
  CheckCircle2, DollarSign, ArrowRight, X, MessageCircle
} from 'lucide-react';

export default function TransactionsPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Rating Modal State
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  
  // Role specific rating attributes
  const [qualityRating, setQualityRating] = useState(5);
  const [fulfilmentRating, setFulfilmentRating] = useState(5);
  const [accuracyRating, setAccuracyRating] = useState(5);
  const [paymentRating, setPaymentRating] = useState(5);
  const [professionalismRating, setProfessionalismRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);
        await fetchTransactions();
        setLoading(false);
      } catch (err) {
        console.error(err);
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchTransactions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenRateModal = (tx: any) => {
    setSelectedTx(tx);
    setRateModalOpen(true);
    setFeedback('');
    setRating(5);
    setQualityRating(5);
    setFulfilmentRating(5);
    setAccuracyRating(5);
    setPaymentRating(5);
    setProfessionalismRating(5);
    setCommunicationRating(5);
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRating(true);

    const payload: Record<string, any> = {
      transaction_id: selectedTx.id,
      rating,
      feedback,
      communication_rating: communicationRating
    };

    if (user.role === 'buyer') {
      payload.quality_rating = qualityRating;
      payload.fulfilment_rating = fulfilmentRating;
      payload.accuracy_rating = accuracyRating;
    } else {
      payload.payment_rating = paymentRating;
      payload.professionalism_rating = professionalismRating;
    }

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setRateModalOpen(false);
        alert(t('transactions.ratingSubmitted'));
        await fetchTransactions();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit rating');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4E6956]" />
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
      case 'disputed': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'negotiation': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="border-b border-[#E2ECE3] pb-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#22392B]">{t('transactions.title')} Log</h1>
        </div>

        {transactions.length === 0 ? (
          <div className="bg-white border border-[#E2ECE3] rounded-2xl p-12 text-center shadow-sm space-y-4">
            <Handshake className="w-12 h-12 text-[#181F1B]/35 mx-auto" />
            <h3 className="font-bold text-sm text-[#22392B]">No active transactions yet</h3>
            <p className="text-xs text-[#181F1B]/60 max-w-sm mx-auto">
              Once you initiate an order, confirm pricing, or discuss with matching suppliers, your transaction milestones will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {transactions.map((tx) => {
              const isSupplier = user.role === 'farmer';
              const counterpartyName = isSupplier ? tx.buyer_name : tx.supplier_name;
              const counterpartyOrg = isSupplier ? tx.buyer_company : tx.supplier_farm;

              return (
                <div key={tx.id} className="bg-white border border-[#E2ECE3] rounded-2xl p-6 shadow-sm space-y-4">
                  
                  {/* Top line */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#F2F6F1] pb-3">
                    <div>
                      <div className="text-xs font-bold text-[#181F1B]/40 uppercase tracking-wider font-mono">
                        TX Ref: {tx.id.substring(0, 8)}
                      </div>
                      <div className="text-sm font-extrabold text-[#22392B] mt-1">
                        {tx.product} Sourcing Deal
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${getStatusBadgeClass(tx.status)}`}>
                        Status: {tx.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-[#181F1B]/60">
                        Date: {new Date(tx.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[#181F1B]/50 block uppercase tracking-wider text-[10px] font-bold">
                        {isSupplier ? 'Buyer Off-taker:' : 'Farmer Supplier:'}
                      </span>
                      <span className="font-extrabold text-[#22392B] text-sm block mt-0.5">{counterpartyName}</span>
                      <span className="text-[10px] text-[#181F1B]/60">{counterpartyOrg}</span>
                    </div>

                    <div>
                      <span className="text-[#181F1B]/50 block uppercase tracking-wider text-[10px] font-bold">Quantity Specs:</span>
                      <span className="font-bold text-[#22392B] text-sm block mt-0.5">{tx.quantity} {tx.unit}</span>
                      <span className="text-[10px] text-[#181F1B]/60">₦{Number(tx.price_per_unit).toLocaleString()} / {tx.unit}</span>
                    </div>

                    <div>
                      <span className="text-[#181F1B]/50 block uppercase tracking-wider text-[10px] font-bold">Total Sourcing Value:</span>
                      <span className="font-black text-[#D7A33D] text-sm block mt-0.5">₦{Number(tx.total_value).toLocaleString()}</span>
                      <span className="text-[10px] text-[#181F1B]/60 uppercase tracking-wider font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">
                        Payment: {tx.payment_status}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#181F1B]/50 block uppercase tracking-wider text-[10px] font-bold">Delivery Parameters:</span>
                      <span className="font-bold text-[#22392B] block mt-0.5 truncate">{tx.delivery_location}</span>
                      <span className="text-[10px] text-[#181F1B]/60 block mt-0.5">Deadline: {new Date(tx.expected_delivery_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="pt-3 border-t border-[#F2F6F1] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => router.push('/messages')}
                        className="text-xs font-bold text-[#4E6956] hover:bg-[#F2F6F1] border border-[#E2ECE3] bg-white px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat Thread</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Farmer actions */}
                      {isSupplier && tx.status === 'inquiry' && (
                        <button
                          onClick={() => handleUpdateStatus(tx.id, 'negotiation')}
                          className="bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow"
                        >
                          Accept Inquiry
                        </button>
                      )}
                      
                      {isSupplier && tx.status === 'negotiation' && (
                        <button
                          onClick={() => handleUpdateStatus(tx.id, 'agreement')}
                          className="bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow"
                        >
                          Approve Sourcing Agreement
                        </button>
                      )}

                      {/* Buyer actions */}
                      {!isSupplier && tx.status === 'agreement' && (
                        <button
                          onClick={() => handleUpdateStatus(tx.id, 'confirmed')}
                          className="bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow"
                        >
                          Confirm & Put in Escrow
                        </button>
                      )}

                      {tx.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(tx.id, 'in_progress')}
                          className="bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow"
                        >
                          Mark Dispatch (In Transit)
                        </button>
                      )}

                      {tx.status === 'in_progress' && !isSupplier && (
                        <button
                          onClick={() => handleUpdateStatus(tx.id, 'completed')}
                          className="bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow"
                        >
                          {t('transactions.markCompleted')}
                        </button>
                      )}

                      {/* Common status triggers */}
                      {tx.status !== 'completed' && tx.status !== 'cancelled' && tx.status !== 'disputed' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(tx.id, 'cancelled')}
                            className="text-xs font-bold text-red-600 hover:bg-red-50 border border-red-100 bg-white px-3 py-2.5 rounded-lg transition-colors"
                          >
                            Cancel Deal
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(tx.id, 'disputed')}
                            className="text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-100 bg-white px-3 py-2.5 rounded-lg transition-colors"
                          >
                            Dispute Order
                          </button>
                        </>
                      )}

                      {/* Rating Trigger */}
                      {tx.status === 'completed' && (
                        <button
                          onClick={() => handleOpenRateModal(tx)}
                          className="bg-[#D7A33D] hover:bg-[#22392B] text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow transition-colors flex items-center gap-1.5"
                        >
                          <Star className="w-4 h-4 fill-white" />
                          <span>{t('transactions.rateTransaction')}</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Ratings Modal / Drawer */}
      {rateModalOpen && selectedTx && (
        <div className="fixed inset-0 z-50 bg-[#181F1B]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2ECE3] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-[#22392B] text-white p-4 flex items-center justify-between">
              <span className="font-extrabold text-sm">Submit Review for Sourcing Deal</span>
              <button 
                onClick={() => setRateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmitRating} className="p-6 space-y-4">
              
              <div className="space-y-1 text-xs">
                <span className="text-[#181F1B]/60 block uppercase font-bold tracking-wider text-[10px]">Crop / Quantity:</span>
                <span className="font-bold block text-sm text-[#22392B]">{selectedTx.product} ({selectedTx.quantity} {selectedTx.unit})</span>
              </div>

              {/* Main Star Rating selection */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Overall Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-[#D7A33D] hover:scale-110 transition-transform"
                    >
                      <Star className={`w-8 h-8 ${rating >= star ? 'fill-[#D7A33D]' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Role specific factor ratings */}
              {user.role === 'buyer' ? (
                // Buyer rating Farmer
                <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAFAF7] p-3 rounded-lg border border-[#E2ECE3]">
                  <div className="space-y-1">
                    <span className="block font-semibold">Produce Quality:</span>
                    <select value={qualityRating} onChange={(e) => setQualityRating(Number(e.target.value))} className="w-full border p-1.5 rounded bg-white font-bold">
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-semibold">Order Accuracy:</span>
                    <select value={accuracyRating} onChange={(e) => setAccuracyRating(Number(e.target.value))} className="w-full border p-1.5 rounded bg-white font-bold">
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-semibold">Fulfillment Speed:</span>
                    <select value={fulfilmentRating} onChange={(e) => setFulfilmentRating(Number(e.target.value))} className="w-full border p-1.5 rounded bg-white font-bold">
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-semibold">Communication:</span>
                    <select value={communicationRating} onChange={(e) => setCommunicationRating(Number(e.target.value))} className="w-full border p-1.5 rounded bg-white font-bold">
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                // Farmer rating Buyer
                <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAFAF7] p-3 rounded-lg border border-[#E2ECE3]">
                  <div className="space-y-1">
                    <span className="block font-semibold">Payment Speed:</span>
                    <select value={paymentRating} onChange={(e) => setPaymentRating(Number(e.target.value))} className="w-full border p-1.5 rounded bg-white font-bold">
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-semibold">Professionalism:</span>
                    <select value={professionalismRating} onChange={(e) => setProfessionalismRating(Number(e.target.value))} className="w-full border p-1.5 rounded bg-white font-bold">
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="block font-semibold">Communication:</span>
                    <select value={communicationRating} onChange={(e) => setCommunicationRating(Number(e.target.value))} className="w-full border p-1.5 rounded bg-white font-bold">
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Feedback text */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Written Review</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide details about cargo quality, transit speed, payment reliability, or negotiation friendliness..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-[#E2ECE3] text-xs outline-none resize-none focus:ring-1 focus:ring-[#4E6956]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRateModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#E2ECE3] text-xs font-bold hover:bg-[#FAFAF7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingRating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Review</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
