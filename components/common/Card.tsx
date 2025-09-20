
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-white p-4 sm:p-5 rounded-lg shadow-sm ${className}`}>
            {children}
        </div>
    );
};

export default Card;
