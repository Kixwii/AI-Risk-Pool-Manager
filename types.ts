
export enum ClaimStatus {
    PENDING_AI = 'PENDING_AI',
    PENDING_VOTE = 'PENDING_VOTE',
    APPROVED = 'APPROVED',
    DENIED = 'DENIED',
    PAID = 'PAID',
}

export enum FundHealthStatus {
    HEALTHY = 'Healthy',
    STABLE = 'Stable',
    AT_RISK = 'At Risk',
    UNKNOWN = 'Unknown'
}

export interface Member {
    id: string;
    name: string;
}

export interface Transaction {
    id: string;
    memberId: string;
    amount: number;
    date: string;
    type: 'contribution' | 'payout';
}

export interface AIAssessment {
    recommendation: 'Approve' | 'Deny' | 'Needs Review';
    justification: string;
}

export interface Claim {
    id: string;
    memberId: string;
    description: string;
    amount: number;
    date: string;
    status: ClaimStatus;
    aiAssessment: AIAssessment | null;
    votes: { memberId: string; vote: 'approve' | 'deny' }[];
}

export interface Group {
    id: string;
    name: string;
    members: Member[];
    transactions: Transaction[];
    claims: Claim[];
}

export interface FundHealth {
    status: FundHealthStatus;
    analysis: string;
}
