
import React from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface HeaderProps {
    groupName: string;
}

const Header: React.FC<HeaderProps> = ({ groupName }) => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="h-8 w-8 text-teal-600" />
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">AI Risk Pool Manager</h1>
                        <p className="text-sm text-slate-500">{groupName}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
