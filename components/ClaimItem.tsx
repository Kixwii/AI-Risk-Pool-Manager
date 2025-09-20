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
        [ClaimStatus.PENDING_AI]: { bg: 'bg-blue-100', text: 'text-blue-800' },
        [ClaimStatus.PENDING_VOTE]: { bg: 'bg-amber-100', text: 'text-amber-800' },
        [ClaimStatus.APPROVED]: { bg: 'bg-green-100', text: 'text-green-800' },
        [ClaimStatus.DENIED]: { bg: 'bg-red-100', text: 'text-red-800' },
        [ClaimStatus.PAID]: { bg: 'bg-lime-100', text: 'text-green-800' },
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
                    <p className="font-bold text-trip-dark">{memberName}</p>
                    <p className="text-sm text-gray-500">
                        {new Date(claim.date).toLocaleDateString()}
                    </p>
                </div>
                <StatusBadge status={claim.status} />
            </div>
            <p className="text-2xl font-bold my-2 text-trip-dark">
                KES {claim.amount.toLocaleString()}
            </p>
            <p className="text-gray-600 text-base mb-4">{claim.description}</p>
            
            {claim.aiAssessment && (
                 <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                    <p className="font-semibold text-gray-700 flex items-center">
                        <SparklesIcon className="h-5 w-5 mr-2 text-blue-600"/>
                        AI Assessment: 
                        <span className={`ml-2 font-bold ${
                            claim.aiAssessment.recommendation === 'Approve' ? 'text-green-600' :
                            claim.aiAssessment.recommendation === 'Deny' ? 'text-red-600' : 'text-amber-600'
                        }`}>
                            {claim.aiAssessment.recommendation}
                        </span>
                    </p>
                    <p className="text-gray-500 italic mt-1">"{claim.aiAssessment.justification}"</p>
                </div>
            )}
            
            {(claim.status === ClaimStatus.PENDING_VOTE || claim.votes.length > 0) && (
                <div className="text-sm text-gray-600 flex items-center mb-3">
                    <UserGroupIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                    Community Vote: 
                    <span className="font-bold text-green-600 ml-2">{approvals}</span>&nbsp;Approve / 
                    <span className="font-bold text-red-600 ml-1">{denials}</span>&nbsp;Deny
                </div>
            )}

            {claim.status === ClaimStatus.PENDING_VOTE && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    {canVote ? (
                        <>
                            <p className="text-sm font-medium text-center text-gray-700 mb-2">Your vote is needed</p>
                            <div className="flex gap-6">
                                <Button onClick={() => onVote(claim.id, currentUserId, 'approve')} variant="secondary" size="sm" className="w-full">
                                    <ThumbUpIcon className="h-4 w-4 mr-2" /> Approve
                                </Button>
                                <Button onClick={() => onVote(claim.id, currentUserId, 'deny')} variant="danger" size="sm" className="w-full">
                                    <ThumbDownIcon className="h-4 w-4 mr-2" /> Deny
                                </Button>
                            </div>
                        </>
                    ) : (
                        <p className="text-xs text-center text-gray-500">
                            {isClaimOwner ? "You cannot vote on your own claim." : "Thank you for voting."}
                        </p>
                    )}
                </div>
            )}
        </Card>
    );
};

export default ClaimItem;