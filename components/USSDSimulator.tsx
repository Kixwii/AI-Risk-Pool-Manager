import React, { useState, useEffect, useCallback } from 'react';
import type { Group, Claim } from '../types';
import { ClaimStatus } from '../types';
import Button from './common/Button';
import { PhoneIcon } from './icons/PhoneIcon';

type Screen =
    | 'MAIN'
    | 'LOADING'
    | 'FILE_CLAIM_AMOUNT'
    | 'FILE_CLAIM_DESC'
    | 'FILE_CLAIM_CONFIRM'
    | 'VOTE_LIST'
    | 'VOTE_CONFIRM'
    | 'CONTRIBUTE_AMOUNT'
    | 'CONTRIBUTE_CONFIRM'
    | 'MY_CLAIMS_LIST';

interface USSDSimulatorProps {
    isOpen: boolean;
    onClose: () => void;
    group: Group;
    currentUserId: string;
    totalPool: number;
    onVote: (claimId: string, memberId: string, vote: 'approve' | 'deny') => void;
    onFileClaim: (description: string, amount: number, memberId: string) => Promise<void>;
    onAddContribution: (amount: number, memberId: string) => void;
}

const USSDSimulator: React.FC<USSDSimulatorProps> = ({ isOpen, onClose, group, currentUserId, totalPool, onVote, onFileClaim, onAddContribution }) => {
    const [screen, setScreen] = useState<Screen>('MAIN');
    const [history, setHistory] = useState<Screen[]>(['MAIN']);
    const [input, setInput] = useState('');
    const [message, setMessage] = useState('');
    const [claimData, setClaimData] = useState<{ amount: number | null, description: string | null }>({ amount: null, description: null });
    const [contributionAmount, setContributionAmount] = useState<number | null>(null);
    const [voteData, setVoteData] = useState<{ claims: Claim[], selectedClaim: Claim | null }>({ claims: [], selectedClaim: null });

    const currentUser = group.members.find(m => m.id === currentUserId);

    const reset = useCallback(() => {
        setScreen('MAIN');
        setHistory(['MAIN']);
        setInput('');
        setMessage('');
        setClaimData({ amount: null, description: null });
        setContributionAmount(null);
        setVoteData({ claims: [], selectedClaim: null });
    }, []);

    useEffect(() => {
        if (isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    const navigate = (newScreen: Screen) => {
        setHistory(prev => [...prev, newScreen]);
        setScreen(newScreen);
    };

    const goBack = () => {
        const newHistory = [...history];
        newHistory.pop();
        if (newHistory.length > 0) {
            setHistory(newHistory);
            setScreen(newHistory[newHistory.length - 1]);
        } else {
            reset(); // Should not happen, but as a fallback
        }
    };

    const handleSend = () => {
        setMessage(''); // Clear previous message
        
        // Global navigation
        if (input === '00') {
            reset();
            setInput('');
            return;
        }
        if (input === '0' && screen !== 'MAIN') {
            goBack();
            setInput('');
            return;
        }

        const processInput = (currentScreen: Screen) => {
            switch (currentScreen) {
                case 'MAIN':
                    if (input === '1') setMessage(`Current pool balance is KES ${totalPool.toLocaleString()}.`);
                    else if (input === '2') navigate('FILE_CLAIM_AMOUNT');
                    else if (input === '3') {
                        const claimsToVoteOn = group.claims.filter(c =>
                            c.status === ClaimStatus.PENDING_VOTE &&
                            c.memberId !== currentUserId &&
                            !c.votes.some(v => v.memberId === currentUserId)
                        );
                        if (claimsToVoteOn.length > 0) {
                            setVoteData({ claims: claimsToVoteOn, selectedClaim: null });
                            navigate('VOTE_LIST');
                        } else {
                            setMessage('There are no pending claims for you to vote on.');
                        }
                    } else if (input === '4') navigate('CONTRIBUTE_AMOUNT');
                    else if (input === '5') navigate('MY_CLAIMS_LIST');
                    else setMessage('Invalid option. Please try again.');
                    break;
                
                case 'CONTRIBUTE_AMOUNT':
                    const contribAmount = parseFloat(input);
                    if (!isNaN(contribAmount) && contribAmount > 0) {
                        setContributionAmount(contribAmount);
                        navigate('CONTRIBUTE_CONFIRM');
                    } else {
                        setMessage('Invalid amount. Please enter a positive number.');
                    }
                    break;
                
                case 'CONTRIBUTE_CONFIRM':
                    if (input === '1') {
                        onAddContribution(contributionAmount!, currentUserId);
                        setMessage(`Thank you! Your contribution of KES ${contributionAmount} has been recorded.`);
                        reset();
                    } else {
                        setMessage('Contribution cancelled.');
                        reset();
                    }
                    break;

                case 'MY_CLAIMS_LIST':
                    // This is a view-only screen, nav handled by global commands
                    setMessage('Invalid input. Enter 00 for Main Menu.');
                    break;

                case 'FILE_CLAIM_AMOUNT':
                    const amount = parseFloat(input);
                    if (!isNaN(amount) && amount > 0) {
                        setClaimData({ ...claimData, amount });
                        navigate('FILE_CLAIM_DESC');
                    } else {
                        setMessage('Invalid amount. Please enter a number.');
                    }
                    break;

                case 'FILE_CLAIM_DESC':
                    if (input.trim().length > 5) {
                        setClaimData({ ...claimData, description: input.trim() });
                        navigate('FILE_CLAIM_CONFIRM');
                    } else {
                        setMessage('Description is too short. Please provide more detail.');
                    }
                    break;
                case 'FILE_CLAIM_CONFIRM':
                    if (input === '1') {
                        setScreen('LOADING');
                        onFileClaim(claimData.description!, claimData.amount!, currentUserId)
                            .then(() => {
                                setMessage('Claim submitted successfully. It will be reviewed.');
                                reset();
                            })
                            .catch(() => {
                                setMessage('Error submitting claim. Please try again later.');
                                reset();
                            });
                    } else {
                        reset();
                    }
                    break;
                case 'VOTE_LIST':
                    const index = parseInt(input, 10) - 1;
                    if (index >= 0 && index < voteData.claims.length) {
                        setVoteData({ ...voteData, selectedClaim: voteData.claims[index] });
                        navigate('VOTE_CONFIRM');
                    } else {
                        setMessage('Invalid selection. Please try again.');
                    }
                    break;
                case 'VOTE_CONFIRM':
                     if (input === '1' || input === '2') {
                        const vote = input === '1' ? 'approve' : 'deny';
                        onVote(voteData.selectedClaim!.id, currentUserId, vote);
                        setMessage('Thank you for your vote.');
                        reset();
                    } else {
                        setMessage('Invalid option. Please enter 1 or 2.');
                    }
                    break;
            }
            setInput('');
        };
        processInput(screen);
    };
    
    const renderScreenContent = () => {
        let content = `Welcome, ${currentUser?.name || 'Member'}.\n`;
        content += message ? `\n${message}\n\n` : '';
        let navOptions = screen !== 'MAIN' ? '\n\n0. Back\n00. Main Menu' : '';

        switch (screen) {
            case 'LOADING':
                return 'Processing your request... Please wait.';
            case 'MAIN':
                content += 'Reply with:\n';
                content += '1. Check Pool Balance\n';
                content += '2. File a Claim\n';
                content += '3. Vote on Pending Claim\n';
                content += '4. Make Contribution\n';
                content += '5. My Claim Status';
                return content;
            case 'CONTRIBUTE_AMOUNT':
                return `Enter contribution amount (KES):${navOptions}`;
            case 'CONTRIBUTE_CONFIRM':
                content = `You are about to contribute KES ${contributionAmount}.\n\n`;
                content += `1. Confirm\n2. Cancel`;
                return content + navOptions;
             case 'MY_CLAIMS_LIST':
                const myClaims = group.claims.filter(c => c.memberId === currentUserId);
                if (myClaims.length === 0) {
                     content += 'You have not submitted any claims.';
                } else {
                    content += 'Your Claims:\n';
                    myClaims.forEach((claim, i) => {
                        const statusText = claim.status.replace('_', ' ');
                        content += `${i+1}. KES ${claim.amount} - ${statusText}\n`;
                    });
                }
                return content + navOptions;
            case 'FILE_CLAIM_AMOUNT':
                return `Please enter the claim amount (KES):${navOptions}`;
            case 'FILE_CLAIM_DESC':
                return `Amount: KES ${claimData.amount}\n\nPlease enter a brief description of the claim:${navOptions}`;
            case 'FILE_CLAIM_CONFIRM':
                content = `Confirm Claim:\nAmount: KES ${claimData.amount}\nDescription: ${claimData.description}\n\n`;
                content += '1. Confirm\n';
                content += '2. Cancel';
                return content + navOptions;
            case 'VOTE_LIST':
                content = 'Select a claim to vote on:\n';
                voteData.claims.forEach((claim, index) => {
                    const memberName = group.members.find(m => m.id === claim.memberId)?.name || 'Unknown';
                    content += `${index + 1}. ${memberName} - KES ${claim.amount}\n`;
                });
                return content + navOptions;
            case 'VOTE_CONFIRM':
                const claim = voteData.selectedClaim;
                if (!claim) return 'Error: No claim selected.';
                const memberName = group.members.find(m => m.id === claim.memberId)?.name || 'Unknown';
                content = `Vote on claim from ${memberName} for KES ${claim.amount}?\n`;
                content += `Reason: "${claim.description}"\n\n`;
                content += '1. Approve\n';
                content += '2. Deny';
                return content + navOptions;
            default:
                return 'An error occurred. Please restart.';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-sm m-4 border-2 border-slate-600">
                <div className="flex justify-between items-center p-4 border-b border-slate-600">
                    <h2 className="text-lg font-bold text-slate-200 flex items-center"><PhoneIcon className="h-5 w-5 mr-2"/>USSD Simulator</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4">
                    <div className="bg-slate-200 text-slate-900 font-mono text-sm p-4 rounded-md min-h-[16rem] whitespace-pre-wrap">
                        {renderScreenContent()}
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="mt-4 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-grow bg-slate-700 text-white px-3 py-2 border border-slate-500 rounded-md shadow-sm focus:ring-trip-green focus:border-trip-green"
                            placeholder="Enter selection..."
                            autoFocus
                            disabled={screen === 'LOADING'}
                        />
                        <Button type="submit" variant="primary" disabled={screen === 'LOADING'}>
                            Send
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default USSDSimulator;