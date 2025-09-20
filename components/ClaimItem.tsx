
import React from 'react';
import type { Claim } from '../types';
import { ClaimStatus } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { ThumbUpIcon } from './icons/ThumbUpIcon';
import { ThumbDownIcon } from './icons/ThumbDownIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ClaimItemProps {
    claim: Claim;
    memberName: string;
    currentUserId: string;
    membersCount: number;
    onVote: (claimId: string, memberId: string, vote: 'approve' | 'deny') => void;
}

const StatusBadge: React.FC<{ status: ClaimStatus }> = ({ status }) => {
    const statusStyles: { [key in ClaimStatus]: { bg: string, text: string } } = {
        [ClaimStatus.PENDING_AI]: { bg: 'bg-purple-100', text: 'text-purple-800' },
        [ClaimStatus.PENDING_VOTE]: { bg: 'bg-blue-100', text: 'text-blue-800' },
        [ClaimStatus.APPROVED]: { bg: 'bg-green-100', text: 'text-green-800' },
        [ClaimStatus.DENIED]: { bg: 'bg-red-100', text: 'text-red-800' },
        [ClaimStatus.PAID]: { bg: 'bg-slate-100', text: 'text-slate-800' },
    };

    const styles = statusStyles[status] || statusStyles[ClaimStatus.PAID];
    const formattedStatus = status.replace('_', ' ').toLowerCase();

    return (
        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize ${styles.bg} ${styles.text}`}>
            {formattedStatus}
        </span>
    );
};

const ClaimItem: React.FC<ClaimItemProps> = ({ claim, memberName, currentUserId, onVote, membersCount }) => {
    const userHasVoted = claim.votes.some(v => v.memberId === currentUserId);
    const isClaimOwner = claim.memberId === currentUserId;
    const canVote = claim.status === ClaimStatus.PENDING_VOTE && !userHasVoted && !isClaimOwner;

    const approvals = claim.votes.filter(v => v.vote === 'approve').length;
    const denials = claim.votes.filter(v => v.vote === 'deny').length;

    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-slate-800">{memberName}</p>
                    <p className="text-sm text-slate-500">
                        {new Date(claim.date).toLocaleDateString()}
                    </p>
                </div>
                <StatusBadge status={claim.status} />
            </div>
            <p className="text-lg font-semibold my-2 text-slate-900">
                KES {claim.amount.toLocaleString()}
            </p>
            <p className="text-slate-600 text-sm mb-3">{claim.description}</p>
            
            {claim.aiAssessment && (
                 <div className="text-sm bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
                    <p className="font-semibold text-slate-700 flex items-center">
                        <SparklesIcon className="h-4 w-4 mr-1.5 text-purple-500"/>
                        AI Assessment: 
                        <span className={`ml-2 font-bold ${
                            claim.aiAssessment.recommendation === 'Approve' ? 'text-green-600' :
                            claim.aiAssessment.recommendation === 'Deny' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                            {claim.aiAssessment.recommendation}
                        </span>
                    </p>
                    <p className="text-slate-500 italic mt-1">"{claim.aiAssessment.justification}"</p>
                </div>
            )}
            
            {(claim.status === ClaimStatus.PENDING_VOTE || claim.votes.length > 0) && (
                <div className="text-sm text-slate-600 flex items-center mb-3">
                    <UserGroupIcon className="h-4 w-4 mr-1.5 text-slate-500" />
                    Community Vote: 
                    <span className="font-bold text-green-600 ml-2">{approvals}</span>&nbsp;Approve / 
                    <span className="font-bold text-red-600 ml-1">{denials}</span>&nbsp;Deny
                </div>
            )}


            {canVote && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm font-medium text-center text-slate-700 mb-2">Your vote is needed</p>
                    <div className="flex gap-3">
                        <Button onClick={() => onVote(claim.id, currentUserId, 'approve')} variant="secondary" size="sm" className="w-full">
                            <ThumbUpIcon className="h-4 w-4 mr-2" /> Approve
                        </Button>
                        <Button onClick={() => onVote(claim.id, currentUserId, 'deny')} variant="danger" size="sm" className="w-full">
                            <ThumbDownIcon className="h-4 w-4 mr-2" /> Deny
                        </Button>
                    </div>
                </div>
            )}

            {claim.status === ClaimStatus.PENDING_VOTE && (isClaimOwner || userHasVoted) && (
                 <p className="text-xs text-center text-slate-500 mt-3">
                    {isClaimOwner ? "You cannot vote on your own claim." : "Thank you for voting."}
                </p>
            )}
        </Card>
    );
};

export default ClaimItem;
