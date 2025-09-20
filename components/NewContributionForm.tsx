import React, { useState } from 'react';
import Button from './common/Button';

interface NewContributionFormProps {
    memberId: string;
    onSubmit: (amount: number, memberId: string) => void;
}

const NewContributionForm: React.FC<NewContributionFormProps> = ({ memberId, onSubmit }) => {
    const [amount, setAmount] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!isNaN(numericAmount) && numericAmount > 0) {
            onSubmit(numericAmount, memberId);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="contribution-amount" className="block text-sm font-medium text-gray-700">
                    Contribution Amount (KES)
                </label>
                <div className="mt-1">
                    <input
                        type="number"
                        id="contribution-amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-trip-green focus:border-trip-green"
                        placeholder="e.g., 500"
                        required
                    />
                </div>
            </div>
             <div className="pt-2">
                <Button type="submit" className="w-full" variant="primary">
                    Add Contribution
                </Button>
            </div>
        </form>
    );
};

export default NewContributionForm;