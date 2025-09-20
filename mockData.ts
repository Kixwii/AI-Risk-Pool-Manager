
import { Group, ClaimStatus } from './types';

export const MOCK_GROUP: Group = {
    id: 'grp-boda-01',
    name: 'Kamukunji Boda Boda Association',
    members: [
        { id: 'mem-001', name: 'James Kariuki' },
        { id: 'mem-002', name: 'Asha Omar' },
        { id: 'mem-003', name: 'David Odhiambo' },
        { id: 'mem-004', name: 'Mary Wanjiru' },
        { id: 'mem-005', name: 'Peter Musyoka' },
    ],
    transactions: [
        { id: 'trans-1', memberId: 'mem-001', amount: 500, date: '2023-10-01T10:00:00Z', type: 'contribution' },
        { id: 'trans-2', memberId: 'mem-002', amount: 500, date: '2023-10-01T10:05:00Z', type: 'contribution' },
        { id: 'trans-3', memberId: 'mem-003', amount: 500, date: '2023-10-01T10:10:00Z', type: 'contribution' },
        { id: 'trans-4', memberId: 'mem-004', amount: 500, date: '2023-10-02T11:00:00Z', type: 'contribution' },
        { id: 'trans-5', memberId: 'mem-005', amount: 500, date: '2023-10-02T11:05:00Z', type: 'contribution' },
        { id: 'trans-6', memberId: 'mem-001', amount: 500, date: '2023-11-01T09:00:00Z', type: 'contribution' },
        { id: 'trans-7', memberId: 'mem-002', amount: 500, date: '2023-11-01T09:05:00Z', type: 'contribution' },
        { id: 'trans-8', memberId: 'mem-003', amount: 500, date: '2023-11-01T09:10:00Z', type: 'contribution' },
    ],
    claims: [
        {
            id: 'claim-1',
            memberId: 'mem-003',
            description: 'Minor accident, needed to replace a side mirror.',
            amount: 1500,
            date: '2023-10-15T14:00:00Z',
            status: ClaimStatus.PAID,
            aiAssessment: {
                recommendation: 'Approve',
                justification: 'Low amount, common type of repair for this group. Seems legitimate.',
            },
            votes: [
                { memberId: 'mem-001', vote: 'approve' },
                { memberId: 'mem-002', vote: 'approve' },
                { memberId: 'mem-004', vote: 'approve' },
            ],
        },
        {
            id: 'claim-2',
            memberId: 'mem-005',
            description: 'Puncture repair and new tube.',
            amount: 500,
            date: '2023-11-05T08:30:00Z',
            status: ClaimStatus.PENDING_VOTE,
            aiAssessment: {
                recommendation: 'Approve',
                justification: 'The claim amount is small and reasonable for the described issue. It aligns with typical minor operational costs for a boda boda.',
            },
            votes: [{ memberId: 'mem-002', vote: 'approve' }],
        },
    ],
};
