// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { formatDate, formatCurrency } from '@/lib/utils/helpers';
import { Check, X, DollarSign, Loader2 } from 'lucide-react';

export default function PaymentsPage() {
    const { payments, loading, fetchPendingPayments, approvePayment, rejectPayment } = useAdmin();
    const [statusFilter, setStatusFilter] = useState('pending');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [rejectNotes, setRejectNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchPendingPayments();
    }, []);

    const filteredPayments = statusFilter === 'all'
        ? payments
        : payments.filter(p => p.status === statusFilter);

    const handleApprove = async (paymentId) => {
        setProcessing(true);
        await approvePayment(paymentId);
        setProcessing(false);
        setShowModal(false);
        setSelectedPayment(null);
    };

    const handleReject = async (paymentId) => {
        setProcessing(true);
        await rejectPayment(paymentId, rejectNotes);
        setProcessing(false);
        setShowModal(false);
        setSelectedPayment(null);
        setRejectNotes('');
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-500/10 text-green-400';
            case 'rejected': return 'bg-red-500/10 text-red-400';
            default: return 'bg-amber-500/10 text-amber-400';
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1400px]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Payment Management</h1>
                    <p className="text-neutral-400">Review and process payment proofs</p>
                </div>
                <div className="px-4 py-2 bg-amber-500/10 text-amber-400 rounded-full text-sm font-medium">
                    <span className="font-bold">{payments.filter(p => p.status === 'pending').length}</span> Pending
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['pending', 'approved', 'rejected', 'all'].map((status) => (
                    <button
                        key={status}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === status
                                ? 'bg-primary-600 text-white'
                                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                            }`}
                        onClick={() => setStatusFilter(status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Payments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    </div>
                ) : filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                        <div key={payment.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm">
                                        {payment.user?.full_name?.[0] || payment.user?.email?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium text-white truncate">{payment.user?.full_name || 'Unknown User'}</span>
                                        <span className="text-xs text-neutral-500 truncate">{payment.user?.email}</span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(payment.status)}`}>
                                    {payment.status}
                                </span>
                            </div>

                            <div className="p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Service</span>
                                    <span className="text-white font-medium">{payment.subscription?.service?.name || 'Unknown Service'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Amount</span>
                                    <span className="text-white font-semibold">{formatCurrency(payment.amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Date</span>
                                    <span className="text-neutral-300">{formatDate(payment.created_at)}</span>
                                </div>
                                {payment.whatsapp_number && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">WhatsApp</span>
                                        <span className="text-neutral-300">{payment.whatsapp_number}</span>
                                    </div>
                                )}
                            </div>

                            {payment.proof_image_url && (
                                <div className="px-4 pb-4">
                                    <img
                                        src={payment.proof_image_url}
                                        alt="Payment proof"
                                        className="w-full h-32 object-cover rounded-lg border border-neutral-800"
                                    />
                                </div>
                            )}

                            {payment.status === 'pending' && (
                                <div className="flex gap-2 p-4 border-t border-neutral-800">
                                    <button
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                        onClick={() => {
                                            setSelectedPayment(payment);
                                            setShowModal(true);
                                        }}
                                    >
                                        <Check size={16} /> Approve
                                    </button>
                                    <button
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                        onClick={() => {
                                            setSelectedPayment(payment);
                                            setShowModal(true);
                                        }}
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                </div>
                            )}

                            {payment.notes && (
                                <div className="px-4 pb-4 text-sm">
                                    <span className="text-neutral-500">Notes: </span>
                                    <span className="text-neutral-300">{payment.notes}</span>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center">
                        <DollarSign className="w-12 h-12 mx-auto text-neutral-600 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No payments found</h3>
                        <p className="text-neutral-500">No {statusFilter === 'all' ? '' : statusFilter} payments at the moment</p>
                    </div>
                )}
            </div>

            {/* Approval/Rejection Modal */}
            {showModal && selectedPayment && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                            <h2 className="text-lg font-semibold text-white">Process Payment</h2>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                                onClick={() => setShowModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="space-y-3 p-4 bg-neutral-800/50 rounded-xl mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">User</span>
                                    <span className="text-white font-medium">{selectedPayment.user?.full_name || selectedPayment.user?.email}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Service</span>
                                    <span className="text-white font-medium">{selectedPayment.subscription?.service?.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Amount</span>
                                    <span className="text-green-400 font-bold text-lg">{formatCurrency(selectedPayment.amount)}</span>
                                </div>
                            </div>

                            {selectedPayment.proof_image_url && (
                                <div className="mb-6">
                                    <span className="text-sm text-neutral-500 mb-2 block">Payment Proof</span>
                                    <img
                                        src={selectedPayment.proof_image_url}
                                        alt="Payment proof"
                                        className="w-full max-h-48 object-contain rounded-lg border border-neutral-800"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">Notes (optional for approval, required for rejection)</label>
                                <textarea
                                    value={rejectNotes}
                                    onChange={(e) => setRejectNotes(e.target.value)}
                                    placeholder="Add notes about this payment..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 px-6 py-4 border-t border-neutral-800">
                            <button
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleReject(selectedPayment.id)}
                                disabled={processing}
                            >
                                {processing ? 'Processing...' : 'Reject Payment'}
                            </button>
                            <button
                                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleApprove(selectedPayment.id)}
                                disabled={processing}
                            >
                                {processing ? 'Processing...' : 'Approve Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
