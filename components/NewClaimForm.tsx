import React, { useState } from 'react';
import Button from './common/Button';

interface NewClaimFormProps {
    memberId: string;
    onSubmit: (description: string, amount: number, memberId: string) => void;
}

const NewClaimForm: React.FC<NewClaimFormProps> = ({ memberId, onSubmit }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (description && !isNaN(numericAmount) && numericAmount > 0) {
            onSubmit(description, numericAmount, memberId);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Claim Amount (KES)
                </label>
                <div className="mt-1">
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-trip-green focus:border-trip-green"
                        placeholder="e.g., 2500"
                        required
                    />
                </div>
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Brief Description
                </label>
                <div className="mt-1">
                    <textarea
                        id="description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-trip-green focus:border-trip-green"
                        placeholder="e.g., Replaced a flat tire"
                        required
                    />
                </div>
            </div>
            <div className="pt-2">
                <Button type="submit" className="w-full" variant="primary">
                    Submit for AI Review
                </Button>
            </div>
        </form>
    );
};

export default NewClaimForm;