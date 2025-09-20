import React from 'react';
import type { FundHealth } from '../types';
import { FundHealthStatus } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { RefreshIcon } from './icons/RefreshIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { DocumentAddIcon } from './icons/DocumentAddIcon';
import { PhoneIcon } from './icons/PhoneIcon';

interface DashboardProps {
    totalPool: number;
    fundHealth: FundHealth;
    isLoading: boolean;
    onAddContribution: () => void;
    onFileClaim: () => void;
    onRefresh: () => void;
    onOpenUSSD: () => void;
}

const HealthIndicator: React.FC<{ status: FundHealthStatus }> = ({ status }) => {
    const statusStyles: { [key in FundHealthStatus]: { bg: string, text: string, dot: string } } = {
        [FundHealthStatus.HEALTHY]: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
        [FundHealthStatus.STABLE]: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
        [FundHealthStatus.AT_RISK]: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
        [FundHealthStatus.UNKNOWN]: { bg: 'bg-slate-100', text: 'text-slate-800', dot: 'bg-slate-500' },
    };

    const styles = statusStyles[status] || statusStyles[FundHealthStatus.UNKNOWN];

    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles.bg} ${styles.text}`}>
            <span className={`w-2 h-2 mr-2 rounded-full ${styles.dot}`}></span>
            {status}
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ totalPool, fundHealth, isLoading, onAddContribution, onFileClaim, onRefresh, onOpenUSSD }) => {
    return (
        <section className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <h3 className="text-sm font-medium text-slate-500">Total Pool Value</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                        KES {totalPool.toLocaleString()}
                    </p>
                </Card>
                <Card>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">AI Fund Health</h3>
                            {isLoading ? (
                                <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse mt-2"></div>
                            ) : (
                                <div className="mt-2">
                                    <HealthIndicator status={fundHealth.status} />
                                </div>
                            )}
                        </div>
                        <button onClick={onRefresh} disabled={isLoading} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-wait">
                            <RefreshIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                     {isLoading ? (
                        <div className="mt-2 h-4 w-full bg-slate-200 rounded animate-pulse"></div>
                     ) : (
                        <p className="text-sm text-slate-600 mt-2">{fundHealth.analysis}</p>
                     )}
                </Card>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
                <Button onClick={onAddContribution} variant="secondary">
                    <PlusCircleIcon className="h-5 w-5 mr-2"/>
                    Add Contribution
                </Button>
                <Button onClick={onFileClaim} variant="primary">
                     <DocumentAddIcon className="h-5 w-5 mr-2"/>
                    File a Claim
                </Button>
                <div className="col-span-2">
                    <Button onClick={onOpenUSSD} variant="secondary" className="w-full border-slate-400">
                        <PhoneIcon className="h-5 w-5 mr-2"/>
                        Use USSD (Offline Sim)
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default Dashboard;