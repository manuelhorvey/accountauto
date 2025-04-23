'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Report } from '@/lib/api';
import { getReportById } from '@/lib/api';
import styles from './ReportView.module.css';

const ReportView: React.FC = () => {
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams();

    const reportId = Array.isArray(id) ? id[0] : id;

    useEffect(() => {
        if (!reportId) {
            setError('Invalid report ID');
            return;
        }

        const fetchReport = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await getReportById(reportId);
                if (data) {
                    setReport(data);
                } else {
                    setError('No report found');
                }
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Unexpected error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [reportId]);

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className={styles.loadingSkeleton}>
                <p>Loading report data...</p>
            </div>
        );
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    return (
        <div className={styles.container}>
            {report ? (
                <>
                    <div id="print-section" className={styles.card}>
                        <header className={styles.header}>
                            <div className={styles.companyInfo}>
                                <h1>DAN SAVIOUR ENTERPRISE</h1>
                                <p>P.O BOX 4822, CO TEMA C1</p>
                                <p>KUMASI RD, OPP ROYALTY CHURCH, AFIENYA</p>
                            </div>
                            <div className={styles.statementStatus}>
                                REPORT DETAILS
                            </div>
                        </header>

                        <div className={styles.grid}>
                            <p><span className={styles.label}>ID:</span> {report._id}</p>
                            <p><span className={styles.label}>Client:</span> {report.clientName}</p>
                            <p><span className={styles.label}>Period:</span> {report.period}</p>
                            <p><span className={styles.label}>Total Gross:</span> GH₵ {report.total_gross?.toLocaleString() || '0'}</p>
                            <p><span className={styles.label}>Total Wins:</span> {report.total_wins ?? 0}</p>
                            <p><span className={styles.label}>Total Net:</span> GH₵ {report.total_net?.toLocaleString() || '0'}</p>
                            <p><span className={styles.label}>Wins Commission:</span> GH₵ {report.total_wins_commission?.toLocaleString() || '0'}</p>
                            <p><span className={styles.label}>Balance (Office):</span> GH₵ {report.total_balance_office?.toLocaleString() || '0'}</p>
                            <p><span className={styles.label}>Balance (Client):</span> GH₵ {report.total_balance_client?.toLocaleString() || '0'}</p>
                            <p><span className={styles.label}>Generated At:</span> {report.generated_at ? new Date(report.generated_at).toLocaleString() : 'N/A'}</p>
                            <p className={styles.fullWidth}><span className={styles.label}>Notes:</span> {report.notes || 'None'}</p>
                        </div>

                        <button className={styles.printButton} onClick={handlePrint}>
                            Print Report
                        </button>
                    </div>
                </>
            ) : (
                <div className={styles.empty}>No report found.</div>
            )}
        </div>
    );
};

export default ReportView;
