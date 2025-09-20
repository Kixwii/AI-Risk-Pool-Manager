import React from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface HeaderProps {
    groupName: string;
}

const Header: React.FC<HeaderProps> = ({ groupName }) => {
    return (
        <header className="bg-white shadow-md sticky top-0 z-10 border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="h-10 w-10 text-trip-green" />
                    <div>
                        <h1 className="text-xl font-bold text-trip-dark">AI Risk Pool Manager</h1>
                        <p className="text-sm text-gray-500">{groupName}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;