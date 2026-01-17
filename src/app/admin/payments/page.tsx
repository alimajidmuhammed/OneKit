// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { formatDate, formatCurrency } from '@/lib/utils/helpers';
import styles from './payments.module.css';

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return styles.statusApproved;
            case 'rejected': return styles.statusRejected;
            default: return styles.statusPending;
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>Payment Management</h1>
                    <p>Review and process payment proofs</p>
                </div>
                <div className={styles.stats}>
                    <div className={`${styles.statBadge} ${styles.statPending}`}>
                        <span>{payments.filter(p => p.status === 'pending').length}</span> Pending
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.tabFilters}>
                    {['pending', 'approved', 'rejected', 'all'].map((status) => (
                        <button
                            key={status}
                            className={`${styles.tabBtn} ${statusFilter === status ? styles.tabBtnActive : ''}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Payments Grid */}
            <div className={styles.paymentsGrid}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                    </div>
                ) : filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                        <div key={payment.id} className={styles.paymentCard}>
                            <div className={styles.paymentHeader}>
                                <div className={styles.userInfo}>
                                    <div className={styles.avatar}>
                                        {payment.user?.full_name?.[0] || payment.user?.email?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <span className={styles.userName}>{payment.user?.full_name || 'Unknown User'}</span>
                                        <span className={styles.userEmail}>{payment.user?.email}</span>
                                    </div>
                                </div>
                                <span className={`${styles.statusBadge} ${getStatusColor(payment.status)}`}>
                                    {payment.status}
                                </span>
                            </div>

                            <div className={styles.paymentDetails}>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Service</span>
                                    <span className={styles.detailValue}>
                                        {payment.subscription?.service?.name || 'Unknown Service'}
                                    </span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Amount</span>
                                    <span className={styles.detailValue}>{formatCurrency(payment.amount)}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Date</span>
                                    <span className={styles.detailValue}>{formatDate(payment.created_at)}</span>
                                </div>
                                {payment.whatsapp_number && (
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>WhatsApp</span>
                                        <span className={styles.detailValue}>{payment.whatsapp_number}</span>
                                    </div>
                                )}
                            </div>

                            {payment.proof_image_url && (
                                <div className={styles.proofImage}>
                                    <img src={payment.proof_image_url} alt="Payment proof" />
                                </div>
                            )}

                            {payment.status === 'pending' && (
                                <div className={styles.paymentActions}>
                                    <button
                                        className={styles.approveBtn}
                                        onClick={() => {
                                            setSelectedPayment(payment);
                                            setShowModal(true);
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Approve
                                    </button>
                                    <button
                                        className={styles.rejectBtn}
                                        onClick={() => {
                                            setSelectedPayment(payment);
                                            setShowModal(true);
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Reject
                                    </button>
                                </div>
                            )}

                            {payment.notes && (
                                <div className={styles.notes}>
                                    <span className={styles.notesLabel}>Notes:</span>
                                    <span>{payment.notes}</span>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 6v12M15 9.5a2.5 2.5 0 00-2.5-2.5H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <h3>No payments found</h3>
                        <p>No {statusFilter === 'all' ? '' : statusFilter} payments at the moment</p>
                    </div>
                )}
            </div>

            {/* Approval/Rejection Modal */}
            {showModal && selectedPayment && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Process Payment</h2>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.paymentSummary}>
                                <div className={styles.summaryRow}>
                                    <span>User</span>
                                    <span>{selectedPayment.user?.full_name || selectedPayment.user?.email}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Service</span>
                                    <span>{selectedPayment.subscription?.service?.name}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Amount</span>
                                    <span className={styles.summaryAmount}>{formatCurrency(selectedPayment.amount)}</span>
                                </div>
                            </div>

                            {selectedPayment.proof_image_url && (
                                <div className={styles.proofPreview}>
                                    <span className={styles.proofLabel}>Payment Proof</span>
                                    <img src={selectedPayment.proof_image_url} alt="Payment proof" />
                                </div>
                            )}

                            <div className={styles.notesInput}>
                                <label>Notes (optional for approval, required for rejection)</label>
                                <textarea
                                    value={rejectNotes}
                                    onChange={(e) => setRejectNotes(e.target.value)}
                                    placeholder="Add notes about this payment..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.rejectModalBtn}
                                onClick={() => handleReject(selectedPayment.id)}
                                disabled={processing}
                            >
                                {processing ? 'Processing...' : 'Reject Payment'}
                            </button>
                            <button
                                className={styles.approveModalBtn}
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
