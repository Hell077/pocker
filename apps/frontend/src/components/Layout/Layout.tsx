import React from 'react';
import Header from '../header/header';
import Footer from '../footer/footer';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <>
            <Header
                username="Guest"
                avatarUrl="/cards/back.png"
                balance={0}
            />
            <main style={{
                maxWidth: '1440px',
                margin: '0 auto',
                padding: '60px 16px',
                minHeight: 'calc(100vh - 160px)',
                boxSizing: 'border-box',
            }}>
                {children}
            </main>
            <Footer />
        </>
    );
};

export default Layout;
