
import React from 'react';
import type { Claim, Member } from '../types';
import { ClaimStatus } from '../types';
import ClaimItem from './ClaimItem';

interface ClaimsListProps {
    claims: Claim[];
    members: Member[];
    currentUserId: string;
    onVote: (claimId: string, memberId: string, vote: 'approve' | 'deny') => void;
    isLoading: boolean;
}

const ClaimsList: React.FC<ClaimsListProps> = ({ claims, members, currentUserId, onVote, isLoading }) => {
    
    const findMemberName = (memberId: string) => {
        return members.find(m => m.id === memberId)?.name || 'Unknown Member';
    };

    const pendingClaims = claims.filter(c => c.status === ClaimStatus.PENDING_VOTE || c.status === ClaimStatus.PENDING_AI);
    const historicalClaims = claims.filter(c => c.status !== ClaimStatus.PENDING_VOTE && c.status !== ClaimStatus.PENDING_AI);

    return (
        <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Claims</h2>

            {isLoading && pendingClaims.length === 0 && (
                 <div className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
            )}
            
            {pendingClaims.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-md font-semibold text-slate-600 mb-2">Pending Action</h3>
                    <div className="space-y-3">
                        {pendingClaims.map(claim => (
                            <ClaimItem 
                                key={claim.id}
                                claim={claim}
                                memberName={findMemberName(claim.memberId)}
                                currentUserId={currentUserId}
                                onVote={onVote}
                                membersCount={members.length}
                            />
                        ))}
                    </div>
                </div>
            )}
            
            {historicalClaims.length > 0 && (
                 <div className="mb-6">
                    <h3 className="text-md font-semibold text-slate-600 mb-2">History</h3>
                    <div className="space-y-3">
                         {historicalClaims.map(claim => (
                            <ClaimItem 
                                key={claim.id}
                                claim={claim}
                                memberName={findMemberName(claim.memberId)}
                                currentUserId={currentUserId}
                                onVote={onVote}
                                membersCount={members.length}
                            />
                        ))}
                    </div>
                </div>
            )}

            {!isLoading && claims.length === 0 && (
                <div className="text-center py-8 px-4 bg-white rounded-lg shadow-sm">
                    <p className="text-slate-500">No claims have been filed yet.</p>
                </div>
            )}
        </section>
    );
};

export default ClaimsList;
