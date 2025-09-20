import React, { useState, useCallback, useEffect } from 'react';
import { Group, Claim, ClaimStatus, FundHealth, FundHealthStatus, Transaction } from './types';
import { assessClaimValidity, predictFundHealth } from './services/geminiService';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ClaimsList from './components/ClaimsList';
import Modal from './components/common/Modal';
import NewClaimForm from './components/NewClaimForm';
import NewContributionForm from './components/NewContributionForm';
import USSDSimulator from './components/USSDSimulator';
import { MOCK_GROUP } from './mockData';

const App: React.FC = () => {
    const [group, setGroup] = useState<Group>(MOCK_GROUP);
    const [fundHealth, setFundHealth] = useState<FundHealth>({ status: FundHealthStatus.STABLE, analysis: 'Awaiting initial analysis...' });
    const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({ health: true, claims: false });
    const [error, setError] = useState<string | null>(null);

    const [isClaimModalOpen, setClaimModalOpen] = useState(false);
    const [isContributionModalOpen, setContributionModalOpen] = useState(false);
    const [isUssdModalOpen, setUssdModalOpen] = useState(false);

    // This is the current user, hardcoded for simulation
    const currentUserId = "mem-001"; 

    const runFundHealthAnalysis = useCallback(async () => {
        setIsLoading(prev => ({ ...prev, health: true }));
        setError(null);
        try {
            const health = await predictFundHealth(group);
            setFundHealth(health);
        } catch (err) {
            console.error("Error predicting fund health:", err);
            setError("Could not analyze fund health. Please check your connection or API key.");
            setFundHealth({ status: FundHealthStatus.UNKNOWN, analysis: 'Analysis failed.' });
        } finally {
            setIsLoading(prev => ({ ...prev, health: false }));
        }
    }, [group]);

    useEffect(() => {
        runFundHealthAnalysis();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddContribution = (amount: number, memberId: string) => {
        const newTransaction: Transaction = {
            id: `trans-${Date.now()}`,
            memberId,
            amount,
            date: new Date().toISOString(),
            type: 'contribution',
        };
        setGroup(prevGroup => {
            const updatedGroup = {
                ...prevGroup,
                transactions: [...prevGroup.transactions, newTransaction]
            };
            // Trigger re-analysis after state update
            setTimeout(() => runFundHealthAnalysis(), 0);
            return updatedGroup;
        });
        setContributionModalOpen(false);
    };

    const handleFileClaim = async (description: string, amount: number, memberId: string) => {
        setIsLoading(prev => ({ ...prev, claims: true }));
        const newClaim: Claim = {
            id: `claim-${Date.now()}`,
            memberId,
            description,
            amount,
            date: new Date().toISOString(),
            status: ClaimStatus.PENDING_AI,
            aiAssessment: null,
            votes: [],
        };
        
        try {
            const assessment = await assessClaimValidity({ description, amount }, group);
            newClaim.aiAssessment = assessment;
            newClaim.status = ClaimStatus.PENDING_VOTE;
        } catch (err) {
            console.error("Error assessing claim:", err);
            setError("AI could not assess the claim. It will be moved to manual review.");
            newClaim.status = ClaimStatus.PENDING_VOTE; // Let community vote anyway
             newClaim.aiAssessment = {
                recommendation: 'Needs Review',
                justification: 'AI assessment failed. Proceeding with community validation.'
             }
        } finally {
            setGroup(prevGroup => ({
                ...prevGroup,
                claims: [newClaim, ...prevGroup.claims],
            }));
            setIsLoading(prev => ({ ...prev, claims: false }));
            setClaimModalOpen(false);
        }
    };

    const handleVote = (claimId: string, memberId: string, vote: 'approve' | 'deny') => {
        setGroup(prevGroup => {
            const newClaims = prevGroup.claims.map(claim => {
                if (claim.id === claimId && !claim.votes.some(v => v.memberId === memberId)) {
                    const updatedClaim = { ...claim, votes: [...claim.votes, { memberId, vote }] };

                    // Voting logic
                    const requiredVotes = Math.ceil(prevGroup.members.length / 2);
                    const approvals = updatedClaim.votes.filter(v => v.vote === 'approve').length;
                    const denials = updatedClaim.votes.filter(v => v.vote === 'deny').length;
                    const totalVoters = prevGroup.members.length - 1; // Claimant can't vote

                    if (approvals >= requiredVotes) {
                        updatedClaim.status = ClaimStatus.APPROVED;
                    } else if (denials > totalVoters - requiredVotes) {
                        // Denied if it's impossible for 'approve' to win
                        updatedClaim.status = ClaimStatus.DENIED;
                    } else if (updatedClaim.votes.length >= totalVoters) {
                         // Denied if everyone has voted and 'approve' didn't win
                        updatedClaim.status = ClaimStatus.DENIED;
                    }

                    return updatedClaim;
                }
                return claim;
            });
            return { ...prevGroup, claims: newClaims };
        });
    };

    const totalPool = group.transactions.reduce((acc, t) => {
        return t.type === 'contribution' ? acc + t.amount : acc - t.amount;
    }, 0);

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
            <Header groupName={group.name} />
            <main className="p-4 sm:p-6 max-w-4xl mx-auto">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <Dashboard
                    totalPool={totalPool}
                    fundHealth={fundHealth}
                    isLoading={isLoading.health}
                    onAddContribution={() => setContributionModalOpen(true)}
                    onFileClaim={() => setClaimModalOpen(true)}
                    onRefresh={runFundHealthAnalysis}
                    onOpenUSSD={() => setUssdModalOpen(true)}
                />
                <ClaimsList
                    claims={group.claims}
                    members={group.members}
                    currentUserId={currentUserId}
                    onVote={handleVote}
                    isLoading={isLoading.claims}
                />
            </main>

            <Modal isOpen={isClaimModalOpen} onClose={() => setClaimModalOpen(false)} title="File a New Claim">
                <NewClaimForm onSubmit={handleFileClaim} memberId={currentUserId} />
            </Modal>

            <Modal isOpen={isContributionModalOpen} onClose={() => setContributionModalOpen(false)} title="Add a Contribution">
                <NewContributionForm onSubmit={handleAddContribution} memberId={currentUserId} />
            </Modal>

            <USSDSimulator
                isOpen={isUssdModalOpen}
                onClose={() => setUssdModalOpen(false)}
                group={group}
                currentUserId={currentUserId}
                totalPool={totalPool}
                onVote={handleVote}
                onFileClaim={handleFileClaim}
                onAddContribution={handleAddContribution}
            />
        </div>
    );
};

export default App;